const { body, validationResult } = require('express-validator');

exports.createRoleValidator = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn([0, 1])
    .withMessage('Role must be either 0 or 1'),
  body('position')
    .isIn([0, 1, 2, 3, 4])
    .withMessage('Position must be between 0 and 4'),
];
