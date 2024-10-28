const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/form');
const path = require('path');
const setupSwagger = require('./swagger/swagger');
dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: '*', // Specify origin if needed (e.g., 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true, // Use true if sending cookies or auth headers is necessary
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/form', formRoutes);

setupSwagger(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
