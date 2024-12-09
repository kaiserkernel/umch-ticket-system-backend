const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
    createTicketGroup,
    addTicketTypeToGroup,
    getAllTicketGroups,
    updateTicketGroup,
    deleteTicketGroup,
    getAllRegistedTicketType
} = require("../controllers/ticketGroupController")

router.post("/", authMiddleware, createTicketGroup);
router.post("/add-type", authMiddleware, addTicketTypeToGroup);
router.post("/all", authMiddleware, getAllTicketGroups);
router.patch("/", authMiddleware, updateTicketGroup);
router.delete("/", authMiddleware, deleteTicketGroup);
router.post("/all-types", authMiddleware, getAllRegistedTicketType)

module.exports = router;