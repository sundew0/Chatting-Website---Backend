const express = require("express");
const router = express.Router();
const { readMessages } = require("../utils/fileHelpers");

// GET all messages
router.get("/", (req, res) => {
  try {
    const messages = readMessages();
    res.json(messages);
  } catch (err) {
    console.error("Error reading messages:", err);
    res.status(500).json({ error: "Failed to read messages" });
  }
});

// Optional: POST a message via HTTP (if you want to support it besides WebSocket)
router.post("/", (req, res) => {
  const { sender, content } = req.body;
  if (!sender || !content) return res.status(400).json({ error: "Missing sender or content" });

  try {
    const messages = readMessages();
    const newMessage = {
      id: messages.length + 1,
      sender,
      content,
      created_at: new Date().toISOString(),
    };
    messages.push(newMessage);
    require("../utils/fileHelpers").writeMessages(messages);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error writing message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;
