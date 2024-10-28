const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const logger = require("../utils/logger");
const secret = process.env.SECRET || "some other secret as default";

require("dotenv").config();

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    role,
    enrollmentNumber,
    firstYearOfStudy,
  } = req.body;

  if (role === 2 && (!enrollmentNumber || !firstYearOfStudy)) {
    return res
      .status(400)
      .json({
        message:
          "Enrollment number and first year of study are required for students.",
      });
  }

  console.log(typeof role);
  if (![0, 1, 2].includes(Number(role))) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      enrollmentNumber: role === 2 ? enrollmentNumber : undefined,
      firstYearOfStudy: role === 2 ? firstYearOfStudy : undefined,
      avatar: req.file
        ? `/uploads/images/avatar/${req.file.filename}`
        : undefined,
    });

    await newUser.save();
    logger(`User registered: ${email}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "No such User" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const payload = {
      id: user._id,
      email: user.email,
    };

    token = await jwt.sign(payload, secret, { expiresIn: 3600 });

    if (!token) {
      return res.status(500).json({ error: "Error signing token", raw: err });
    }

    logger(`User logged in: ${email}`);

    return res.json({
      success: true,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
