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
        inquiryCategory: {
            type: String
        },
        subCategory1: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Disable _id for ticketTypes field
TicketGroupSchema.path('ticketTypes').schema.set('_id', false);

const TicketGroup = mongoose.model("TicketGroup", TicketGroupSchema);

module.exports = TicketGroup;