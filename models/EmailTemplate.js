const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  inquiryCategory: {
    type: String,
    required: true
  },
  subCategory1: {
    type: String
  },
  emailTemplateTitle: {
    type: String,
    required: true
  },
  emailTemplateContent: {
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
  },
  emailTemplateState: {
    type: String, // accept   reject    close
    required: true
  }
});

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
