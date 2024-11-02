const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
        type: String, 
        required: function() { return this.role !== 2; }, 
        unique: function() { return this.role !== 2; } 
    },
    role: { type: Number, enum: [0, 2], required: true }, 
    position: { type: Number, enum: [0, 1, 2, 3, 4], default: 4, required: true },
    title: { type: String },
    enrollmentNumber: { 
        type: Number, 
        unique: function() { return this.role === 2; }, 
        required: function() { return this.role === 2; } 
    },
    firstYearOfStudy: { 
        type: Number, 
        required: function() { return this.role === 2; } 
    },
    category: [
        {
            name: {
                type:String
            },
            right: {
                type: Number,
                enum: [0,1,2,3]
            },
        }
    ],
    avatar: { type: String },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(12)
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

const User = mongoose.model('User', UserSchema);
module.exports = User;
