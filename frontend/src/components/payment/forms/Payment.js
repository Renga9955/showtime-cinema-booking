import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  CheckCircleFill,
  XCircleFill,
} from "react-bootstrap-icons";
import { BACKEND_URL } from "../../../constants";
import CheckoutForm from "./CheckoutForm";
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../ui/LoadingSpinner";
import styles from "./Payment.module.css";

const Payment = ({ cart, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetch } = useFetch();

  const [activeTab, setActiveTab] = useState("demo"); // "demo" | "stripe"
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [hasStripe, setHasStripe] = useState(false);
  const [stripeError, setStripeError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulationError, setSimulationError] = useState(null);
  const [simulatedAction, setSimulatedAction] = useState(null);

  // Check whether Stripe is configured in backend
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await fetch.get(`${BACKEND_URL}/payment/config`);
        const publicKey = res?.data?.publicKey;
        if (publicKey && publicKey.trim() !== "" && isMounted) {
          setHasStripe(true);
          setStripePromise(loadStripe(publicKey));
        }
      } catch (e) {
        // Stripe config error is silently skipped in demo mode
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [fetch]);

  // If user switches to Stripe tab and Stripe is configured, fetch client secret
  useEffect(() => {
    if (activeTab !== "stripe" || !hasStripe || !cart) return;
    let isMounted = true;
    const fetchClientSecret = async () => {
      try {
        const res = await fetch.post(
          `${BACKEND_URL}/payment/create-payment-intent`,
          cart
        );
        const secret = res?.data?.clientSecret;
        if (isMounted) {
          if (!secret) setStripeError(true);
          else setClientSecret(secret);
        }
      } catch (e) {
        if (isMounted) setStripeError(true);
      }
    };
    fetchClientSecret();
    return () => {
      isMounted = false;
    };
  }, [activeTab, hasStripe, cart, fetch]);

  // Derived booking summary details
  const movieTitle =
    cart?.screening?.scheduledScreening?.movie?.title || "Movie";
  const cinemaTitle =
    cart?.screening?.scheduledScreening?.cinema?.title || "Cinema";
  const screeningTime =
    cart?.screening?.scheduledScreening?.time || "";
  const formattedDate = useMemo(() => {
    if (!cart?.screening?.date) return screeningTime;
    const dateObj = new Date(cart.screening.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return screeningTime ? `${dateStr}, ${screeningTime}` : dateStr;
  }, [cart?.screening?.date, screeningTime]);

  const tickets = useMemo(() => cart?.tickets || [], [cart]);

  const totalPrice = useMemo(() => {
    return tickets.reduce((acc, seat) => acc + (seat.type?.price || 0), 0);
  }, [tickets]);

  const customerName = useMemo(() => {
    if (cart?.customer?.name && cart.customer.name.trim() !== "") {
      return cart.customer.name.trim();
    }
    if (user) {
      const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      return full || user.username || "Customer";
    }
    return "Guest Customer";
  }, [cart, user]);

  const customerEmail = useMemo(() => {
    return cart?.customer?.email || user?.email || "guest@showtime.local";
  }, [cart, user]);

  if (!cart) {
    return (
      <div className="text-center py-4">
        <h5 className="text-muted">No cart data found.</h5>
      </div>
    );
  }

  const handleSimulatePayment = async (simulateSuccess) => {
    setIsSubmitting(true);
    setSimulationError(null);
    setSimulatedAction(simulateSuccess ? "success" : "failure");

    const payload = {
      cart: {
        ...cart,
        customer: {
          name: customerName,
          email: customerEmail,
        },
      },
      simulateSuccess,
    };

    try {
      const res = await fetch.post(
        `${BACKEND_URL}/payment/demo-checkout`,
        payload
      );

      if (res && res.status === 200 && res.success) {
        localStorage.removeItem("cart");
        if (onClose) onClose();
        const redirectUrl =
          res.data?.redirectUrl ||
          `/ticketshop/payment/completion?redirect_status=succeeded&payment_intent=demo_${res.data?.orderId}`;
        navigate(redirectUrl);
      } else {
        const errorMsg =
          res?.message ||
          (simulateSuccess
            ? "Simulation could not be completed. Please check your network connection."
            : "Demo Payment Simulation: Transaction was declined by the simulated payment provider.");
        setSimulationError(errorMsg);
      }
    } catch (err) {
      setSimulationError(
        err.message || "An unexpected error occurred during payment simulation."
      );
    } finally {
      setIsSubmitting(false);
      setSimulatedAction(null);
    }
  };

  return (
    <div className={styles.container}>
      {hasStripe && (
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabItem} ${
              activeTab === "demo" ? styles.tabItemActive : ""
            }`}
            onClick={() => setActiveTab("demo")}
          >
            Demo Mode
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${
              activeTab === "stripe" ? styles.tabItemActive : ""
            }`}
            onClick={() => setActiveTab("stripe")}
          >
            Credit Card (Stripe)
          </button>
        </div>
      )}

      {activeTab === "demo" && (
        <>
          <div className={styles.demoBanner}>
            <div className={styles.bannerHeader}>
              <span className={styles.demoBadge}>DEMO MODE</span>
              <span className={styles.bannerTitle}>
                No real money will be charged
              </span>
            </div>
            <p className={styles.bannerText}>
              Simulate the complete cinema booking flow. A successful simulation
              validates seat availability, saves a confirmed ticket in MongoDB,
              and generates a scannable QR code.
            </p>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>Booking Summary</div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Movie:</span>
              <span className={styles.summaryValue}>{movieTitle}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Cinema:</span>
              <span className={styles.summaryValue}>{cinemaTitle}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Date & Time:</span>
              <span className={styles.summaryValue}>{formattedDate}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Customer:</span>
              <span className={styles.summaryValue}>
                {customerName} ({customerEmail})
              </span>
            </div>

            <div className="mt-2 mb-2">
              <div className={styles.summaryLabel}>
                Selected Seats ({tickets.length}):
              </div>
              <div className={styles.seatList}>
                {tickets.map((seat, idx) => (
                  <span key={idx} className={styles.seatBadge}>
                    Row {seat.row + 1}, Col {seat.col + 1} &bull;{" "}
                    {seat.type?.title || "Standard"} ({seat.type?.price || 0}€)
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Amount:</span>
              <span className={styles.totalPrice}>{totalPrice}€</span>
            </div>
          </div>

          {simulationError && (
            <div className={styles.errorBox}>
              <div className={styles.errorTitle}>
                <XCircleFill /> Payment Simulation Declined
              </div>
              <div className={styles.errorMessage}>{simulationError}</div>
              <p className={styles.errorFooter}>
                No ticket was created and seats remain unreserved. You may retry
                with a successful payment simulation below.
              </p>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.successBtn}
              disabled={isSubmitting}
              onClick={() => handleSimulatePayment(true)}
            >
              {isSubmitting && simulatedAction === "success" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Processing Demo Payment...
                </>
              ) : (
                <>
                  <CheckCircleFill /> Simulate Successful Payment
                </>
              )}
            </button>

            <button
              type="button"
              className={styles.failedBtn}
              disabled={isSubmitting}
              onClick={() => handleSimulatePayment(false)}
            >
              {isSubmitting && simulatedAction === "failure" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Simulating Declined Payment...
                </>
              ) : (
                <>
                  <XCircleFill /> Simulate Failed Payment
                </>
              )}
            </button>
          </div>
        </>
      )}

      {activeTab === "stripe" && (
        <>
          {stripeError && (
            <div className="alert alert-danger">
              Error connecting to payment provider. Please use Demo Mode.
            </div>
          )}
          {!stripeError && stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          )}
          {!stripeError && (!stripePromise || !clientSecret) && (
            <LoadingSpinner />
          )}
        </>
      )}
    </div>
  );
};

export default Payment;