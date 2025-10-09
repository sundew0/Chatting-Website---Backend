const express = require("express");
const router = express.Router();
const dbService = require("../utils/dbService");
const { authenticateToken } = require("../middleware/auth");

// Get user by ID
router.get("/", authenticateToken, async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    const result = await dbService.getUser(id);
    
    if (result && result.success === false) {
      return res.status(404).json({ error: result.error || "User not found" });
    }
    
    res.json(result);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get user's channels/servers
router.get("/channels", authenticateToken, async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  try {
    // This would need to be implemented in dbService
    const result = await dbService.getUserChannels(userId);
    
    if (result && result.success === false) {
      return res.status(404).json({ error: result.error || "No channels found" });
    }
    
    res.json(result || []);
  } catch (err) {
    console.error("Error fetching user channels:", err);
    res.status(500).json({ error: "Failed to fetch user channels" });
  }
});

module.exports = router;
