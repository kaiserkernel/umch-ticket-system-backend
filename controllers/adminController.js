const { validationResult } = require("express-validator");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const { sendEmail } = require("../services/mailjetService");
const AdditionalMessage = require("../models/AdditionalMessage");

const {
  convertHtmlToPdf,
  convertHtmlToTransferTarguPdf
} = require("../services/wordConvertService");

require("dotenv").config();
const positionNames = process.env.POSITION_NAMES.split(",");
const subCategoryNames = process.env.SUB_CATEGORIES.split(",");
const inquriyCategoryNames = process.env.INQUIRY_CATEGORIES.split(",");

function formatWord(word) {
  // Add a space before each capital letter
  const spacedWord = word.replace(/([A-Z])/g, " $1").trim();
  // Capitalize the first letter
  return spacedWord.charAt(0).toUpperCase() + spacedWord.slice(1);
}

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// create a now role
const createRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    role,
    position,
    title,
    category
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      position,
      title,
      category
    });

    await newUser.save();

    const accessToString = category
      .map((item) => {
        const categoryInfo = item.subCategory1
          ? `${subCategoryNames[item.subCategory1 - 1]}`
          : `${inquriyCategoryNames[item.inquiryCategory - 1]}`;
        return `<li>${categoryInfo} ( ${item.permission} )</li>`;
      })
      .join("");

    const emailContent = `
      <h3>Dear ${firstName} ${lastName}</h3>
      <p>You are now part of the UMCH Ticket System Team, and we are pleased to welcome you onboard.
      The UMCH Ticket System serves as a digital request and complaint portal for students.
      We appreciate your willingness to take responsibility for the assigned requests or complaints 
      and to provide timely assistance to our students in resolving their concerns.</p>
      <p>We have granted you access to the following inquiries with the Role ${positionNames[position]}.</p>
      <p>Here are inquiry details you can access:</p>
      <ul>${accessToString}</ul> 
      <p>Here are your account details:</p>
      <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Title:</strong>${title}</li>
          <li><strong>First Name:</strong>${firstName}</li>
          <li><strong>Last Name:</strong>${lastName}</li>
          <li><strong>Department:</strong>${positionNames[position]}</li>
      </ul>
      <p>If you have any technical questions, please don’t hesitate to reach out to us at marketing@edu.umch.de.
      You can log in using these credentials <a href="https://umch-ticket-system.vercel.app/admin">LINK</a>.Thank you for your support, and we look forward to a successful collaboration!.</p>
      <p>Best regards,</p>
      <p>Your UMCH Team</p>
    `;

    // Send the confirmation email
    await sendEmail(
      email,
      firstName + lastName,
      "Welcome to the UMCH Ticket System Team!",
      "Welcome ! Now you are in a admin role in UMCH ticket system!",
      emailContent
    );

    res
      .status(201)
      .json({ message: "Role created successfully, confirmation email sent." });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const editRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    role,
    position,
    title,
    category
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User no exists" });
    }

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.email = email;
    existingUser.role = role;
    existingUser.position = position;
    existingUser.title = title;
    existingUser.category = category;
    if (password !== "") {
      existingUser.password = password;
    }

    await existingUser.save();

    const accessToString = category
      .map((item) => {
        const categoryInfo = item.subCategory1
          ? `${subCategoryNames[item.subCategory1 - 1]}`
          : `${inquriyCategoryNames[item.inquiryCategory - 1]}`;
        return `<li>${categoryInfo} ( ${item.permission} )</li>`;
      })
      .join("");

    const emailContent = `
      <h3>Dear ${firstName} ${lastName}</h3>
      <p>You are now part of the UMCH Ticket System Team, and we are pleased to welcome you onboard.
      The UMCH Ticket System serves as a digital request and complaint portal for students.
      We appreciate your willingness to take responsibility for the assigned requests or complaints 
      and to provide timely assistance to our students in resolving their concerns.</p>
      <p>We have granted you access to the following inquiries with the Role ${positionNames[position]}.</p>
      <p>Here are inquiry details you can access:</p>
      <ul>${accessToString}</ul> 
      <p>Here are your account details:</p>
      <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Title:</strong>${title}</li>
          <li><strong>First Name:</strong>${firstName}</li>
          <li><strong>Last Name:</strong>${lastName}</li>
          <li><strong>Department:</strong>${positionNames[position]}</li>
      </ul>
      <p>If you have any technical questions, please don’t hesitate to reach out to us at marketing@edu.umch.de.
      You can log in using these credentials <a href="https://umch-ticket-system.vercel.app/admin">LINK</a>.Thank you for your support, and we look forward to a successful collaboration!.</p>
      <p>Best regards,</p>
      <p>Your UMCH Team</p>
    `;

    // Send the confirmation email
    await sendEmail(
      email,
      firstName + lastName,
      "Welcome to the UMCH Ticket System Team!",
      "Welcome ! Now you are in a admin role in UMCH ticket system!",
      emailContent
    );

    res.status(201).json({
      message: "Role was updated successfully, confirmation email sent."
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all received inquiries
const getReceivedInquiries = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("category");

    if (!user) {
      return res.status(404).json({ message: "Category not found" });
    }

    const inquiries = await Inquiry.find();

    const filteredTickets = inquiries.filter((log) => {
      // Find the matching permission for this ticket
      const userPermissionForTicket = user.category.find((typeInfo) => {
        // Ensure inquiryCategory and subCategory1 match
        return (
          typeInfo.inquiryCategory === log.inquiryCategory &&
          typeInfo.subCategory1 === log.subCategory1
        );
      });
      return (
        userPermissionForTicket && userPermissionForTicket.permission !== "None"
      );
    });

    if (req.user.email === process.env.SUPER_ADMIN_EMAIL)
      res.json({ inquiries: inquiries, userCategory: "SuperAdmin" });
    else res.json({ inquiries: filteredTickets, userCategory: user.category });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inquiries", error });
  }
};

// Get inquiries by enrollment number

const getInquiriesByEnrollmentNumber = async (req, res) => {
  const { enrollmentNumber } = req.params;

  try {
    const user = await User.findById(req.user.id).select("category");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!enrollmentNumber) {
      return res.status(404).json({ message: "Enrollment is required" });
    }

    const inquiries = await Inquiry.find({
      enrollmentNumber: enrollmentNumber
    });

    if (inquiries.length === 0) {
      return res
        .status(404)
        .json({ message: "No inquiries found for this enrollment number." });
    } else {
      return res.status(200).json(inquiries);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving inquiries.",
      error
    });
  }
};

// Get an inquiry by ID
const getInquiryByID = async (req, res) => {
  try {
    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName role title position category"
    );

    const result = await Inquiry.findById(req.params.id);
    let isOriginalClicked = false;
    if (result.isClicked === 1) {
      isOriginalClicked = true;
    }
    if (result.status == 0 && authedUser?.role != 2) {
      result.status = 1;
      result.isClicked = 1;
    }
    if (
      (result.status == 2 ||
        result.status == 4 ||
        result.status == 5 ||
        result.status == 6) &&
      authedUser?.role != 2
    ) {
      result.isClicked = 1;
    }
    if (result.status == 3 && authedUser?.role != 2) {
      result.isClicked = 1;
    }

    await result.save();

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) res.status(404).json({ message: "Inquiry not found" });
    res
      .status(201)
      .json({ inquiry: inquiry, isOriginalClicked: isOriginalClicked });
  } catch (error) {
    res.status(500).json({ message: "Error checking inquiry", error });
  }
};
// Check an inquiry
const checkInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate(
      "inquiryCategory"
    );
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    inquiry.status = 1;
    await inquiry.save();

    const emailContent = `
    <h>Dear <strong>${inquiry.firstName} ${inquiry.lastName}</strong></h>
    <p>Your ticket <strong>${inquiry.inquiryNumber}<strong> on <strong> ${inquiry.inquiryCategory.name
      }</strong> submitted at <strong>${inquiry.createdAt
      }</strong> is under checking now.</p>
    <p>We will get back to you shortly with further updates.
    Wishing you a great day, and we will follow up with more information soon.</p>
    <br />
    <p>Best regards,</p>
    <p>${authedUser.firstName} ${authedUser.lastName}</p>
    <p>${authedUser.title ? authedUser.title : "Professor"}</p>
    <p>${authedUser.position ? positionNames[authedUser.position] : "Vice Rector"
      }</p>
    <p>${authedUser.email}</p>
    `;

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + " " + inquiry.lastName,
      `Your ticket is being checked - Ticket Number ${inquiry.inquiryNumber}!`,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      emailContent
    );

    res.json({
      message: "Inquiry checked and sent confirmation message",
      inquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking inquiry", error });
  }
};

// Accept an inquiry
const acceptInquiry = async (req, res) => {
  const { replaceSubject, replacedEmailTemplate, id } = req.body;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    inquiry.status = 2;
    inquiry.isClicked = 0;
    const updatedHtmlContent = replacedEmailTemplate.replace(
      /<a [^>]*>(.*?)<\/a>/g,
      (match, innerText) => {
        return `<a>${innerText.toLowerCase()}</a>`;
      }
    );
    inquiry.emailContent = updatedHtmlContent;
    await inquiry.save();

    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + inquiry.lastName,
      replaceSubject,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      replacedEmailTemplate.concat(contactReopenInfo)
    );
    const updatedInquiry = await Inquiry.findById(id);
    res.json({
      message: "Inquiry accepted and sent confirmation message",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

const acceptEnrollmentInquiry = async (req, res) => {
  const {
    replaceSubject,
    replacedEmailTemplate,
    id,
    studentNo,
    selectedTicket,
    formData
  } = req.body;

  try {
    let result;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    (async () => {
      try {
        let documents;
        result = await convertHtmlToPdf(formData, selectedTicket);
        documents = selectedTicket.documents;
        documents.push({
          url: result, // result contains the PDF URL returned from convertHtmlToPdf
          filename: `Credential.pdf` // Example filename for the generated PDF
        });

        inquiry.status = 2;
        inquiry.isClicked = 0;
        await inquiry.save();
        inquiry.documents = documents;
        const updatedHtmlContent = replacedEmailTemplate.replace(
          /<a [^>]*>(.*?)<\/a>/g,
          (match, innerText) => {
            return `<a>${innerText.toLowerCase()}</a>`;
          }
        );
        inquiry.emailContent = updatedHtmlContent;
        await inquiry.save();

        // Send the confirmation email
        await sendEmail(
          inquiry.email,
          inquiry.firstName + inquiry.lastName,
          `Your Enrollment Certificate -  Ticket Number ${inquiry.inquiryNumber}!`,
          `Dear ${inquiry.firstName} ${inquiry.lastName}`,
          replacedEmailTemplate.concat(contactReopenInfo),
          result
        );

        const updatedInquiry = await Inquiry.findById(id);

        res.json({
          message: "Inquiry accepted and sent confirmation message",
          inquiry: updatedInquiry
        });
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

const previewCredentialPDF = async (req, res) => {
  const selectedTicket = req.body;
  const formData = {
    nationality: selectedTicket?.details?.nationality,
    currentYearOfStudy: selectedTicket?.details?.currentYearOfStudy
  };
  const id = selectedTicket?._id;
  try {
    let result;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    (async () => {
      try {
        result = await convertHtmlToPdf(formData, selectedTicket);
        res.json({
          message: "Credential PDF Preview",
          pdf_url: result
        });
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

const acceptExamInspection = async (req, res) => {
  const {
    replaceSubject,
    replacedEmailTemplate,
    id,
    selectedTicket,
    formData
  } = req.body;

  try {
    let result;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    try {
      inquiry.status = 2;
      inquiry.isClicked = 0;
      await inquiry.save();

      const updatedHtmlContent = replacedEmailTemplate.replace(
        /<a [^>]*>(.*?)<\/a>/g,
        (match, innerText) => {
          return `<a>${innerText.toLowerCase()}</a>`;
        }
      );
      inquiry.emailContent = updatedHtmlContent;
      await inquiry.save();

      // Send the confirmation email
      await sendEmail(
        inquiry.email,
        inquiry.firstName + inquiry.lastName,
        ` Approval for Exam Review – Confirmation Required -  Ticket Number ${inquiry.inquiryNumber}!`,
        `Dear ${inquiry.firstName} ${inquiry.lastName}`,
        replacedEmailTemplate.concat(contactReopenInfo),
        result
      );

      const updatedInquiry = await Inquiry.findById(id);

      res.json({
        message: "Inquiry accepted and sent confirmation message",
        inquiry: updatedInquiry
      });
    } catch (error) {
      console.error("Error:", error);
    }
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

const acceptTransferTarguMuresInquiry = async (req, res) => {
  const {
    replaceSubject,
    replacedEmailTemplate,
    formData,
    id,
    selectedTicket
  } = req.body;

  try {
    let result;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    (async () => {
      try {
        let documents;
        result = await convertHtmlToTransferTarguPdf(formData, selectedTicket);
        documents = selectedTicket.documents;

        documents.push({
          url: result, // result contains the PDF URL returned from convertHtmlToPdf
          filename: `_Request_Transfer to Targu Mures (1).pdf` // Example filename for the generated PDF
        });

        inquiry.status = 2;
        inquiry.isClicked = 0;
        inquiry.documents = documents;
        const updatedHtmlContent = replacedEmailTemplate.replace(
          /<a [^>]*>(.*?)<\/a>/g,
          (match, innerText) => {
            return `<a>${innerText.toLowerCase()}</a>`;
          }
        );
        inquiry.emailContent = updatedHtmlContent;

        await inquiry.save();

        await sendEmail(
          inquiry.email,
          inquiry.firstName + inquiry.lastName,
          `Your Enrollment Certificate -  Ticket Number ${inquiry.inquiryNumber}!`,
          `Dear ${inquiry.firstName} ${inquiry.lastName}`,
          replacedEmailTemplate.concat(contactReopenInfo),
          result
        );

        const updatedInquiry = await Inquiry.findById(id);

        res.json({
          message: "Inquiry accepted and sent confirmation message",
          inquiry: updatedInquiry
        });
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

const processTranscriptRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    inquiry.status = 4;
    inquiry.isClicked = 0;
    await inquiry.save();
    const updatedInquiry = await Inquiry.findById(id);
    res.json({
      message: "Inquiry was updated to Process Status",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting inquiry", error });
  }
};

const doneTranscriptRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    inquiry.status = 5;
    inquiry.isClicked = 0;
    await inquiry.save();
    const updatedInquiry = await Inquiry.findById(id);
    res.json({
      message: "Inquiry was updated to Done Status",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting inquiry", error });
  }
};

const NotifyTranscriptRecord = async (req, res) => {
  // const { id } = req.params;
  // console.log(req.params);
  // try {
  //   const inquiry = await Inquiry.findById(id);
  //   if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
  //   inquiry.status = 6;
  //   inquiry.isClicked = 0;
  //   await inquiry.save();
  //   const updatedInquiry = await Inquiry.findById(id);
  //   res.json({
  //     message: "Inquiry was updated to Notify Status",
  //     inquiry: updatedInquiry
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Error rejecting inquiry", error });
  // }

  const { replaceSubject, replacedEmailTemplate, id } = req.body;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    inquiry.status = 6;
    inquiry.isClicked = 0;
    const updatedHtmlContent = replacedEmailTemplate.replace(
      /<a [^>]*>(.*?)<\/a>/g,
      (match, innerText) => {
        return `<a>${innerText.toLowerCase()}</a>`;
      }
    );
    inquiry.emailContent = updatedHtmlContent;
    await inquiry.save();

    const categoryName = inquiry.subCategory1
      ? subCategoryNames[inquiry.subCategory1 - 1]
      : inquriyCategoryNames[inquiry.inquiryCategory - 1];

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + inquiry.lastName,
      `Decision on Your Request of ${categoryName} - Ticket Number ${inquiry.inquiryNumber}!`,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      replacedEmailTemplate
    );
    const updatedInquiry = await Inquiry.findById(id);
    res.json({
      message: "Inquiry accepted and sent confirmation message",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

// Reject an inquiry
const rejectInquiry = async (req, res) => {
  const { replaceSubject, replacedEmailTemplate, id } = req.body;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    inquiry.status = 3;
    inquiry.isClicked = 0;
    const updatedHtmlContent = replacedEmailTemplate.replace(
      /<a [^>]*>(.*?)<\/a>/g,
      (match, innerText) => {
        return `<a>${innerText.toLowerCase()}</a>`;
      }
    );
    inquiry.emailContent = updatedHtmlContent;
    await inquiry.save();

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + inquiry.lastName,
      replaceSubject,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      replacedEmailTemplate.concat(contactReopenInfo)
    );
    const updatedInquiry = await Inquiry.findById(id);
    res.json({
      message: "Inquiry rejected and confirmation email sent",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting inquiry", error });
  }
};

const closeInquiry = async (req, res) => {
  console.log("closing ticket")
  const { replaceSubject, replacedEmailTemplate, id } = req.body;
  try {
    const updatingInquiry = await Inquiry.findById(id);
    if (!updatingInquiry) {
      return res.status(400).json({ message: "Not found Inquiry" });
    }
    const contactReopenInfo = `<a href='${process.env.HOST}/#/ticket-reopen/${id}'>Reopen Ticket</a>`;

    // Send the confirmation email
    await sendEmail(
      updatingInquiry.email,
      updatingInquiry.firstName + updatingInquiry.lastName,
      replaceSubject,
      `Dear ${updatingInquiry.firstName} ${updatingInquiry.lastName}`,
      replacedEmailTemplate.concat(contactReopenInfo)
    );

    updatingInquiry.status = 7;
    await updatingInquiry.save();
    return res
      .status(200)
      .json({ message: "Successfully closed", data: updatingInquiry });
  } catch (error) {
    res.status(500).json({ message: "Error closing inquiry", error });
  }
};

const reOpenTicket = async (req, res) => {
  const { ticket_id, reason } = req.body;
  try {
    const inquiry = await Inquiry.findById(ticket_id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    inquiry.status = 0;
    inquiry.reason = reason;
    await inquiry.save();
    const updatedInquirynquiry = await Inquiry.findById(ticket_id);

    res.json({
      message: "Inquiry was reopened",
      inquiry: updatedInquirynquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error reopen inquiry", error });
  }
};

const sendPassEmail = async (req, res) => {
  const { selectedMail, personalMsg, selectedTicket } = req.body;

  let title = "Inquiry Information for Pass To Another Department";
  if (req.user.role === 2) {
    title = "Inquiry Information for Forward Ticket";
  }

  let emailContent =
    "<p>Student Name: " +
    selectedTicket?.firstName +
    " " +
    selectedTicket?.lastName +
    "</p>" +
    "<p>Enrollment Number:" +
    selectedTicket?.enrollmentNumber +
    "</p><br />";

  if (personalMsg) {
    emailContent = emailContent + "<hr/>" + "<p>" + personalMsg + "</p>";
  }

  Object.entries(selectedTicket?.details).forEach(([key, value]) => {
    emailContent =
      emailContent +
      "<hr/><p>Ticket Information</p>" +
      "<p>" +
      formatWord(key) +
      ":" +
      "<span>" +
      value +
      "</span>" +
      "</p>";
  });

  try {
    let attachment = "";
    if (selectedTicket?.documents[0]) {
      attachment = selectedTicket?.documents[0].url;
    }

    await sendEmail(
      selectedMail,
      selectedTicket?.firstName + " " + selectedTicket?.lastName,
      title,
      title,
      emailContent,
      attachment
    );
    res.json({ message: "Email was sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending Pass To Other Department Email" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params; // Get user ID from the request parameters

  try {
    // Find the user by email
    const user = await User.findOne({ email: id });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of Super Admin
    if (user.role === 0 && user.email === process.env.SUPER_ADMIN_EMAIL) {
      return res.status(200).json({ message: "SuperAdmin" });
    }

    // Delete the user
    await User.deleteOne({ email: id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset selected user's password to "123456"
const resetPasswordToDefault = async (req, res) => {
  const { id } = req.params; // User ID from request parameters

  try {
    // Find the user by ID
    const user = await User.findOne({ email: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Default password to reset to
    const defaultPassword = "123456";

    user.password = defaultPassword;
    await user.save();

    res.status(200).json({ message: "Password reset to default successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const internalNote = async (req, res) => {
  const { selectedTicket, mailContent } = req.body;
  if (!selectedTicket || !selectedTicket._id) {
    return res.status(400).json({ message: "Select Ticket is required" });
  }
  if (!mailContent) {
    return res.status(400).json({ message: "Mail content is required" });
  }

  try {
    const newAdditionalMessage = new AdditionalMessage({
      inquiry: selectedTicket._id,
      user: req.user.id,
      content: mailContent
    });
    await newAdditionalMessage.save();
    return res.status(200).json({
      data: newAdditionalMessage,
      message: "Successfully created new internal note"
    });
  } catch (error) {
    console.log(error, "create internal note");
    return res
      .status(400)
      .json({ message: "Error occured on creating internal note" });
  }
};

const replyStudent = async (req, res) => {
  const { selectedTicket, mailContent, documents } = req.body;
  if (!selectedTicket) {
    return res.status(400).json({ message: "Select Ticket is required" });
  }
  if (!mailContent) {
    return res.status(400).json({ message: "Mail content is required" });
  }

  const _selectedTicket = JSON.parse(selectedTicket);

  try {
    const newAdditionalMessage = new AdditionalMessage({
      inquiry: _selectedTicket._id,
      user: req.user.id,
      content: mailContent,
      state: "replyStudent",
      document:
        req.files.length > 0
          ? {
            url: `/uploads/documents/${req.files[0].filename}`,
            filename: req.files[0].originalname
          }
          : null
    });
    await newAdditionalMessage.save();

    // send mail to student
    if (req.user.role !== 2) {
      await sendEmail(
        _selectedTicket.email,
        _selectedTicket?.firstName + " " + _selectedTicket?.lastName,
        "Reply to student about the ticket",
        "Reply to student about the ticket",
        mailContent
      );
    }

    return res.status(200).json({
      data: newAdditionalMessage,
      message: "Successfully reply to studnet"
    });
  } catch (error) {
    console.log(error, "Error occured on reply student");
    return res
      .status(400)
      .json({ message: "Error occured on reply to student" });
  }
};

const getInternalNote = async (req, res) => {
  const userRole = req.user.role;
  if (userRole === 2) {
    return res
      .status(400)
      .json({ message: "Error occured: you are not admin" });
  }
  try {
    const internalNoteList = await AdditionalMessage.find({
      state: "internalNote"
    })
      .populate("inquiry", ["_id", "inquiryNumber"])
      .populate("user", ["_id", "firstName", "lastName", "position"]);
    return res.status(200).json({
      data: internalNoteList,
      message: "Successfully fetched internal notes"
    });
  } catch (error) {
    console.log(error, "Error occured on fetching internal notes");
    return res
      .status(400)
      .json({ message: "Error occured on fetching internal notes" });
  }
};

const getReplyStudentMessageList = async (req, res) => {
  try {
    const replyStudentMessageList = await AdditionalMessage.find({
      state: "replyStudent"
    })
      .populate("inquiry", ["_id", "inquiryNumber"])
      .populate("user", ["_id", "firstName", "lastName", "position", "role"]);

    return res.status(200).json({
      data: replyStudentMessageList,
      message: "Successfully fetched reply messages"
    });
  } catch (error) {
    console.log(error, "Error occured on fetching reply messages");
    return res
      .status(400)
      .json({ message: "Error occured on fetching reply messages" });
  }
};

const getReplyStudentMessage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Not found user" });
    }

    const replyStudentMessageList = await AdditionalMessage.find({
      state: "replyStudent"
    })
      .populate({
        path: "inquiry",
        select: ["_id", "inquiryNumber", "enrollmentNumber"],
        match: { enrollmentNumber: user.enrollmentNumber }
      })
      .populate("user", ["_id", "firstName", "lastName", "position", "role"]);
    return res.status(200).json({
      data: replyStudentMessageList,
      message: "Successfully fetched reply message"
    });
  } catch (error) {
    console.log(error, "Error occured on fetching reply message for student");
    return res
      .status(400)
      .json({ message: "Error occured on fetching reply message for student" });
  }
};

module.exports = {
  createRole,
  editRole,
  getUsers,
  getReceivedInquiries,
  getInquiryByID,
  checkInquiry,
  acceptInquiry,
  rejectInquiry,
  getInquiriesByEnrollmentNumber,
  reOpenTicket,
  acceptEnrollmentInquiry,
  previewCredentialPDF,
  acceptExamInspection,
  processTranscriptRecord,
  doneTranscriptRecord,
  NotifyTranscriptRecord,
  sendPassEmail,
  deleteUser,
  resetPasswordToDefault,
  acceptTransferTarguMuresInquiry,
  closeInquiry,
  internalNote,
  replyStudent,
  getInternalNote,
  getReplyStudentMessageList,
  getReplyStudentMessage
};
