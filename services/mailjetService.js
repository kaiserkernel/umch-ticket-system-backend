const dotenv = require("dotenv");
const mailjet = require("node-mailjet");
const fs = require("fs");
const path = require("path");

dotenv.config();

const MAILJET_API_KEY = process.env.MAIL_JET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAIL_JET_SECRET_KEY;

const mailjetClient = mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);

async function sendEmail(
  toEmail,
  toName,
  subject,
  textContent,
  htmlContent,
  attachment = ""
) {
  try {
    let request;

    if (!attachment) {
      request = mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "secretary@edu.umch.de",
              Name: "UMCH TICKET SYSTEM"
            },
            To: [
              {
                Email: toEmail,
                Name: toName
              }
            ],
            Subject: subject,
            TextPart: textContent,
            HTMLPart: htmlContent
          }
        ]
      });
    } else {
      const filePath = path.join(__dirname, "..", "public", attachment);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Attachment file not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath).toString("base64");
      request = mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "secretary@edu.umch.de",
              Name: "UMCH TICKET SYSTEM"
            },
            To: [
              {
                Email: toEmail,
                Name: toName
              }
            ],
            Subject: subject,
            TextPart: textContent,
            HTMLPart: htmlContent,
            Attachments: [
              {
                ContentType: "application/pdf", // MIME type of the file
                Filename: "Certificate.pdf", // Name to display in the email
                Base64Content: fileContent
              }
            ]
          }
        ]
      });
    }

    const result = await request;
    return result.body;
  } catch (error) {
    console.error("Error sending email:", error.statusCode, error.response?.text, error);
    throw error;
  }
}

module.exports = { sendEmail };
