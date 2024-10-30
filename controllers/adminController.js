const { validationResult } = require("express-validator");
const User = require("../models/User");
const { sendEmail } = require('../services/mailjetService');

const positionNames = process.env.POSITION_NAMES;

require("dotenv").config();

const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

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
    await sendEmail(email, email, 'New Role Assigned', 'You have been assigned a new role.', emailContent);

    res.status(201).json({ message: 'Role created successfully, confirmation email sent.' });
  
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: 'Server error' });
    }
 
};

module.exports = { createRole, getUsers };