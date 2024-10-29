const { v4: uuidv4 } = require('uuid');
const Form = require('../models/Form');
const { sendEmail } = require('../services/mailjetService');

async function handleFormSubmission(req, res) {
    const { name, email, message } = req.body;
    const ticketNumber = uuidv4();

    try {
        // Save the form submission to the database
        const newSubmission = new Form({ name, email, message, ticketNumber });
        await newSubmission.save();

        // Prepare the confirmation email content
        const emailContent = `
            <h3>Thank you for your submission, ${name}!</h3>
            <p>Here is the information you provided:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Message:</strong> ${message}</li>
            </ul>
            <p>Your unique ticket number is: <strong>${ticketNumber}</strong></p>
            <p>You can check the status of your request on the <a href="http://localhost:3000/dashboard/${ticketNumber}">dashboard</a>.</p>
        `;

        // Send the confirmation email
        await sendEmail(email, name, 'Your Submission Confirmation', 'Thank you for your submission.', emailContent);
        
        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).json({ message: 'Failed to submit form', error });
    }
}

module.exports = { handleFormSubmission };
