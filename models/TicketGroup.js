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
        unique: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Create a compound index on subGroup.name and the TicketGroup._id to ensure uniqueness within each group
// TicketGroupSchema.index({ 'subGroup.name': 1, '_id': 1 }, { unique: true });

const TicketGroup = mongoose.model("TicketGroup", TicketGroupSchema);

module.exports = TicketGroup;