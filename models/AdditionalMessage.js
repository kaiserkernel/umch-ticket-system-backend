const mongoose = require("mongoose");

const AdditionalMessageSchema = new mongoose.Schema({
    inquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inquiry",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: "internalNote"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const AdditionalMessage = mongoose.model("AdditionalMessage", AdditionalMessageSchema);

module.exports = AdditionalMessage;