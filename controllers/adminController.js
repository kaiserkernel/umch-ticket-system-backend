const { validationResult } = require("express-validator");
const User = require("../models/User");
const { sendEmail } = require('../services/mailjetService');

const secret = process.env.SECRET || "some other secret as default";

require("dotenv").config();

exports.createRole = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {firstName, lastName, email, password, role } = req.body;
  
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
      });
  
      await newUser.save();
  
      const roleNames = ["admin", "teacher"];

      const emailContent = `
      <h3>You have been assigned a new role!</h3>
      <p>Here are your account details:</p>
      <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Role:</strong> ${roleNames[role]}</li>
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

