const Inquiry = require("../models/Inquiry");
const { sendEmail } = require("../services/mailjetService");
const { convertHtmlToPdf } = require("../services/wordConvertService");
require("dotenv").config();

const INQUIRYCATEGORIES = [
  "Applications and Requests",
  "Book rental UMCH library",
  "Campus IT",
  "Complaints",
  "Internship",
  "Medical Abilities",
  "Thesis",
  "Other"
];
async function submitInquiry(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      enrollmentNumber,
      firstYearOfStudy,
      inquiryCategory,
      subCategory1,
      subCategory2,
      details,
      agreement
    } = req.body;
    const documents = req.files.map((file) => ({
      url: `/uploads/documents/${file.filename}`,
      filename: file.originalname
    }));

    (async () => {
      try {
        const newInquiry = new Inquiry({
          firstName,
          lastName,
          email,
          enrollmentNumber,
          firstYearOfStudy,
          inquiryCategory,
          subCategory1,
          subCategory2,
          details: JSON.parse(details),
          agreement,
          documents,
          status: 0
        });

        console.log(documents, "====newinquiry documents");
        await newInquiry.save();

        const emailContent = `
         <p><strong>Dear ${firstName} ${lastName},</strong></p>
        <p>Thank you for submitting your <strong> ${
          INQUIRYCATEGORIES[inquiryCategory - 1]
        }</strong> on <strong> ${
          newInquiry.createdAt
        }.</strong> We have received your ticket and it is now
        under review with the following Ticket Number: <strong> ${
          newInquiry.inquiryNumber
        }.</strong>
        <p>We will get back to you shortly with further updates.
        Wishing you a great day, and we will follow up with more information soon.</p>
        <br />
        <br />
        <p>Best regards,</p>
        <p>${process.env.SUPER_ADMIN_FIRSTNAME} ${
          process.env.SUPER_ADMIN_LASTNAME
        } </p>
        <p>Professor</p>
        <p>Vice Rector</p>
        <p><${process.env.SUPER_ADMIN_EMAIL}</p>
        `;

        // Send the confirmation email
        await sendEmail(
          email,
          firstName + " " + lastName,
          `Your Ticket Submission Confirmation - Ticket Number ${newInquiry.inquiryNumber}!`,
          `Dear ${firstName} ${lastName}`,
          emailContent
        );

        return res.status(201).json({
          message: "Inquiry submitted successfully",
          inquiry: newInquiry
        });
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return res.status(500).json({ error: "Failed to submit inquiry" });
  }
}

const getInquiriesByEnrollmentNumber = async (req, res) => {
  try {
    const { enrollmentNumber } = req.params;
    const inquiries = await Inquiry.find({ enrollmentNumber });

    if (!inquiries.length) {
      return res
        .status(404)
        .json({ message: "No inquiries found for this enrollment number" });
    }

    res.status(200).json({ inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { submitInquiry, getInquiriesByEnrollmentNumber };
