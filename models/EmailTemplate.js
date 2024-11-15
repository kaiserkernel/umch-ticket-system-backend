const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  inquiryCategory: Number,
  subCategory: Number,
  emailTemplateTitle: String,
  emailTemplateContent: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
