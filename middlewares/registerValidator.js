const { body } = require('express-validator');

const registerValidator = [
    body('firstName')
        .notEmpty().withMessage("First name is required")
        .isString().withMessage("First name must be a string"),

    body('lastName')
        .notEmpty().withMessage("Last name is required")
        .isString().withMessage("Last name must be a string"),

    body('password')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    body('role')
        .notEmpty().withMessage("Role is required")
        .isInt({ min: 0, max: 2 }).withMessage("Role must be 0, 1, or 2"),

    body('email')
        // .if((value, { req }) => req.body.role !== "2")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    body('enrollmentNumber')
        .if((value, { req }) => req.body.role === "2")
        .notEmpty().withMessage("Enrollment number is required for students")
        .isString().withMessage("Enrollment number must be a string"),

    body('firstYearOfStudy')
        .if((value, { req }) => req.body.role === "2")
        .notEmpty().withMessage("First year of study is required for students")
        .isString().withMessage("First year of study must be a string"),
];

module.exports = registerValidator;
