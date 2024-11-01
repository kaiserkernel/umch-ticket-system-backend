const express = require('express');
const { submitInquiry } = require('../controllers/userController');
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
 *              
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
module.exports = router;
