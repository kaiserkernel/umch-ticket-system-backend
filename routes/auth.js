// routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const upload = require('../middlewares/upload');
const registerValidator = require('../middlewares/registerValidator');
const loginValidator = require('../middlewares/loginValidator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - password
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           description: "The user's first name"
 *         lastName:
 *           type: string
 *           description: "The user's last name"
 *         email:
 *           type: string
 *           description: "The user's email address (optional for students)"
 *         password:
 *           type: string
 *           description: "The user's password"
 *         role:
 *           type: number
 *           description: "The user's role (0 for admin, 1 for teacher, 2 for student)"
 *         enrollmentNumber:
 *           type: string
 *           description: "The student's enrollment number (only required for students)"
 *         firstYearOfStudy:
 *           type: string
 *           description: "The first year of study (only for students)"
 *         avatar:
 *           type: string
 *           description: "URL to the user's avatar"
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         password: password123
 *         role: 2
 *         enrollmentNumber: EN12345
 *         firstYearOfStudy: 2023
 *         avatar: /uploads/images/avatar/avatar.jpg
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: integer
 *               enrollmentNumber:
 *                 type: string
 *                 description: "Required if role is 2 (student)"
 *               firstYearOfStudy:
 *                 type: string
 *                 description: "Required if role is 2 (student)"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/register', upload.single('avatar'), registerValidator, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "User's email address (not required for students)"
 *               enrollmentNumber:
 *                 type: string
 *                 description: "Student's enrollment number (required if role is 2)"
 *               password:
 *                 type: string
 *                 description: "User's password"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginValidator, login);

module.exports = router;
