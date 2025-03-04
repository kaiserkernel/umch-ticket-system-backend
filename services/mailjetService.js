const dotenv = require("dotenv");
const mailjet = require("node-mailjet");
const fs = require("fs");
const path = require("path");

dotenv.config();

const MAILJET_API_KEY = process.env.MAIL_JET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAIL_JET_SECRET_KEY;

const mailjetClient = mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);

async function sendEmail(toEmail, toName, subject, textContent, htmlContent, attachment = "") {
  try {
    let emailPayload = {
      From: {
        Email: "secretary@edu.umch.de",
        Name: "UMCH TICKET SYSTEM",
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
    };

    // If attachment exists, read the file and add to email payload
    if (attachment) {
      const filePath = path.join(__dirname, "..", "public", attachment);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Attachment file not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath).toString("base64");

      emailPayload.Attachments = [
        {
          ContentType: "application/pdf", // MIME type of the file
          Filename: path.basename(filePath), // Get filename from the path
          Base64Content: fileContent,
        },
      ];
    }

    // Send the email using MailJet API
    const request = await mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [emailPayload],
    });

    return;
  } catch (error) {
    console.error("Error sending email:", error.statusCode, error.response?.text, error);
    return;
  }
}

module.exports = { sendEmail };
