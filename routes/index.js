const express = require("express");

const authRoutes = require("./auth");
const formRoutes = require("./form");
const adminRoutes = require("./admin");
const userRoutes = require("./user");
const emailTemplateRoutes = require("./emailTemplate");
const ticketGroupRoutes = require("./ticketGroup");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/form", formRoutes);
router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/emailTemplate", emailTemplateRoutes);
router.use("/ticket-group", ticketGroupRoutes);

module.exports = router;
