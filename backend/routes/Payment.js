const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const privateKey = process.env.PRIVATE_KEY || "showtime_secret_key_jwt";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? require("stripe")(stripeKey) : null;
const Screening = require("../models/Screening");
const Ticket = require("../models/Ticket");
const Order = require("../models/Order");

const { transformAmount } = require("../services/TransformNumber");
const {
  checkSeatAvailability,
  getSeats,
} = require("../services/ScreeningValidation");
const { createDatetime } = require("../services/Datetime");
const { sendTicket } = require("../services/Tickets");
const { createQRCodeSVG, createQRCodeFile } = require("../services/QRCode");
const User = require("../models/User");

// BASIC URL /payment

router.get("/config", (req, res) => {
  res.status(200).json({
    data: {
      publicKey: process.env.STRIPE_PUBLIC_KEY || null,
      demoMode: true,
    },
  });
});

router.post("/demo-checkout", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message:
          "Database is connecting or unreachable. Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access.",
      });
    }

    const { cart, simulateSuccess = true } = req.body;

    if (!cart || !cart.screening || !cart.screening._id) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart data: Screening details are required.",
      });
    }

    if (!cart.tickets || !Array.isArray(cart.tickets) || cart.tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats selected in cart.",
      });
    }

    if (!cart.customer || !cart.customer.email || !cart.customer.name) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required to complete checkout.",
      });
    }

    const screening = await Screening.findById(cart.screening._id)
      .populate("scheduledScreening")
      .populate({ path: "scheduledScreening", populate: { path: "cinema" } })
      .populate({
        path: "scheduledScreening",
        populate: { path: "cinema", populate: { path: "map.rows.type" } },
      })
      .populate({
        path: "scheduledScreening",
        populate: { path: "movie" },
      });

    if (!screening) {
      return res.status(400).json({
        success: false,
        message: "Screening does not exist.",
      });
    }

    // Get seats from cinema layout
    const seats = getSeats(
      screening.scheduledScreening.cinema.map.rows,
      cart.tickets
    );

    if (!seats || seats.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "Selected seats do not exist in the cinema layout.",
      });
    }

    // Validate seat availability
    const available = checkSeatAvailability(screening.bookedSeats, seats);
    if (!available) {
      return res.status(400).json({
        success: false,
        message: "One or more selected seats have already been booked. Please choose different seats.",
      });
    }

    // If simulating failed payment, exit early without creating order or booking seats
    if (simulateSuccess === false) {
      return res.status(400).json({
        success: false,
        message: "Demo Payment Simulation: Transaction was declined by the simulated payment provider.",
      });
    }

    // 1. Create and save completed Order
    const order = new Order({
      screening: screening._id,
      customer: {
        name: cart.customer.name.trim(),
        email: cart.customer.email.trim(),
      },
      seats: seats.map((seat) => ({
        row: seat.row,
        col: seat.col,
        type: seat.type._id || seat.type,
      })),
      completed: true,
    });
    const savedOrder = await order.save();

    // 2. Create Ticket
    const screeningDate = new Date(screening.date);
    const datetime = createDatetime(
      screeningDate,
      screening.scheduledScreening.time
    );

    const ticket = new Ticket({
      customer: {
        name: cart.customer.name.trim(),
        email: cart.customer.email.trim(),
      },
      datetime,
      seats: seats.map((seat) => ({
        row: seat.row,
        col: seat.col,
        type: seat.type._id || seat.type,
      })),
      screening: screening._id,
    });
    let savedTicket = await ticket.save();

    // Generate QR Code SVG for ticket validation
    try {
      const codeSVG = createQRCodeSVG(savedTicket.id);
      ticket.codeSVG = codeSVG;
      savedTicket = await ticket.save();
    } catch (qrErr) {
      console.log("QR SVG notice:", qrErr.message);
    }

    // Dispatch ticket email (non-blocking in demo mode)
    try {
      const codeFile = await createQRCodeFile(savedTicket.id);
      sendTicket({
        id: savedTicket.id,
        customer: ticket.customer,
        datetime,
        seats,
        screening,
        code: codeFile,
      });
    } catch (mailErr) {
      console.log("Demo ticket email dispatch skipped:", mailErr.message);
    }

    // 3. Associate Ticket with authenticated user (via cookie or email)
    try {
      let targetUser = null;
      if (req.cookies && req.cookies.auth_token) {
        try {
          const decoded = jwt.verify(req.cookies.auth_token, privateKey);
          if (decoded && decoded.user) {
            targetUser = await User.findById(decoded.user._id || decoded.user.id);
          }
        } catch (_) {}
      }

      if (!targetUser) {
        targetUser = await User.findOne({
          email: { $regex: new RegExp("^" + ticket.customer.email.trim() + "$", "i") },
        });
      }

      if (targetUser) {
        targetUser.tickets.push(savedTicket._id);
        await targetUser.save();
        console.log(`Demo ticket ${savedTicket._id} linked to user ${targetUser.email}`);
      }
    } catch (userErr) {
      console.log("User link notice:", userErr.message);
    }

    // 4. Update booked seats on Screening
    const bookedSeats = seats.map((seat) => ({
      col: seat.col,
      row: seat.row,
    }));
    screening.bookedSeats = [...screening.bookedSeats, ...bookedSeats];
    await screening.save();

    return res.status(200).json({
      success: true,
      message: "Demo payment successful. Booking and ticket created in MongoDB.",
      data: {
        orderId: savedOrder._id,
        ticketId: savedTicket._id,
        redirectUrl: `/ticketshop/payment/completion?redirect_status=succeeded&payment_intent=demo_${savedOrder._id}`,
      },
    });
  } catch (err) {
    console.error("Demo checkout error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "An unexpected error occurred during demo checkout.",
    });
  }
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).send({
        message: "Stripe is not configured. Please use Demo Payment Mode.",
      });
    }
    const cart = req.body;
    // console.log("CART", cart);

    const screening = await Screening.findById(cart.screening._id)
      .populate("scheduledScreening")
      .populate({ path: "scheduledScreening", populate: { path: "cinema" } })
      .populate({
        path: "scheduledScreening",
        populate: { path: "cinema", populate: { path: "map.rows.type" } },
      });
    // console.log("SCREENING", screening);
    if (!screening)
      return res.status(400).send({
        message: "Screening does not exist",
      });

    // Get seats from screening
    let seats = getSeats(
      screening.scheduledScreening.cinema.map.rows,
      cart.tickets
    );
    if (seats.length <= 0)
      return res.status(400).send({
        message: "Seats do not exist",
      });
    console.log("SEATS", seats);

    // Check whether tickets are available
    const available = checkSeatAvailability(screening.bookedSeats, seats);
    if (!available)
      return res.status(400).send({
        message: "Seat has already been booked",
      });

    // Sum up seat prices
    const prices = seats.reduce((acc, seat) => acc + seat.type.price, 0);
    // console.log("PRICES", prices);
    const amount = transformAmount(prices);
    console.log("AMOUNT", amount);

    // Create Order for seats
    // console.log("SEATS",seats);
    const order = new Order({
      screening: cart.screening,
      customer: cart.customer,
      seats,
    });
    const savedOrder = await order.save();

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount,
      metadata: {
        // screening_id: cart.screening._id,
        order_id: savedOrder.id,
        // customer_name: cart.customer.name,
        // customer_mail: cart.customer.email,
      },
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.status(200).json({
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      message: e.message,
    });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("POST /payment/webhook");
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_ENDPOINT_SECRET
      );

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntentSucceeded = event.data.object;
          const metadata = paymentIntentSucceeded.metadata;
          console.log("PAYMENT SUCCESSFUL");

          // Get metadata from payment
          const { order_id } = metadata;
          const order = await Order.findById(order_id).populate("seats.type");

          const seats = order.seats;
          const customer = order.customer;
          const screening_id = order.screening;

          // Get screening
          const screening = await Screening.findById(screening_id)
            .populate("scheduledScreening")
            .populate({
              path: "scheduledScreening",
              populate: { path: "cinema" },
            })
            .populate({
              path: "scheduledScreening",
              populate: { path: "movie" },
            });

          // Create Ticket
          const datetime = createDatetime(
            screening.date,
            screening.scheduledScreening.time
          );
            console.log("REQ.DATE",screening.date);
            console.log("REQ.TIME",screening.scheduledScreening.time);
            console.log("DATETIME",datetime);

          const ticket = new Ticket({
            customer,
            datetime,
            seats,
            screening,
          });
          let savedTicket = await ticket.save();
          const codeSVG = createQRCodeSVG(savedTicket.id);
          ticket.codeSVG = codeSVG;
          savedTicket = await ticket.save();

          // Send ticket
          const codeFile = await createQRCodeFile(savedTicket.id);
          sendTicket({
            id: savedTicket.id,
            customer,
            datetime,
            seats,
            screening,
            code: codeFile,
          });

          // Add ticket to user
          const user = await User.findOne({ email: customer.email });
          if (user) {
            user.tickets.push(savedTicket);
            await user.save();
          }

          // Complete order
          order.completed = true;
          await order.save();
          // await Order.findByIdAndRemove(order_id);

          // Add booked seats
          const bookedSeats = seats.map((seat) => ({
            col: seat.col,
            row: seat.row,
          }));
          screening.bookedSeats = [...screening.bookedSeats, ...bookedSeats];
          await screening.save();

          break;
        default:
        // console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 respond to acknowledge receipt of the event
      res.sendStatus(200);
    } catch (err) {
      console.log("WEBHOOK ERROR", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  }
);

module.exports = router;
