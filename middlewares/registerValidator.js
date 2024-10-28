const { body } = require('express-validator');

const registerValidation = [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('role').isIn([0, 1, 2]).withMessage('Invalid role.'),
    body('enrollmentNumber').optional().notEmpty().withMessage('Enrollment number is required for students.'),
    body('firstYearOfStudy').optional().notEmpty().withMessage('First year of study is required for students.'),
];

module.exports = registerValidation;
