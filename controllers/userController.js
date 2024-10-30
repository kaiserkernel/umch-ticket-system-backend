const Inquiry = require('../models/Inquiry');

exports.submitInquiry = async (req, res) => {
    const inquiryData = req.body;

    try {
        const inquiry = new Inquiry(inquiryData);
        await inquiry.save();
        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
        } catch (error) {
            res.status(400).json({ error: error.message });
    }
};




