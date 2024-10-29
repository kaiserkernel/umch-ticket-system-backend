const { body } = require('express-validator');

const loginValidator = [
    body('email')
        .if((value, { req }) => req.body.role !== "2")
        .notEmpty().withMessage("Email is required for non-students")
        .isEmail().withMessage("Invalid email format"),

    body('enrollmentNumber')
        .if((value, { req }) => req.body.role === "2")
        .notEmpty().withMessage("Enrollment number is required for students")
        .isString().withMessage("Enrollment number must be a string"),

    body('password')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

module.exports = loginValidator;
