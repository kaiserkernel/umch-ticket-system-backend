const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    enrollmentNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    firstYearOfStudy: {
      type: Number,
      required: true,
      min: 1900,
    },
    inquiryCategory: {
      type: String,
      required: true,
    },
    subCategory1: {
      type: String,
    },
    subCategory2: {
      type: String,
    },
    details: {
      type: Object,
      required: true,
    },
    documents: [{  
      url: {
          type: String,
          required: false, 
      },
      filename: {
          type: String,
          required: false, 
      }
  }],
    agreement: {
      type: Boolean,
      required: true,
    },
    status:{
      type:Number,
      enum:[0,1,2,3],
      default:0,
      required:true,
    },
    reason:{
      type: String
    },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;