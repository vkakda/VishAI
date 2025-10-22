const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Chat = require("../models/chat.model");
const { generateAIReply } = require("../services/aiService");

const router = express.Router();

// Send new message & get AI reply
router.post("/", authMiddleware, async (req, res) => {
  const { text } = req.body;

  try {
    // Find or create chat for this user
    let chat = await Chat.findOne({ userId: req.user.id });
    if (!chat) chat = new Chat({ userId: req.user.id, messages: [] });

    // Save user message
    chat.messages.push({ sender: "user", text });

    // Get AI reply
    const aiReply = await generateAIReply(text);

    // Save AI message
    chat.messages.push({ sender: "ai", text: aiReply });

    await chat.save();

    res.status(200).json({ userMessage: text, aiMessage: aiReply });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error while sending message" });
  }
});

// Fetch chat history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.id });
    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error while fetching chat history" });
  }
});

module.exports = router;
