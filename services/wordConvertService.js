const pdf = require("html-pdf");

async function convertHtmlToPdf(info, studentNo) {
  const detail = info.details;
  console.log(detail, "=========details");
  //   const convertedDetails = JSON.parse(detail);
  //   console.log(convertedDetails, "=====converted  detail");

  const outputPath = "public/uploads/documents/";
  const fileName = Date.now() + ".pdf";

  const htmlContent = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-image: url('http://127.0.0.1:5000/docTemplate/bg.png');
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
        .content { margin-top: 100px; }
        .text-center { text-align: center; }
        .mt-40 { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="content-box">
        <span class="number">Reg. no.:</span>
        <span class="small">10520 / [studentNo].</span>
      </div>
      <div>
        <p class="content-info">CERTIFICATE OF ENROLLMENT</p>
        <p class="content">We certify that Mr./Ms. [fullname], [nationality] citizen is a fulltime student
          at the George Emil Palade University of Medicine, Pharmacy, Science,
          and Technology of Târgu Mureş (UMFST), Program of study MEDICINE, English (Hamburg, Germany) in the [studyofyear] of study,
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

  let content = "";
  try {
    content = htmlContent
      .replace("[fullname]", info?.firstName + " " + info?.lastName)
      .replace("[nationality]", detail["nationality"])
      .replace("[studyofyear]", detail["currentYearOfStudy"])
      .replace("[studentNo]", studentNo);
  } catch (err) {
    console.log(err);
  }

  return new Promise((resolve, reject) => {
    pdf
      .create(content, { format: "A4" })
      .toFile(outputPath + fileName, (err, res) => {
        if (err) {
          console.error("Error creating PDF:", err);
          reject(err);
        } else {
          console.log(`PDF created at ${outputPath + fileName}`);
          resolve("/uploads/documents/" + fileName);
        }
      });
  });
}

module.exports = { convertHtmlToPdf };
