// backend/services/aiService.js
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Function to generate AI reply
async function generateAIReply(userMessage) {
  try {
    // Prepare the request for Gemini API
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          type: "text",
          text: userMessage
        }
      ]
    });

    // Extract the text from the API response
    const aiText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    console.log("Gemini Response:", aiText);

    return aiText;
  } catch (err) {
    console.error("Gemini AI Error:", err);
    return "Sorry, I could not generate a reply.";
  }
}

module.exports = { generateAIReply };
