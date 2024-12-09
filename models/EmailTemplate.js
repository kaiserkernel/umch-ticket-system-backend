const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketCategory",
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketCategory.subCategory",
    required: true
  },
  title: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  defaultFlag: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
