const TicketGroup = require("../models/TicketGroup");
const Counter = require("../models/Counter");

require("dotenv").config();

const createTicketGroup = async (req, res) => {
    const { name, prefix } = req.body;
    try {
        // Check if ticket type with the same name already exists
        const existingTicketGroupWithName = await TicketGroup.findOne({ name });

        if (existingTicketGroupWithName) {
            return res.status(400).json({ message: "Ticket group with this name already exists" });
        }

        // Check if ticket type with the same prefix already exists
        const existingTicketGroupWithPrefix = await TicketGroup.findOne({ prefix });
        if (existingTicketGroupWithPrefix) {
            return res.status(400).json({ message: "Ticket group with this prefix already exists" });
        }

        // Create a new TicketGroup
        const newTicketGroup = new TicketGroup({
            name,
            prefix,
            ticketTypes: []
        })

        // check if counter for this prefix exist or not
        const counter = await Counter.findOne({ group: prefix });
        if (!counter) {
            const newCounter = new Counter({
                group: prefix
            });
            await newCounter.save();
        }

        // Save to database
        await newTicketGroup.save();

        // Return success response
        res.status(201).json({
            message: "Ticket group created successfully",
            data: newTicketGroup
        })
    } catch (error) {
        console.log(error, 'error')
        // Handle validation or server errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors
            })
        }
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const addTicketTypeToGroup = async (req, res) => {
    const { id, inquiryCategory, subCategory1 } = req.body;

    try {
        // validation
        if (!inquiryCategory || typeof inquiryCategory !== 'string') {
            return res.status(400).json({ "message": "Name is required for adding group" })
        }

        // validation - current group 
        const newGroup = await TicketGroup.findById(id);
        if (!newGroup) {
            return res.status(404).json({ "message": "Ticket group not found" })
        }

        // validation - Check if the ticket type already exists in that group
        const existingTicketType = newGroup.ticketTypes.find(log => {
            if (!subCategory1 && log.inquiryCategory === inquiryCategory) {
                return true
            }
            if (log.inquiryCategory === inquiryCategory && log.subCategory1 === subCategory1) {
                return true;
            }
        });

        if (existingTicketType) {
            return res.status(400).json({
                message: `Ticket type (${subCategory1 ? (subCategory1 === "Other" ? `Other-${inquiryCategory}` : subCategory1) : inquiryCategory}) already exists in this group`,
                data: existingTicketType // Optional: include the conflicting subgroup in the response
            });
        }

        // add this ticket type to this group
        newGroup.ticketTypes.push({
            inquiryCategory,
            subCategory1: subCategory1 ? subCategory1 : ""
        }); // Add new subGroup to the TicketGroup

        // remove from old group
        await TicketGroup.updateMany(
            {
                ticketTypes: {
                    inquiryCategory,
                    subCategory1: subCategory1 ? subCategory1 : ""
                }
            }, // Find TicketGroups that contain the ticket type
            {
                $pull: {
                    ticketTypes: {
                        inquiryCategory,
                        subCategory1: subCategory1 ? subCategory1 : ""
                    }
                }
            } // Remove the specific ticket type
        );

        await newGroup.save();   // Initialize with an empty subTitle array

        return res.status(201).json({
            message: `Successfully added to group(${newGroup.name})`,
            data: newGroup
        })


    } catch (error) {
        console.log(error, "add ticket info error");
        res.status(500).json({
            "message": "Internal server error",
            error: error.message
        })
    }
}

const getAllTicketGroups = async (req, res) => {
    try {
        // Fetch all ticket types from the database
        const ticketGroups = await TicketGroup.find();

        // Return the ticket types as a response
        res.status(200).json({
            message: "Ticket types fetched successfully",
            data: ticketGroups
        })
    } catch (error) {
        // Handle error
        res.status(500).json({
            message: "Error fetching ticket types",
            error: error.message
        })
    }
}

const updateTicketGroup = async (req, res) => {
    const { id, name, prefix } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ message: "Name is required for update" })
        }

        if (!prefix) {
            return res.status(400).json({ message: "Prefix is required for adding" })
        }

        // Check if ticket type with the same name already exists
        const existingTicketGroupWithName = await TicketGroup.findOne({ name, _id: { $ne: id } });

        if (existingTicketGroupWithName) {
            return res.status(400).json({ message: "Ticket group with this name already exists" });
        }

        // Check if ticket type with the same prefix already exists
        const existingTicketGroupWithPrefix = await TicketGroup.findOne({ prefix, _id: { $ne: id } });
        if (existingTicketGroupWithPrefix) {
            return res.status(400).json({ message: "Ticket group with this prefix already exists" });
        }

        const ticketGroup = await TicketGroup.findById(id);

        if (!ticketGroup) {
            return res.status(404).json({ message: "Not found ticket group" })
        }

        // check if counter is exist with new prefix or not
        const counter = Counter.findOne({ group: prefix });
        if (!counter) {
            const newCounter = new Counter({ group: prefix });
            await newCounter();
        }

        ticketGroup.name = name;
        ticketGroup.prefix = prefix;
        await ticketGroup.save();   // Initialize with an empty subTitle array

        return res.status(200).json({
            message: "TicketGroup updated successfully",
            data: ticketGroup
        })

    } catch (error) {
        console.log("Error update ticket group", error);
        res.status(500).json({
            "message": "Internal server error",
            error: error.message
        })
    }
}

const deleteTicketGroup = async (req, res) => {
    const { id } = req.body;
    try {
        const ticketGroup = await TicketGroup.findById(id);

        if (!ticketGroup) {
            return res.status(404).json({
                message: "Ticket Group not found"
            })
        }

        // delete main group
        await TicketGroup.findByIdAndDelete(id);

        return res.status(200).json({
            message: `Successfully deleted group(${ticketGroup.name})`
        });
    } catch (error) {
        console.log("Error update ticket group", error);
        res.status(500).json({
            "message": "Internal server error",
            error: error.message
        })
    }

}

module.exports = {
    createTicketGroup,
    addTicketTypeToGroup,
    getAllTicketGroups,
    updateTicketGroup,
    deleteTicketGroup
}