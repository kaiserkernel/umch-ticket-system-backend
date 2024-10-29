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
 *           type: integer
 *           description: "The user's role (0 for admin, 1 for teacher, 2 for student)"
 *         enrollmentNumber:
 *           type: string
 *           description: "The student's enrollment number (required for students)"
 *         firstYearOfStudy:
 *           type: string
 *           description: "The student's first year of study (required for students)"
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
 *     summary: Register a new student
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
 *                 description: "User's first name"
 *               lastName:
 *                 type: string
 *                 description: "User's last name"
 *               email:
 *                 type: string
 *                 description: "User's email address (optional for students)"
 *               password:
 *                 type: string
 *                 description: "User's password"
 *               role:
 *                 type: integer
 *                 description: "User's role (0 for admin, 1 for teacher, 2 for student)"
 *               enrollmentNumber:
 *                 type: string
 *                 description: "Required if role is 2 (student)"
 *               firstYearOfStudy:
 *                 type: string
 *                 description: "Required if role is 2 (student)"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "User's avatar image"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, validation errors
 *       500:
 *         description: Server error
 */
router.post('/register', upload.single('avatar'), registerValidator, register);

/**
 * @swagger
 * /api/auth/admin:
 *   post:
 *     summary: Login an admin
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
 *                 description: "Admin's email address"
 *               password:
 *                 type: string
 *                 description: "Admin's password"
 *     responses:
 *       200:
 *         description: Admin login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/admin', loginValidator, login); // Admin login

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a student
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
 *                 description: "Student's email address (not required for students)"
 *               enrollmentNumber:
 *                 type: string
 *                 description: "Student's enrollment number (required for students)"
 *               password:
 *                 type: string
 *                 description: "User's password"
 *               rememberMe:
 *                 type: boolean
 *                 description: "If true, token will last for 7 days; otherwise, 1 hour."
 *     responses:
 *       200:
 *         description: Student login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginValidator, login); // Student login

module.exports = router;
