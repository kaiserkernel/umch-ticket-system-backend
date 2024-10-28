const dotenv = require('dotenv');

const mailjet = require('node-mailjet');

const MAILJET_API_KEY = process.env.MAIL_JET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAIL_JET_SECRET_KEY;

const mailjetClient = mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);

dotenv.config();

async function sendEmail(toEmail, toName, subject, textContent, htmlContent) {
    try {
        const request = mailjetClient.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'damon.edwards612@gmail.com',
                        Name: 'Admin',
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: toName,
                        },
                    ],
                    Subject: subject,
                    TextPart: textContent,
                    HTMLPart: htmlContent,
                },
            ],
        });

        const result = await request;
        console.log(result.body);
        return result.body;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail };
