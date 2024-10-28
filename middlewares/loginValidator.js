const { body } = require('express-validator');

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = loginValidation;
