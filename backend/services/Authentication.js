const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const privateKey = process.env.PRIVATE_KEY || "showtime_secret_key_jwt";

const User = require("../models/User");
const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const generateToken = (user) => {
  const expiresIn = process.env.TOKEN_EXPIRATION || "1h";

  const token = jwt.sign({ user }, privateKey, { expiresIn });

  return token;
};

const findUser = async (user) => {
  if (!user || (!user.username && !user.email)) return null;

  let searchParams = {};
  if (user.username)
    searchParams.username = { $regex: new RegExp(`^${user.username}$`, "i") };
  if (user.email)
    searchParams.email = { $regex: new RegExp(`^${user.email}$`, "i") };

  const foundUser = await User.findOne(searchParams);
  return foundUser;
};

const createUser = async (user) => {
  const { username, password, firstName, lastName, email, role } = user;

  let foundUser = await findUser({ username });
  if (foundUser)
    return { status: 400, message: "Username is already taken" };

  foundUser = await findUser({ email });
  if (foundUser) return { status: 400, message: "Email is already taken" };

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    email,
    role,
  });
  const savedUser = await newUser.save();

  return { status: 200, user: savedUser };
};

exports.createUser = createUser;

exports.login = async (req, res) => {
  console.log("POST /authentication/login");
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username/Email and Password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is connecting or unreachable. Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access.",
      });
    }

    const trimmedIdentifier = username.trim();
    const safeRegex = trimmedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let token = null;

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp("^" + safeRegex + "$", "i") } },
        { email: { $regex: new RegExp("^" + safeRegex + "$", "i") } },
      ],
    });
    console.log("USER:", user ? user.username : "Not found");

    if (user) {
      console.log("CHECK CREDENTIALS");
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        token = generateToken({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        });
        console.log("TOKEN GENERATED");
      }
    }

    if (token) {
      return res
        .cookie("auth_token", token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        });
    }
    return res.status(401).json({ message: "Invalid username/email or password" });
  } catch (err) {
    console.error("Login error:", err);
    let errorMessage = "An error occurred during login. Please try again.";
    if (
      err.name === "MongooseServerSelectionError" ||
      (err.message && (err.message.includes("SSL alert number 80") || err.message.includes("whitelist")))
    ) {
      errorMessage = "Database connection error: Current IP is not whitelisted in MongoDB Atlas Network Access.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
};

exports.logout = async (req, res) => {
  return res.clearCookie("auth_token").sendStatus(200);
};

exports.register = async (req, res) => {
  console.log("POST /authentication/register");
  try {
    const { username, password, firstName, lastName, email } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is connecting or unreachable. Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access.",
      });
    }

    const newUserRes = await createUser({
      username,
      password,
      firstName,
      lastName,
      email,
      role: ROLES.USER,
    });

    if (newUserRes.status !== 200)
      return res
        .status(newUserRes.status)
        .json({ message: newUserRes.message });

    const userInfo = {
      username: newUserRes.user.username,
      firstName: newUserRes.user.firstName,
      lastName: newUserRes.user.lastName,
      email: newUserRes.user.email,
      role: newUserRes.user.role,
    };

    token = generateToken(userInfo);

    console.log("TOKEN:", token);

    return res
      .cookie("auth_token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ user: userInfo });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: err.message || err._message || "Registration failed" });
  }
};

exports.authorization = (roles) => {
  return (req, res, next) => {
    try {
      console.log("AUTH");
      const token = req.cookies.auth_token;
      console.log("REQ.COOKIE", req.cookies);

      console.log("CHECK AUTHORIZATION TOKEN", token);
      if (!token) return res.sendStatus(403);

      const data = jwt.verify(token, privateKey);

      req.user = data.user;
      console.log("REQ.USER", req.user);

      if (!Array.isArray(roles)) {
        if ((roles && req.user.role === roles) || (!roles && req.user))
          return next();
      } else {
        let foundRole = false;
        roles.forEach((role) => {
          if (role === req.user.role) return (foundRole = true);
        });
        if (foundRole) return next();
      }

      return res.sendStatus(403);
    } catch (err) {
      console.log(err);
      if (err.name === "TokenExpiredError")
        return res.clearCookie("auth_token").status(401).json({
          message: "Token expired. Authorization denied.",
          tokenExpired: true,
        });
      return res.sendStatus(403);
    }
  };
};

exports.update = async (req, res) => {
  try {
    const userCookie = req.user;
    const update = req.body;
    console.log("UPDATE USER", userCookie);
    console.log("UPDATED USER", update);

    const user = await findUser({ username: userCookie.username });
    console.log("FOUND USER", user);
    if (!user)
      return res.status(400).json({ message: "User not found" });

    console.log("update.username", update.username);
    const test = await findUser({ username: update.username });
    console.log("test", test);
    if (user.username !== update.username && test)
      return res
        .status(400)
        .json({ message: "Username is already taken" });

    if (
      user.email !== update.email &&
      (await findUser({ email: update.email }))
    )
      return res.status(400).json({ message: "Email is already taken" });

    user.firstName = update.firstName;
    user.lastName = update.lastName;
    user.username = update.username;
    user.email = update.email;

    if (update.password && update.password.length > 0)
      user.password = await bcrypt.hash(update.password, saltRounds);

    const savedUser = await user.save();
    const userInfo = {
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
    };

    token = generateToken(userInfo);

    return res
      .cookie("auth_token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ user: userInfo });
  } catch (err) {
    console.log(err);
    return res.sendStatus(403);
  }
};
