// routes/authRoutes.js
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  addEmailTemplate,
  getEmailTemplate,
  getEmailTemplatesByCategory,
  getAllEmailTemplate,
  editEmailTemplate,
  deleteEmailTemplate
} = require("../controllers/emailTemplateController");
const router = express.Router();

router.post("/add", authMiddleware, addEmailTemplate);
router.get("/get/:id", authMiddleware, getEmailTemplate);
router.get("/get", authMiddleware, getAllEmailTemplate);
router.post(
  "/get-templates-by-category",
  authMiddleware,
  getEmailTemplatesByCategory
);
router.patch("/edit", authMiddleware, editEmailTemplate);
router.get("/delete/:id", authMiddleware, deleteEmailTemplate);
module.exports = router;
