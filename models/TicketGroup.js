const mongoose = require("mongoose");

const TicketGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        required: true,
        unique: true
    },
    ticketTypes: [{
        type: String,
        required: false,
        unique: false
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const TicketGroup = mongoose.model("TicketGroup", TicketGroupSchema);

module.exports = TicketGroup;