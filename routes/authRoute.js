const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Signup = require("../models/authModal");
const router = express.Router();

const JWT_SECRET = process.env.SECRET_KEY || "devBishu";
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET_KEY || "knowall";

const ADMIN_EMAIL = "admin123@gmail.com";

const createAdminIfNotExist = async () => {
  // Check if the admin already exists
  const adminExists = await Signup.findOne({ email: ADMIN_EMAIL });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new Signup({
      name: "Super Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin user created.");
  }
};
createAdminIfNotExist();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    const userExist = await Signup.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Email already exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const signup = new Signup({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
    });

    await signup.save();

    res.status(201).json({
      message: "Signup successfully.",
      id: signup._id,
      name: signup.name,
      role: signup.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Signup.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password not correct." });
    }

    if (user.email === ADMIN_EMAIL) {
      user.role = "admin"; // Automatically assign super admin to the admin
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2d",
    });

    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      refreshToken,
      id: user._id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed." });
  }
});

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.cookies;

  // Check if refresh token is present
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Find the user based on the decoded userId from the refresh token
    const user = await Signup.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Generate a new access token (JWT)
    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "2d" }
    );

    const newRefreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d", // Refresh token expires in 7 days
    });

    // Respond with the new access token
    res.status(200).json({
      message: "New access token generated.",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
});

router.get("/profile", async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required." });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // If token is valid, find the user based on the decoded user ID
    const user = await Signup.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Respond with the user profile
    res.status(200).json({
      message: "User profile fetched successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    // Check if the error is related to token verification
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token." });
    }
    // Check if the error is related to token expiration
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired." });
    }
    // Handle other errors
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
