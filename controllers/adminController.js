const { validationResult } = require("express-validator");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");
const { sendEmail } = require("../services/mailjetService");

require("dotenv").config();
const positionNames = process.env.POSITION_NAMES.split(",");

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
    category,
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
      category,
    });

    await newUser.save();

    const accessToString = category.map(item => {
      const categoryInfo = item.subCategory1 ? `${item.subCategory1}` : `${item.inquiryCategory}`;
      return `${categoryInfo} ( ${item.permission} )`;
    }).join(' | ');

    const emailContent = `
      <h3>Dear ${firstName} ${lastName}</h3>
      <p>You are now part of the UMCH Ticket System Team, and we are pleased to welcome you onboard.
      The UMCH Ticket System serves as a digital request and complaint portal for students.
      We appreciate your willingness to take responsibility for the assigned requests or complaints 
      and to provide timely assistance to our students in resolving their concerns.</p>
      <p>We have granted you access to the following inquiries ${accessToString} with the Role ${positionNames[position]}.</p>
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

// Get all received inquiries
const getReceivedInquiries = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("category");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const inquiries = await Inquiry.find();

    const visibleCategories = new Set();

    user.category.forEach((cat) => {
      if (cat.permission !== "None") {
        if (cat.subCategory1) visibleCategories.add(cat.subCategory1);
        else visibleCategories.add(cat.inquiryCategory);
      }
    });

    const filteredInquiries = inquiries.filter((inquiry) => {
      return (
        visibleCategories.has(inquiry.inquiryCategory) ||
        visibleCategories.has(inquiry.subCategory1)
      );
    });

    if (req.user.email === process.env.SUPER_ADMIN_EMAIL)
      res.json({ inquiries, userCategory: user.category });
    else res.json({ inquiries: filteredInquiries, userCategory: user.category });
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

    const inquiries = await Inquiry.find({ enrollmentNumber: enrollmentNumber});

    if (inquiries.length === 0) {
      return res
        .status(404)
        .json({ message: "No inquiries found for this enrollment number." });
    }else{
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
      error,
    });
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

    if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      const categoryPermission = authedUser.category.find(
        (cat) =>
          cat.subCategory1 === inquiry.subCategory1 ||
          cat.inquiryCategory === inquiry.inquiryCategory
      );

      if (
        categoryPermission &&
        (categoryPermission.permission === "None" ||
          categoryPermission.permission === "Passive")
      ) {
        return res.status(403).json({
          message: "You do not have permission to check this inquiry.",
        });
      }
    }

    inquiry.status = 1;
    await inquiry.save();

    const emailContent = `
    <h>Dear ${inquiry.firstName} ${inquiry.lastName}</h>
    <p>Your ticket ${inquiry.enrollmentNumber} on ${
      inquiry.inquiryCategory
    } submitted at ${inquiry.createdAt} is under checking now.</p>
    <p>We will get back to you shortly with further updates.
    Wishing you a great day, and we will follow up with more information soon.</p>
    <p>Best regards,</p>
    <p>${authedUser.firstName} ${authedUser.lastName}</p>
    <p>${authedUser.title ? authedUser.title : "Professor"}</p>
    <p>${
      authedUser.position ? positionNames[authedUser.position] : "Vice Rector"
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
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking inquiry", error });
  }
};

// Accept an inquiry
const acceptInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      const categoryPermission = authedUser.category.find(
        (cat) =>
          cat.subCategory1 === inquiry.subCategory1 ||
          cat.inquiryCategory === inquiry.inquiryCategory
      );

      if (
        categoryPermission &&
        (categoryPermission.permission === "None" ||
          categoryPermission.permission === "Passive" ||
          categoryPermission.permission === "Active")
      ) {
        return res.status(403).json({
          message: "You do not have permission to approve this inquiry.",
        });
      }
    }

    inquiry.status = 2;
    await inquiry.save();

    const emailContent = `
    <h>Dear ${inquiry.firstName} ${inquiry.lastName}</h>
    <p>Thank you for your request and for placing your trust in us. We have carefully reviewed your request and would like to inform you of the following decision:</p>
    <p>Congratulatjons! Your request has been approved.</p>
    <p>Please make sure to inform your teachers about the decision and any subsequent steps you need to take. If you have any further questions or need additional clarification, feel free to <a href="https://umch-ticket-system.vercel.app/login">contact us</a>.</p>
    <p>Thank you for your understanding and cooperation.</p>
    <p>Best regards,</p>
    <p>${authedUser.firstName} ${authedUser.lastName}</p>
    <p>${authedUser.title ? authedUser.title : "Professor"}</p>
    <p>${
      authedUser.position ? positionNames[authedUser.position] : "Vice Rector"
    }</p>
    <p>${authedUser.email}</p>
    `;

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + inquiry.lastName,
      `Decision on Your Request of ${inquiry.inquiryCategory} - Ticket Number ${inquiry.inquiryNumber}!`,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      emailContent
    );

    res.json({
      message: "Inquiry accepted and sent confirmation message",
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting inquiry", error });
  }
};

// Reject an inquiry
const rejectInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    const authedUser = await User.findById(req.user.id).select(
      "email firstName lastName title position category"
    );

    if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      const categoryPermission =
        authedUser.category.find(
          (cat) => cat.subCategory1 === inquiry.subCategory1
        ) || cat.inquiryCategory === inquiry.inquiryCategory;

      if (
        categoryPermission &&
        (categoryPermission.permission === "None" ||
          categoryPermission.permission === "Passive" ||
          categoryPermission.permission === "Active")
      ) {
        return res.status(403).json({
          message: "You do not have permission to approve this inquiry.",
        });
      }
    }

    inquiry.status = 3;
    await inquiry.save();

    const emailContent = `
    <h>Dear ${inquiry.firstName} ${inquiry.lastName}</h>
    <p>Thank you for your request and for placing your trust in us. We have carefully reviewed your request and would like to inform you of the following decision:</p>
    <p>We regret to inform you that your request has been declined. We understand this may be disappointing,
    and we encourage you to reach out if you have any questions about the decision or need further assistance.</p>
    <p>If you have any further questions or need additional clarification, feel free to <a href="https://umch-ticket-system.vercel.app/login">contact us</a>.</p>
    <p>Thank you for your understanding and cooperation.</p>
    <p>Best regards,</p>
    <p>${authedUser.firstName} ${authedUser.lastName}</p>
    <p>${authedUser.title ? authedUser.title : "Professor"}</p>
    <p>${
      authedUser.position ? positionNames[authedUser.position] : "Vice Rector"
    }</p>
    <p>${authedUser.email}</p>
    `;

    // Send the confirmation email
    await sendEmail(
      inquiry.email,
      inquiry.firstName + inquiry.lastName,
      `Decision on Your Request of ${inquiry.inquiryCategory} - Ticket Number ${inquiry.inquiryNumber}!`,
      `Dear ${inquiry.firstName} ${inquiry.lastName}`,
      emailContent
    );

    res.json({
      message: "Inquiry rejected and confirmation email sent",
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting inquiry", error });
  }
};

module.exports = {
  createRole,
  getUsers,
  getReceivedInquiries,
  checkInquiry,
  acceptInquiry,
  rejectInquiry,
  getInquiriesByEnrollmentNumber,
};
