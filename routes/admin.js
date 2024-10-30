const express = require('express');
const { createRole, getUsers } = require('../controllers/adminController');
const { body } = require('express-validator');
const checkSuperAdmin = require('../middlewares/checkSuperAdmin');
const authMiddleware = require('../middlewares/authMiddleware');
const createRoleValidator = require('../middlewares/createRoleValidator');

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
router.post('/create-role', createRoleValidator, createRole);

/**
 * @swagger
 * /api/admin/get-users:
 *   get:
 *     summary: Retrieve all users (Super Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *       403:
 *         description: Forbidden - Only accessible to Super Admin
 *       500:
 *         description: Server error
 */
router.get('/get-users', authMiddleware, checkSuperAdmin, getUsers);

module.exports = router;
