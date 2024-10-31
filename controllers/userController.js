const Inquiry = require('../models/Inquiry');

async function submitInquiry (req, res) {
    console.log("comming");
    console.log(req.body);
    const inquiryData = req.body;

    try {
        const inquiry = new Inquiry(inquiryData);
        console.log(inquiry);
        await inquiry.save();
        console.log("done");
        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
        } catch (error) {
            res.status(400).json({ error: error.message });
    }
};

module.exports = { submitInquiry };





