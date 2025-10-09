const express = require("express");
const router = express.Router();
const dbService = require("../utils/dbService");
const { authenticateToken } = require("../middleware/auth");

// GET all messages for a channel
router.get("/", async (req, res) => {
  const channelId = req.query.channelId;
  if (!channelId) return res.status(400).json({ error: "Missing channelId" });
  try {
    const result = await dbService.getMessages({ id: channelId });
    if (result && result.success === false) {
      return res.status(404).json({ error: result.error || "No messages found" });
    }
    res.json(result.result || []);
  } catch (err) {
    console.error("Error reading messages:", err);
    res.status(500).json({ error: "Failed to read messages" });
  }
});

// Optional: POST a message via HTTP (if you want to support it besides WebSocket)
router.post("/", authenticateToken, async (req, res) => {
  
  const { userID, channelId, content } = req.body;
  if (!userID || !channelId || !content) return res.status(400).json({ error: "Missing user, channelId, or content" });
  
  try {
    const result = await dbService.SendMessage(userID, channelId, content);
    if (result && result.success === false) {
      return res.status(500).json({ error: result.error || "Failed to save message" });
    }
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error writing message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;
