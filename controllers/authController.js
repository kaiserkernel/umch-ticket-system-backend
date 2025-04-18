const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const logger = require("../utils/logger");
const axios = require("axios");

require("dotenv").config();

const secret = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    enrollmentNumber,
    firstYearOfStudy,
    recaptChatoken
  } = req.body;

  // Validate reCAPTCHA
  try {
    const recaptchaResponse = await verifyRecaptchaToken(recaptChatoken);

    if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
      return res.status(403).json({
        success: false,
        errors: "ReCAPTCHA verification failed. Please try again.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error verifying reCAPTCHA." });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }


  if (role === "2" && (!enrollmentNumber || !firstYearOfStudy)) {
    return res.status(400).json({
      message:
        "Enrollment number and first year of study are required for students."
    });
  }

  try {
    let existingUser;

    // Check uniqueness based on role
    if (role === "2") {
      existingUser = await User.findOne({ enrollmentNumber });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ errors: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      enrollmentNumber: role === "2" ? enrollmentNumber : undefined,
      firstYearOfStudy: role === "2" ? firstYearOfStudy : undefined,
      avatar: req.file
        ? `/uploads/images/avatar/${req.file.filename}`
        : undefined
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password, enrollmentNumber, recaptChatoken } = req.body;
console.log(email, 'email')
  // Validate reCAPTCHA
  // try {
  //   const recaptchaResponse = await verifyRecaptchaToken(recaptChatoken);
  //   if (!recaptchaResponse.success || recaptchaResponse.score < 0.5) {
  //     return res.status(403).json({
  //       success: false,
  //       errors: "ReCAPTCHA verification failed. Please try again.",
  //     });
  //   }
  // } catch (error) {
  //   return res.status(500).json({ message: "Error verifying reCAPTCHA." });
  // }

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne(
      email ? { email } : { enrollmentNumber }
    ).select("+password");

    if (!user) {
      if (email) return res.status(401).json({ message: "Invalid email" });
      if (enrollmentNumber)
        return res.status(401).json({ message: "Invalid enrollment number" });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (email && user.role !== 0) {
      return res.status(403).json({ message: "Access forbidden: Admins only" });
    }
    const payload = { id: user._id, email: user.email, role: user.role };

    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    if (!token) return res.status(500).json({ error: "Error signing token" });

    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enrollmentNumber: user.enrollmentNumber,
      role: user.role,
      position: user.position,
      title: user?.title,
      firstYearOfStudy: user.firstYearOfStudy,
      avatar: user.avatar
    };

    return res.json({
      success: true,
      token: `Bearer ${token}`,
      userData: userData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyRecaptchaToken = async (_recaptchaToken) => {

  try {
    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", new URLSearchParams({
      secret: process.env.SECRET_KEY,
      response: _recaptchaToken,
    }));

    return response.data; // This will contain the result from Google's reCAPTCHA verification
  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    throw new Error("reCAPTCHA verification failed");
  }
}