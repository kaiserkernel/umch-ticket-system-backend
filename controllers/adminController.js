const { validationResult } = require("express-validator");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const { sendEmail } = require("../services/mailjetService");

const {
  convertHtmlToPdf,
  convertHtmlToTransferTarguPdf
} = require("../services/wordConvertService");

require("dotenv").config();
const positionNames = process.env.POSITION_NAMES.split(",");
const subCategoryNames = process.env.SUB_CATEGORIES.split(",");
const inquriyCategoryNames = process.env.INQUIRY_CATEGORIES.split(",");

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
    existingUser.password = password;
    existingUser.position = position;
    existingUser.title = title;
    existingUser.category = category;
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

    // const visibleCategories = new Set();

    // user.category.forEach((cat) => {
    //   if (cat.permission !== "None") {
    //     if (cat.subCategory1) visibleCategories.add(cat.subCategory1);
    //     else visibleCategories.add(cat.inquiryCategory);
    //   }
    // });

    // const filteredInquiries = inquiries.filter((inquiry) => {
    //   return (
    //     visibleCategories.has(inquiry.inquiryCategory) ||
    //     visibleCategories.has(inquiry.subCategory1)
    //   );
    // });

    const filteredTickets = inquiries.filter((ticket) => {
      // Find the matching permission for this ticket
      const permission = user?.category.find(
        (p) =>
          p.inquiryCategory === ticket.inquiryCategory &&
          p.subCategory1 === ticket.subCategory1
      );

      // If the permission is not 'None', the ticket is visible
      return permission && permission.permission !== "Responsible";
    });

    console.log(filteredTickets, "===filteredTickets");

    if (req.user.email === process.env.SUPER_ADMIN_EMAIL)
      res.json({ inquiries: inquiries, userCategory: user.category });
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

    // const visibleCategories = new Set();
    // user.category.forEach((cat) => {
    //   if (cat.permission !== "None") {
    //     if (cat.subCategory1) visibleCategories.add(cat.subCategory1);
    //     else visibleCategories.add(cat.inquiryCategory);
    //   }
    // });

    // const filteredInquiries = inquiries.filter((inquiry) => {
    //   return (
    //     visibleCategories.has(inquiry.inquiryCategory) ||
    //     visibleCategories.has(inquiry.subCategory1)
    //   );
    // });

    // if (filteredInquiries.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No inquiries found within accessible categories." });
    // }

    // if (req.user.email === process.env.SUPER_ADMIN_EMAIL)
    //   return res.status(200).json(inquiries);
    // else return res.status(200).json(filteredInquiries);
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
    console.log(result);
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
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    inquiry.status = 1;
    await inquiry.save();

    const emailContent = `
    <h>Dear <strong>${inquiry.firstName} ${inquiry.lastName}</strong></h>
    <p>Your ticket <strong>${inquiry.inquiryNumber}<strong> on <strong> ${INQUIRYCATEGORIES[inquiry.inquiryCategory - 1]
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
  console.log(req.body, "====accept inquiry");
  const { replaceSubject, replacedEmailTemplate, id } = req.body;
  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    inquiry.status = 2;
    inquiry.isClicked = 0;
    const updatedHtmlContent = replacedEmailTemplate.replace(
      /<a [^>]*>(.*?)<\/a>/g,
      (match, innerText) => {
        return `<a>${innerText.toLowerCase()}</a>`;
      }
    );
    inquiry.emailContent = updatedHtmlContent;
    console.log(inquiry);
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

const acceptEnrollmentInquiry = async (req, res) => {
  console.log(req.body, "====accept enrollment inquiry");
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

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

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
        console.log(inquiry);
        await inquiry.save();

        console.log(documents, "====enrollment  documents");

        const categoryName = inquiry.subCategory1
          ? subCategoryNames[inquiry.subCategory1 - 1]
          : inquriyCategoryNames[inquiry.inquiryCategory - 1];

        // Send the confirmation email
        console.log(result, "====result");
        await sendEmail(
          inquiry.email,
          inquiry.firstName + inquiry.lastName,
          `Your Enrollment Certificate -  Ticket Number ${inquiry.inquiryNumber}!`,
          `Dear ${inquiry.firstName} ${inquiry.lastName}`,
          replacedEmailTemplate,
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

const acceptExamInspection = async (req, res) => {
  console.log(req.body, "====accept enrollment inquiry");
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

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    try {
      let documents;

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
      console.log(inquiry);
      await inquiry.save();

      const categoryName = inquiry.subCategory1
        ? subCategoryNames[inquiry.subCategory1 - 1]
        : inquriyCategoryNames[inquiry.inquiryCategory - 1];

      // Send the confirmation email
      console.log(result, "====result");

      await sendEmail(
        inquiry.email,
        inquiry.firstName + inquiry.lastName,
        ` Approval for Exam Review – Confirmation Required -  Ticket Number ${inquiry.inquiryNumber}!`,
        `Dear ${inquiry.firstName} ${inquiry.lastName}`,
        replacedEmailTemplate,
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

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

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
          replacedEmailTemplate,
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
  console.log(req.params);
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
  console.log(req.params);
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

  console.log(req.body, "====accept inquiry");
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
    console.log(inquiry);
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

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

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
      message: "Inquiry rejected and confirmation email sent",
      inquiry: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting inquiry", error });
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
  const { selectedOptions, selectedTicket } = req.body;
  let emailContent =
    "<p>Full Name: " +
    selectedTicket?.firstName +
    " " +
    selectedTicket?.lastName +
    "</p>" +
    "<p>Enrollment Number:" +
    selectedTicket?.enrollmentNumber +
    "</p><br />";

  Object.entries(selectedTicket?.details).forEach(([key, value]) => {
    console.log(`Key: ${key}, Value: ${value}`);
    emailContent =
      emailContent + "<p>" + key + ":" + "<span>" + value + "</span>" + "</p>";
  });

  try {
    const results = await Promise.all(
      selectedOptions.map(async (option) => {
        // Send the confirmation email
        await sendEmail(
          option?.value,
          selectedTicket?.firstName + selectedTicket?.lastName,
          "Inquiry Information for Pass To Another Department",
          "Inquiry Information for Pass To Another Department",
          emailContent
        );
      })
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
  acceptExamInspection,
  processTranscriptRecord,
  doneTranscriptRecord,
  NotifyTranscriptRecord,
  sendPassEmail,
  deleteUser,
  resetPasswordToDefault,
  acceptTransferTarguMuresInquiry
};
