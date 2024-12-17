const mongoose = require("mongoose");
const Counter = require("./Counter");
const TicketGroup = require("./TicketGroup");

const inquirySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: /.+\@.+\..+/
  },
  enrollmentNumber: {
    type: Number,
    required: true,
    trim: true
  },
  firstYearOfStudy: {
    type: Number,
    required: true,
    min: 1900
  },
  inquiryCategory: {
    type: String,
    required: true
  },
  subCategory1: {
    type: String
  },
  subCategory2: {
    type: String
  },
  details: {
    type: Object,
    required: true
  },
  documents: [
    {
      url: {
        type: String,
        required: false
      },
      filename: {
        type: String,
        required: false
      },
      translatedFileUrl: {
        type: String
      },
      translatedFileName: {
        type: String
      }
    }
  ],
  agreement: {
    type: Boolean,
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6, 7],
    // 0 : reopen
    // 1 : check
    // 2 : accept
    // 3 : reject
    // 4 : process - transcript record
    // 5 : done - transcript record
    // 6 : notify - transcript record
    // 7 : close
    default: 0,
    required: true
  },
  isClicked: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  emailContent: {
    type: String
  },
  reason: {
    type: String
  },
  inquiryNumber: {
    type: String,
    unique: true
  },
  createdAt: { type: Date, default: Date.now }
});

inquirySchema.pre("save", async function (next) {
  if (this.isNew) {
    const info = this;
    const groupInfo = await TicketGroup.findOne({
      ticketTypes: {
        $elemMatch: {
          inquiryCategory: info.inquiryCategory,
          subCategory1: info.subCategory1
        }
      }
    });

    if (groupInfo) {
      const counter = await Counter.findOneAndUpdate(
        { group: groupInfo.prefix },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.inquiryNumber = counter.group + "-" + counter.sequenceValue;
    } else {
      const counter = await Counter.findOneAndUpdate(
        { group: "default" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.inquiryNumber = counter.group + "-" + counter.sequenceValue;
    }
  }
  next();
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);
module.exports = Inquiry;
