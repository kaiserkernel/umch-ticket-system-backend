const dotenv = require("dotenv");

const mailjet = require("node-mailjet");
const fs = require("fs");
const path = require("path");

const MAILJET_API_KEY = process.env.MAIL_JET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAIL_JET_SECRET_KEY;

const mailjetClient = mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);

dotenv.config();

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
    if (attachment == "") {
      console.log(attachment, "====attachment");
      request = mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: process.env.SUPER_ADMIN_EMAIL,
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
      const fileContent = fs.readFileSync(filePath).toString("base64");
      console.log(fileContent, "====filecontent");
      request = mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: process.env.SUPER_ADMIN_EMAIL,
              Name: "Admin"
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
    console.log(result.body);
    return result.body;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { sendEmail };
