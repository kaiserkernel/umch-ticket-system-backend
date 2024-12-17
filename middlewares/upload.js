const multer = require('multer');
const path = require('path');
const { translate } = require("@vitalets/google-translate-api");
const tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const langdetect = require("langdetect");

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/images/avatar');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/documents');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Function to extract text from different types of documents
const extractTextFromFile = async (filePath, extname) => {
    let extractedText = '';

    // Extract text from PDF
    if (extname === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
    }
    // Extract text from Word document (docx)
    else if (extname === '.docx' || extname === ".doc") {
        const dataBuffer = fs.readFileSync(filePath);
        const docxData = await mammoth.extractRawText({ buffer: dataBuffer });
        extractedText = docxData.value;
    } else if (extname === ".txt") {
        extractedText = fs.readFileSync(filePath, "utf8");
    } else if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(extname)) {
        // Extract text from image using OCR
        const ocrResult = await tesseract.recognize(filePath, "eng");
        extractedText = ocrResult.data.text;
    }

    return extractedText;
}

// Function to detect language and translate if necessary
const detectAndTranslate = async (text, targetLang = 'en') => {
    try {
        const detectedLanguage = langdetect.detectOne(text); // Returns the top language code
        // return 
        const result = await translate(text, { to: targetLang });

        return {
            text: result.text,
            from: detectedLanguage || "unknown"
        };
    } catch (error) {
        console.error("Error in translation:", error);
        return { error: "Translation failed." };
    }
}

const uploadAvatar = multer({ storage: avatarStorage });
const uploadDocuments = multer({ storage: documentStorage });

module.exports = {
    uploadAvatar,
    uploadDocuments,
    detectAndTranslate,
    extractTextFromFile
};
