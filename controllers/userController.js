const Inquiry = require('../models/Inquiry');
const { sendEmail } = require('../services/mailjetService');

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
        
        const emailContent = `
        <h>Dear ${firstName} ${lastName}</h>
        <p>Thank you for submitting your ${inquiryCategory} on ${newInquiry.createdAt}. We have received your ticket and it is now
        Jnder review with the following Ticket Number: ${enrollmentNumber}.</p>
        <p>We will get back to you shortly with further updates.
        Wishing you a great day, and we will follow up with more information soon.</p>
        <p>Best regards,</p>
        <p>Your UMCH Team</p>
        `;
        
        // Send the confirmation email
        await sendEmail(
            email,
            firstName + lastName,
            `Your Ticket Submission Confirmation - Ticket Number ${enrollmentNumber}!`,
            `Dear ${firstName} ${lastName}`,
            emailContent
        );
        
        return res.status(201).json({ message: 'Inquiry submitted successfully', inquiry: newInquiry });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        return res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};

module.exports = { submitInquiry };





