const Inquiry = require('../models/Inquiry');

async function submitInquiry (req, res) {
    try {
        const { firstName, lastName, email, enrollmentNumber, firstYearOfStudy, inquiryCategory, subCategory1, subCategory2, details, agreement } = req.body;
        const documents = req.files.map(file => ({  
            url: `/uploads/documents/${file.filename}`, 
            filename: file.originalname
        }));

        const newInquiry = new Inquiry({
            firstName,
            lastName,
            email,
            enrollmentNumber,
            firstYearOfStudy,
            inquiryCategory,
            subCategory1,
            subCategory2,
            details: JSON.parse(details), // Parse the details if it's in JSON string format
            agreement,
            documents, // Include the uploaded documents in the inquiry
            status: 0 // Default status for new inquiries
        });

        await newInquiry.save();
        return res.status(201).json({ message: 'Inquiry submitted successfully', inquiry: newInquiry });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        return res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};

module.exports = { submitInquiry };





