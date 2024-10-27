const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');
const secret = process.env.SECRET || 'some other secret as default';

require('dotenv').config();

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ username, password });
        await newUser.save();
        
        logger(`User registered: ${username}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).select("+password");
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const payload = {
            id: user._id,
            username: user.username
        };
    
        token = await jwt.sign(payload, secret, { expiresIn: 36000 });

        if (!token) {
            return res.status(500)
                .json({ error: "Error signing token",
                    raw: err });
        }

        logger(`User logged in: ${username}`);

        return res.json({
        success: true,
        token: `Bearer ${token}` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
