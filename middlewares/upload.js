const multer = require("multer");
const path = require("path");
const { translate } = require("@vitalets/google-translate-api");
const tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const langdetect = require("langdetect");
const axios = require("axios");

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/images/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/documents");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Function to extract text from different types of documents
const extractTextFromFile = async (filePath, extname) => {
  let extractedText = "";

  // Extract text from PDF
  if (extname === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text;
  }
  // Extract text from Word document (docx)
  else if (extname === ".docx" || extname === ".doc") {
    const dataBuffer = fs.readFileSync(filePath);
    const docxData = await mammoth.extractRawText({ buffer: dataBuffer });
    extractedText = docxData.value;
  } else if (extname === ".txt") {
    extractedText = fs.readFileSync(filePath, "utf8");
  } else if (
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(extname)
  ) {
    // Extract text from image using OCR
    const ocrResult = await tesseract.recognize(filePath, "eng");
    extractedText = ocrResult.data.text;
  }

  return extractedText;
};

// Function to detect language and translate if necessary
const detectAndTranslate = async (text, targetLang = "en") => {
  try {
    const apiKey = "b2eb4135-83b4-4811-8990-9d55f9f6db08:fx";
    const detectedLanguage = langdetect.detectOne(text); // Returns the top language code
    // return
    // const result = await translate(text, { to: targetLang });
    // DeepL API call
    const apiUrl = "https://api-free.deepl.com/v2/translate";
    const params = new URLSearchParams({
      auth_key: apiKey, // Replace with your DeepL API Key
      text: text.substring(0, 100), // Trim text for faster detection
      target_lang: "EN" // Target language for translation
    });

    const response = await axios.post(apiUrl, params);

    if (response.data.translations[0].detected_source_language !== "EN") {
      const translateParams = new URLSearchParams({
        auth_key: apiKey,
        text: text,
        target_lang: "EN" // Target language for translation
      });

      const translateResponse = await axios.post(apiUrl, translateParams);
      const translatedText = translateResponse.data.translations[0].text;

      return {
        text: translatedText,
        from: detectedLanguage || "unknown"
      };
    } else {
      console.log("Text is already in English.");
      return {
        text: text,
        from: detectedLanguage || "unknown"
      };
    }
  } catch (error) {
    console.error("Error in translation:", error);
    return { error: "Translation failed." };
  }
};

const uploadAvatar = multer({ storage: avatarStorage });
const uploadDocuments = multer({ storage: documentStorage });

module.exports = {
  uploadAvatar,
  uploadDocuments,
  detectAndTranslate,
  extractTextFromFile
};
