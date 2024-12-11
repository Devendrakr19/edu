const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Signup = require("../models/authModal");
const router = express.Router();

const OTP_EXP_TIME = 10 * 60 * 1000;
const otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com", // Elastic Email SMTP server
  port: 587, // Use port 587 for TLS (recommended)
  secure: false, // Use TLS (don't set it to 'true' for port 587)
  auth: {
    user: "devendraku18956@gmail.com",
    pass: process.env.ELASTIC_EMAIL_KEY,
  },
});

router.post("/request-otp", async (req, res) => {
  const { email } = req.body;

  const user = await Signup.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const otp = crypto.randomInt(1000, 9999); // Generates a 4-digit OTP

  otpStore[email] = {
    otp: otp,
    expiresAt: Date.now() + OTP_EXP_TIME,
  };

  const mailOptions = {
    from: "devendraku18956@gmail.com", // Sender address
    to: email, // List of recipients
    subject: "Password Reset OTP",
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res
      .status(400)
      .json({ message: "No OTP request found for this email." });
  }

  const storedOTP = otpStore[email];

  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[email]; // Remove expired OTP
    return res.status(400).json({ message: "OTP has expired." });
  }

  if (storedOTP.otp !== parseInt(otp)) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  delete otpStore[email];

  res.status(200).json({
    message: "OTP verified successfully. You can now reset your password.",
  });
});

router.post("/reset-password", async (req, res) => {
  const { newPassword } = req.body;

  const email = Object.keys(otpStore)[0];

  if (!email || !otpStore[email]) {
    return res.status(400).json({ message: "Invalid or expired OTP session. Please request a new OTP." });
  }

  const user = await Signup.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  delete otpStore[email]; 

  res.status(200).json({ message: "Password reset successfully." });
});

module.exports = router;
