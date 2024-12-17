const EmailTemplate = require("../models/EmailTemplate");

require("dotenv").config();

const addEmailTemplate = async (req, res) => {
  try {
    const {
      inquiryCategory,
      subCategory1,
      emailTemplateTitle,
      emailTemplateContent,
      emailTemplateState
    } = req.body;

    const existingTemplate = await EmailTemplate.findOne({
      emailTemplateTitle: emailTemplateTitle,
      subCategory1: subCategory1,
      inquiryCategory: inquiryCategory,
      emailTemplateState: emailTemplateState
    });
    if (existingTemplate) {
      return res.status(400).json({ message: "Template Title already exists" });
    }

    // check student default emailtemplate
    if (subCategory1 === "student") {
      const studentEmailTemplate = await EmailTemplate.findOne({
        subCategory1: subCategory1
      });
      if (studentEmailTemplate) {
        return res.status(400).json({ message: "Template for student already exists" });
      }
    }

    const newEmailTemplate = new EmailTemplate({
      inquiryCategory: (inquiryCategory !== "" ? inquiryCategory : "Default"),
      subCategory1,
      emailTemplateTitle: (subCategory1 === "student" ? "Student" : emailTemplateTitle),
      emailTemplateContent,
      emailTemplateState: (subCategory1 === "student" ? "Student" : emailTemplateState)
    });

    await newEmailTemplate.save();

    return res.status(201).json({
      message: "Email Template was created successfully",
      emailTemplate: newEmailTemplate
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTemplate = await EmailTemplate.findById(id);
    if (!existingTemplate) {
      return res.status(400).json({ message: "Template Title no exists" });
    }

    return res.status(201).json({
      message: "Email Template exists",
      data: existingTemplate
    });
  } catch (error) {
    console.error("Error getting email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmailTemplatesByCategory = async (req, res) => {
  try {
    const { inquiryCategory, subCategory1, emailTemplateState } = req.body;

    const existingTemplates = await EmailTemplate.find({
      inquiryCategory,
      subCategory1,
      emailTemplateState
    });

    const defaultTempates = await EmailTemplate.find({
      inquiryCategory: "Default",
      subCategory1: { $ne: "student" }
    })

    if (!existingTemplates && !defaultTempates) {
      return res.status(400).json({ message: "Template Title no exists" });
    }

    return res.status(201).json({
      message: "Email Template exists",
      data: existingTemplates?.length > 0 ? existingTemplates : existingTemplates.concat(defaultTempates)
    });
  } catch (error) {
    console.error("Error getting email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmailTemplate = async (req, res) => {
  try {
    const allTemplates = await EmailTemplate.find();

    return res.status(201).json({
      message: "Email Template exists",
      emailTemplate: allTemplates
    });
  } catch (error) {
    console.error("Error getting email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editEmailTemplate = async (req, res) => {
  try {
    const { id, emailTemplateTitle, emailTemplateContent } = req.body;

    const emailTemplate = await EmailTemplate.findById(id);
    emailTemplate.emailTemplateTitle = emailTemplateTitle;
    emailTemplate.emailTemplateContent = emailTemplateContent;

    emailTemplate.save();

    const allTemplates = await EmailTemplate.find();

    return res.status(201).json({
      message: "Email Template was updated",
      emailTemplates: allTemplates
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const emailTemplate = await EmailTemplate.findById(id);
    if (!emailTemplate) {
      return res.status(400).json({ message: "Template no exists" });
    }

    await EmailTemplate.findOneAndDelete({ _id: id });

    return res.status(201).json({
      message: "Email Template was deleted",
      emailTemplate: emailTemplate
    });
  } catch (error) {
    console.error("Error deleting email template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addEmailTemplate,
  getEmailTemplate,
  getEmailTemplatesByCategory,
  getAllEmailTemplate,
  editEmailTemplate,
  deleteEmailTemplate
};
