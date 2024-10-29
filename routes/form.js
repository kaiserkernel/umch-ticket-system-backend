const express = require('express');
const { handleFormSubmission } = require('../controllers/formController');

const router = express.Router();

/**
 * @swagger
 * /submit-form:
 *   post:
 *     summary: Submit form data
 *     description: Handles form submissions and processes the data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               message:
 *                 type: string
 *                 example: This is a sample message.
 *     responses:
 *       200:
 *         description: Form submitted successfully
 *       400:
 *         description: Bad request (validation errors)
 *       500:
 *         description: Internal server error
 */

router.post('/submit-form', handleFormSubmission);

module.exports = router;
