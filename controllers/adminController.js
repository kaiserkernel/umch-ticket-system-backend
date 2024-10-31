const { validationResult } = require("express-validator");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const { sendEmail } = require('../services/mailjetService');

require("dotenv").config();
const positionNames = process.env.POSITION_NAMES.split(',');

// Get all users
const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// create a now role
const createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {firstName, lastName, email, password, role, position } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        position
      });
  
      await newUser.save();
      console.log(positionNames[0])
  
      const emailContent = `
      <h3>You have been assigned a new role!</h3>
      <p>Here are your account details:</p>
      <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Role:</strong> admin</li>
          <li><strong>Position:</strong> ${positionNames[position]}</li>
      </ul>
      <p>You can log in with these credentials.</p>
    `;

    // Send the confirmation email
    await sendEmail(email, email, 'You are invited as a manager of UMCH ticket system!', 'Welcome ! Now you are in a xxxx role in UMCH ticket system!', emailContent);

    res.status(201).json({ message: 'Role created successfully, confirmation email sent.' });
  
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: 'Server error' });
    }
 
};

// Get all received inquiries
const getReceivedInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ status: 0 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries', error });
  }
};

// Accept an inquiry
const acceptInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: 1 }, { new: true });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ message: 'Inquiry accepted', inquiry });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting inquiry', error });
  }
};

// Reject an inquiry
const rejectInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: 2 }, { new: true });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ message: 'Inquiry rejected', inquiry });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting inquiry', error });
  }
};

module.exports = { createRole, getUsers, getReceivedInquiries, acceptInquiry, rejectInquiry };