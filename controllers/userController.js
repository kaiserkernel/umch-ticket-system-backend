const Inquiry = require("../models/Inquiry");
const User = require("../models/User"); // Assuming the model is in models/User.js
const { sendEmail } = require("../services/mailjetService");
const { convertHtmlToPdf } = require("../services/wordConvertService");
const { detectLanguage } = require("../services/detectLanguage");
const path = require("path");
const moment = require("moment");

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
  // const bgImagePath = path.join(__dirname, "../public/docTemplate/bg.webp");

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

    let isNonEnglish = false;

    await Promise.all(
      req.files.map(async (file) => {
        if (inquiryCategory === "1" && subCategory1 === "1") {
          const uploadedDocPath = path.join(
            __dirname,
            `../public/uploads/documents/${file.filename}`
          );
          // Get the file extension
          const fileExtension = path.extname(file.originalname).toLowerCase();

          if (fileExtension == 'pdf' || fileExtension == 'doc' || fileExtension == 'docx' || fileExtension == 'txt') {
            const result = await detectLanguage(uploadedDocPath);
            if (result === true) {
              isNonEnglish = true; // Set a flag for valid language
            }
          } else {
            isNonEnglish = true;
          }
        }
      })
    );

    if (inquiryCategory === "1" && subCategory1 === "1") {
      if (!isNonEnglish) {
        return res.status(401).json({ message: "Please upload English PDFs" });
      }
    }

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

        await newInquiry.save();

        const emailContent = `
         <p><strong>Dear ${firstName} ${lastName},</strong></p>
        <p>Thank you for submitting your <strong> ${INQUIRYCATEGORIES[inquiryCategory - 1]
          }</strong> on <strong> ${moment(newInquiry.createdAt).format(
            "DD-MM-YYY hh:mm:ss A"
          )}.</strong> We have received your ticket and it is now
        under review with the following Ticket Number: <strong> ${newInquiry.inquiryNumber
          }.</strong>
        <p>We will get back to you shortly with further updates.
        Wishing you a great day, and we will follow up with more information soon.</p>
        <br />
        <br />
        <p>Best regards,</p>
        <p>${process.env.SUPER_ADMIN_FIRSTNAME} ${process.env.SUPER_ADMIN_LASTNAME
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

// Update user profile by email
const updateUserProfile = async (req, res) => {
  try {
    // Extract data from request body
    const {
      email,
      firstName,
      lastName,
      enrollmentNumber,
      firstYearOfStudy,
      password
    } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = password; // Ideally hash the password before saving
    if (firstYearOfStudy) user.firstYearOfStudy = firstYearOfStudy;
    if (req?.file?.filename) {
      user.avatar = `/uploads/images/avatar/${req.file.filename}`;
    }
    console.log(user, "===user");
    // Save the updated user data
    await user.save();

    // Return the updated user profile as a response
    return res.status(200).json({
      message: "User profile updated successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enrollmentNumber: user.enrollmentNumber,
        firstYearOfStudy: user.firstYearOfStudy,
        avatar: user.avatar,
        role: user.role,
        position: user.position
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Extract data from request body
    const { enrollmentNumber } = req.body;

    // Find user by email
    const user = await User.findOne({ enrollmentNumber });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const randomPassword = Math.floor(100000 + Math.random() * 900000);

    user.password = randomPassword;
    await user.save();

    const emailContent = `
    <p><strong>Dear ${user?.firstName} ${user?.lastName},</strong></p>
   <p>Thank you for submitting your Password Reset.</p>
   <p> Your new password is ${randomPassword} .</p>
   <br />
   <br />
   <p>Best regards,</p>
   <p>${process.env.SUPER_ADMIN_FIRSTNAME} ${process.env.SUPER_ADMIN_LASTNAME} </p>
   <p>Professor</p>
   <p>Vice Rector</p>
   <p><${process.env.SUPER_ADMIN_EMAIL}</p>
   `;

    // Send the confirmation email
    await sendEmail(
      user?.email,
      user?.firstName + " " + user?.lastName,
      "Your Password has been reset!",
      `Dear ${user?.firstName} ${user?.lastName}`,
      emailContent
    );

    // Return the updated user profile as a response
    return res.status(200).json({
      message: "Your Password was updated successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enrollmentNumber: user.enrollmentNumber,
        firstYearOfStudy: user.firstYearOfStudy,
        avatar: user.avatar,
        role: user.role,
        position: user.position
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    // Extract data from request body
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const randomPassword = Math.floor(100000 + Math.random() * 900000);

    user.password = randomPassword;
    await user.save();

    const emailContent = `
    <p><strong>Dear ${user?.firstName} ${user?.lastName},</strong></p>
   <p>Thank you for submitting your Password Reset.</p>
   <p> Your new password is ${randomPassword} .</p>
   <br />
   <br />
   <p>Best regards,</p>
   <p>${process.env.SUPER_ADMIN_FIRSTNAME} ${process.env.SUPER_ADMIN_LASTNAME} </p>
   <p>Professor</p>
   <p>Vice Rector</p>
   <p><${process.env.SUPER_ADMIN_EMAIL}</p>
   `;

    // Send the confirmation email
    await sendEmail(
      user?.email,
      user?.firstName + " " + user?.lastName,
      "Your Password has been reset!",
      `Dear ${user?.firstName} ${user?.lastName}`,
      emailContent
    );

    // Return the updated user profile as a response
    return res.status(200).json({
      message: "Your Password was updated successfully.",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enrollmentNumber: user.enrollmentNumber,
        firstYearOfStudy: user.firstYearOfStudy,
        avatar: user.avatar,
        role: user.role,
        position: user.position
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitInquiry,
  getInquiriesByEnrollmentNumber,
  updateUserProfile,
  resetPassword,
  adminResetPassword
};
