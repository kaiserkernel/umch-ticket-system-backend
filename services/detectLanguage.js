const pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");

async function detectLanguage(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    // Extract text from PDF
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Check if the text exists and handle empty PDFs
    if (!text) {
      console.error("No text found in the PDF file.");
      return false;
    }

    // DeepL API call
    const apiUrl = "https://api-free.deepl.com/v2/translate";
    const params = new URLSearchParams({
      auth_key: "d5372492-633e-4470-9dc7-d4af8649624f:fx", // Replace with your DeepL API Key
      text: text.substring(0, 500), // Trim text for faster detection
      target_lang: "EN" // Target language for translation
    });

    const response = await axios.post(apiUrl, params);

    console.log(
      "Detected Language:",
      response.data.translations[0].detected_source_language
    );
    if (response.data.translations[0].detected_source_language == "EN") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error detecting language:", error);
    return false;
  }
}

module.exports = { detectLanguage };
