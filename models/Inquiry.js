const mongoose = require('mongoose');
const Counter = require('./Counter');

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
      unique: true,
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
      enum:[0,1,2,3,4],
      default:0,
      required:true,
    },
    reason:{
      type: String
    },
    inquiryNumber: {
      type: Number,
      unique: true,
    },
    createdAt: { type: Date, default: Date.now },
  });
  
  inquirySchema.pre('save', async function (next) {
    if (this.isNew) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'inquiryID' },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.inquiryNumber = counter.sequenceValue;
    }
    next();
  });

  const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;