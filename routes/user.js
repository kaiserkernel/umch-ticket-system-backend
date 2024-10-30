const express = require('express');
const { submitInquiry } = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * /submit-inquiry:
 *   post:
 *     summary: Submit an inquiry
 *     description: Endpoint to submit an inquiry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               enrollmentNumber:
 *                 type: string
 *               firstYearOfStudy:
 *                 type: integer
 *               inquiryCategory:
 *                 type: string
 *               subCategory1:
 *                 type: string
 *               subCategory2:
 *                 type: string
 *               details:
 *                 type: object
 *               agreement:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *       400:
 *         description: Bad request
 */
router.post('/submit-inquiry', submitInquiry);
module.exports = router;
