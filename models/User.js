// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: Number, enum: [0, 1, 2], required: true }, // 0: admin, 1: teacher, 2: student
    enrollmentNumber: { type: String, required: function() { return this.role === 'student'; } },
    firstYearOfStudy: { type: String, required: function() { return this.role === 'student'; } },
    avatar: { type: String }, 
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', function(next) {
    let user = this;

    if (!user.isModified('password')) {
        return next();
    } else {
    }

    bcrypt
        .genSalt(12)
        .then((salt) => {
            return bcrypt.hash(user.password, salt);
        })
        .then((hash) => {
            user.password = hash;
            next();
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
