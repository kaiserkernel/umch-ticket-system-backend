const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    ticketNumber: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);
