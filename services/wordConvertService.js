const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const jsPDF = require("jspdf").jsPDF; // Using CommonJS syntax

const outputPath = "public/uploads/documents/";

// Helper function to read an image as base64
function getBase64Image(imagePath) {
  return fs.readFileSync(imagePath, { encoding: "base64" });
}

// Helper function to generate the HTML content with replaced values
function generateHtmlContent(htmlTemplate, replacements) {
  let content = htmlTemplate;
  Object.keys(replacements).forEach((key) => {
    const value = replacements[key];
    content = content.replace(`[${key}]`, value);
  });
  return content;
}

// Helper function to create the PDF file using Puppeteer
async function createPdf(content, fileName) {
  try {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save(outputPath + fileName);
    console.log('PDF generated successfully');
    return "/uploads/documents/" + fileName;
  } catch (error) {
    console.error('Error fetching URL:', error);
    return null
  }
}

async function convertHtmlToPdf(formData, selectedTicket) {
  const bgImagePath = path.join(__dirname, "../public/docTemplate/bg.webp");
  const bgImageBase64 = getBase64Image(bgImagePath);

  const htmlTemplate = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-image: url("data:image/png;base64,${bgImageBase64}");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          color: black;
          padding-left: 90px;
          padding-right: 90px;
          padding-top: 40px;
          letter-spacing: 1px;
        }
        .number { font-size: 12px; font-weight: bold; margin-top: 50px; }
        .small { font-size: 12px; }
        p { font-size: 14px; line-height: 1.5; }
        .content-box { margin-top: 110px; max-width: 600px; }
        .content-info { margin-top: 100px; text-align: center; font-weight: bold; }
        .fw-bold {font-weight:bold;}
        .content { margin-top: 100px; }
        .text-center { text-align: center; }
        .mt-40 { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="content-box">
        <span class="number">Reg. no.:</span>
        <span class="small">10520 / [ticketNumber] / [date].</span>
      </div>
      <div>
        <p class="content-info">CERTIFICATE OF ENROLLMENT</p>
        <p class="content">We certify that Mr./Ms. <span class="fw-bold">[fullname]</span>, [nationality] citizen is a fulltime student
          at the George Emil Palade University of Medicine, Pharmacy, Science,
          and Technology of Târgu Mureş (UMFST), Program of study MEDICINE, English (Hamburg, Germany) in the <span class="fw-bold">[studyofyear] of study</span>,
          academic year 2024/2025. The period of studies is six years (12 semesters).
          This academic year (2 semesters) begins on the 23th of September 2024 and lasts until the 22nd
          of September 2025. The course of study is subject to a fee.
        </p>
        <p>This certificate was issued at the request of the above-mentioned person, to be useful to the authorities.</p>
        <p class="content text-center">Rector</p>
        <p class="text-center">Prof. Leonard AZAMFIREI, MD, PhD</p>
        <p class="text-center mt-40">Signature…………………………….</p>
      </div>
    </body>
  </html>
  `;

  const replacements = {
    fullname: selectedTicket?.firstName + " " + selectedTicket?.lastName,
    nationality: formData["nationality"],
    studyofyear: formData["currentYearOfStudy"],
    ticketNumber: selectedTicket?.inquiryNumber,
    date: moment(new Date()).format("DD.MM.YYYY"),
  };

  const content = generateHtmlContent(htmlTemplate, replacements);
  const fileName = Date.now() + ".pdf";

  return await createPdf(content, fileName);
}

async function convertHtmlToTransferTarguPdf(formData, selectedTicket) {
  const bgImagePath = path.join(__dirname, "../public/docTemplate/bg.webp");
  const bgImageBase64 = getBase64Image(bgImagePath);

  const htmlTemplate = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-image: url("data:image/png;base64,${bgImageBase64}");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          color: black;
          padding-left: 90px;
          padding-right: 90px;
          padding-top: 40px;
          letter-spacing: 1px;
        }
        .number { font-size: 12px; font-weight: bold; margin-top: 50px; }
        .small { font-size: 12px; }
        p { font-size: 14px; line-height: 1; margin-top: 15px !important; margin-bottom: 0px !important; }
        .content-box { margin-top: 110px; max-width: 600px; }
        .content-info { margin-top: 100px; text-align: center; font-weight: bold; }
        .content { margin-top: 100px; }
        .text-center { text-align: center; }
        .mt-40 { margin-top: 40px; }
        .fw-bold { font-weight: bold; }
        .content-header { margin-top: 60px; }
        .filled-content { border-bottom: 1px solid black; margin-top: 30px; display: flex; justify-content: end; }
        .bottom-border { border-bottom: 1px solid black; }
        .d-flex { display: flex; }
        .me-2 { margin-right: 5px; }
        .mt-0 { margin-top: 0px !important; }
        .mt-25 { margin-top: 25px !important; }
        .mt-35 { margin-top: 35px !important; }
        .mt-55 { margin-top: 55px !important; }
        .content-body { margin-top: 60px; }
        .w-40 { width: 50%; }
        .w-60 { width: 60%; }
        .w-100 { width: 100%; }
        .bottom-string { display: flex; align-items: end; }
        .bottom-replace { vertical-align: bottom; }
      </style>
    </head>
    <body>
      <div class="content-box">
        <span class="number">Reg. no.:</span>
        <span class="small">10520 / [ticketNumber] / [date].</span>
      </div>
      <div class="content-header">
        <p>UMFST-UMCH Administration’s decision</p>
        <p>APPROVED REJECTED</p>
        <div class="filled-content small">
          <span>(to be filled in by the university)</span>
        </div>
      </div>
      <div class="content-body">
        <div class="d-flex">
          <p class="fw-bold me-2">Type of request:</p>
          <p class="me-2">Request for Transfer to</p>
          <p class="bottom-border">Targu Mures</p>
        </div>
        <div class="d-flex">
          <p class="fw-bold me-2">Program of study:</p>
          <p class="fw-bold">Medicine, English (Hamburg, Germany)</p>
        </div>
        <table class="w-100">
          <tr>
            <td class="w-100 bottom-string">
              <p>First Name / Last Name:</p>
            </td>
            <td class="w-60 bottom-border bottom-replace">[FullName]</td>
          </tr>
          <tr>
            <td class="w-100 bottom-string">
              <p>Date of Birth:</p>
            </td>
            <td class="w-60 bottom-border bottom-replace">[Date of Birth]</td>
          </tr>
          <tr>
            <td class="w-100 bottom-string">
              <p>Year of Study / Academic Year:</p>
            </td>
            <td class="w-60 bottom-border bottom-replace">
              [Year of Study / Academic Year]
            </td>
          </tr>
        </table>
        <p class="bottom-border w-100 mt-35"></p>
        <p class="bottom-border w-100 mt-35"></p>
        <div class="d-flex mt-55 w-100">
          <p class="w-40">Addressed to:</p>
          <p class="bottom-border w-100"></p>
        </div>
        <div class="d-flex mt-55 w-100">
          <p class="w-40">Date:</p>
          <p class="w-100">Students' Signature:</p>
        </div>
      </div>
    </body>
  </html>
  `;

  const replacements = {
    FullName: selectedTicket?.firstName + " " + selectedTicket?.lastName,
    ticketNumber: selectedTicket?.inquiryNumber,
    date: moment(new Date()).format("DD.MM.YYYY"),
    "Date of Birth": moment(selectedTicket?.details?.birthday).format("DD-MM-YYYY"),
    "Year of Study / Academic Year": selectedTicket?.details?.currentYearOfStudy,
  };

  const content = generateHtmlContent(htmlTemplate, replacements);
  const fileName = Date.now() + ".pdf";

  return await createPdf(content, fileName);
}

module.exports = { convertHtmlToPdf, convertHtmlToTransferTarguPdf };
