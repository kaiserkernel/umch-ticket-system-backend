const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: function () {
      return this.role !== 2;
    },
    unique: function () {
      return this.role !== 2;
    }
  },
  role: { type: Number, enum: [0, 2], required: true },
  position: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    default: 4,
    required: true
  },
  title: { type: String },
  enrollmentNumber: {
    type: Number,
    unique: function () {
      return this.role === 2;
    },
    required: function () {
      return this.role === 2;
    }
  },
  firstYearOfStudy: {
    type: Number,
    required: function () {
      return this.role === 2;
    }
  },
  category: [
    {
      inquiryCategory: {
        type: String
      },
      subCategory1: {
        type: String
      },
      permission: {
        type: String,
        enum: ["None", "Passive", "Active", "Responsible"]
      },
      permissionValue: {
        type: String
      }
    }
  ],
  avatar: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", function (next) {
  const user = this;

  // If no password is provided or it's not modified, skip password hashing
  if (!user.password || !user.isModified("password")) {
    return next();
  }

  bcrypt
    .genSalt(12)
    .then((salt) => bcrypt.hash(user.password, salt))
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
