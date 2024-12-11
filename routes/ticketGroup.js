const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
    createTicketGroup,
    addTicketTypeToGroup,
    getAllTicketGroups,
    updateTicketGroup,
    deleteTicketGroup
} = require("../controllers/ticketGroupController");

router.post("/", authMiddleware, createTicketGroup);
router.post("/add-type", authMiddleware, addTicketTypeToGroup);
router.post("/all", authMiddleware, getAllTicketGroups);
router.patch("/", authMiddleware, updateTicketGroup);
router.delete("/", authMiddleware, deleteTicketGroup);

module.exports = router;