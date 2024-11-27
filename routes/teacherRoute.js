const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacherModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.SECRET_KEY || "devBishiu";

router.post("/signup", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the email is already in use
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Teacher
    const teacher = new Teacher({
      name,
      email,
      mobile,
      password: hashedPassword,
    });
    await teacher.save();

    res.status(201).json({ message: "Teacher registered successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find the Teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: teacher._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        role:"teacher"
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
