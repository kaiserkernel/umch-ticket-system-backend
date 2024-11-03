const express = require('express');
const { submitInquiry, getInquiriesByEnrollmentNumber  } = require('../controllers/userController');
const { uploadDocuments } = require('../middlewares/upload'); 
const router = express.Router();

/**
 * @swagger
 * /api/user/submit-inquiry:
 *   post:
 *     summary: Submit an inquiry
 *     tags: [User]
 *     description: Endpoint to submit an inquiry.
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
 *                 format: email
 *               enrollmentNumber:
 *                 type: number
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
 *               documents:  
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *       400:
 *         description: Bad request
 */
router.post('/submit-inquiry', uploadDocuments.array('documents'), submitInquiry);

/**
 * @swagger
 * /api/user/inquiries/{enrollmentNumber}:
 *   get:
 *     summary: Get inquiries by enrollment number
 *     tags: [User]
 *     description: Endpoint to fetch inquiries based on the enrollment number.
 *     parameters:
 *       - in: path
 *         name: enrollmentNumber
 *         required: true
 *         description: The enrollment number to search for inquiries.
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successful response with a list of inquiries.
 *       404:
 *         description: No inquiries found.
 *       500:
 *         description: Internal server error.
 */
router.get('/inquiries/:enrollmentNumber', getInquiriesByEnrollmentNumber);

module.exports = router;
