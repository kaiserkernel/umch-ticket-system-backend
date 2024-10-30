// routes/adminRoutes.js
const express = require('express');
const { createRole } = require('../controllers/adminController');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /api/admin/create-role:
 *   post:
 *     summary: Create a new role (Admin)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                  type: string
 *               lastName:
 *                  type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: number
 *                 enum: [0,1]
 *               position:
 *                 type: number
 *                 enum: [0,1,2,3]
 *     responses:
 *       201:
 *         description: User created and email sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/create-role', 
  [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn([0,1]),
    body('position').isIn([0,1,2,3,4]),
  ], 
  createRole
);

module.exports = router;
