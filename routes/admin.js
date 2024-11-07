const express = require("express");
const {
  createRole,
  getUsers,
  getReceivedInquiries,
  getInquiriesByEnrollmentNumber,
  checkInquiry,
  getInquiryByID,
  rejectInquiry,
  acceptInquiry,
  reOpenTicket,
} = require("../controllers/adminController");
const checkSuperAdmin = require("../middlewares/checkSuperAdmin");
const authMiddleware = require("../middlewares/authMiddleware");
const createRoleValidator = require("../middlewares/createRoleValidator");

const router = express.Router();

/**
 * @swagger
 * /api/admin/create-role:
 *   post:
 *     summary: Create a new role (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: User's password
 *               role:
 *                 type: number
 *                 enum: [0, 1]
 *                 description: User role
 *               position:
 *                 type: number
 *                 enum: [0, 1, 2, 3]
 *                 description: User's position
 *               title:
 *                 type: string
 *                 description: Title of the user (optional)
 *               category:
 *                 type: array
 *                 description: User's category permissions
 *                 items:
 *                   type: object
 *                   properties:
 *                     inquiryCategory:
 *                       type: string
 *                       description: Name of the category
 *                     subCategory1:
 *                       type: string
 *                       description: Name of the category
 *                     permission:
 *                       type: number
 *                       enum: ["None", "Passive", "Active", "Responsible"]
 *     responses:
 *       201:
 *         description: User created and email sent successfully
 *       400:
 *         description: Bad request (e.g., user already exists)
 *       500:
 *         description: Server error
 */

router.post("/create-role", createRoleValidator, createRole);

/**
 * @swagger
 * /api/admin/get-users:
 *   get:
 *     summary: Retrieve all users (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *       403:
 *         description: Forbidden - Only accessible to Super Admin
 *       500:
 *         description: Server error
 */
router.get("/get-users", authMiddleware, checkSuperAdmin, getUsers);

/**
 * @swagger
 * /api/admin/inquiries:
 *   get:
 *     summary: Get all received inquiries
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved inquiries
 *       500:
 *         description: Server error
 */
router.get("/inquiries", authMiddleware, getReceivedInquiries);

/**
 * @swagger
 * /api/admin/inquiries/{enrollmentNumber}:
 *   get:
 *     summary: Get inquiries by enrollment number
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: enrollmentNumber
 *         in: path
 *         required: true
 *         description: Enrollment number of the user
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Inquiries retrieved successfully
 *       404:
 *         description: No inquiries found for this enrollment number
 */
router.get(
  "/inquiries/:enrollmentNumber",
  authMiddleware,
  getInquiriesByEnrollmentNumber
);

/**
 * @swagger
 * /api/admin/inquiries/{id}/check:
 *   patch:
 *     summary: Check an inquiry
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry checked
 *       404:
 *         description: Inquiry not found
 *       500:
 *         description: Server error
 */
router.patch("/inquiries/:id/check", authMiddleware, checkInquiry);
/**
 * @swagger
 * /api/admin/inquiries/{id}/show:
 *   get:
 *     summary: Get an inquiry
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry checked
 *       404:
 *         description: Inquiry not found
 *       500:
 *         description: Server error
 */
router.get("/inquiries/:id/show", authMiddleware, getInquiryByID);

/**
 * @swagger
 * /api/admin/inquiries/{id}/accept:
 *   patch:
 *     summary: Accept an inquiry
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry accepted
 *       404:
 *         description: Inquiry not found
 *       500:
 *         description: Server error
 */
router.post("/inquiries/accept", authMiddleware, acceptInquiry);

/**
 * @swagger
 *  /api/admin/inquiries/{id}/reject:
 *   patch:
 *     summary: Reject an inquiry
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry rejected
 *       404:
 *         description: Inquiry not found
 *       500:
 *         description: Server error
 */
router.post("/inquiries/reject", authMiddleware, rejectInquiry);

router.post("/inquiries/reOpenTicket", authMiddleware, reOpenTicket);

module.exports = router;
