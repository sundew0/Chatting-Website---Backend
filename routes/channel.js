const express = require("express");
const router = express.Router();
const dbService = require("../utils/dbService");
const { authenticateToken } = require("../middleware/auth");

// Store WebSocket server reference for broadcasting
let wss = null;
const setWebSocketServer = (wsServer) => {
  wss = wsServer;
};

// Create a new DM or channel
router.post("/create", authenticateToken, async (req, res) => {
  const { user, type, targetID, channelName, channelDescription } = req.body;
  if (user == null || type == null) {
    return res.status(100).json({ error: "Missing required fields: user, type" });
  }
  try {
    // Get the full user data from the database using the authenticated user's ID

    const fullUser = await dbService.getUser(user.id);
    if (!fullUser) {
      return res.status(404).json({ error: "User not found" });
    }

    
    const result = await dbService.CreateDMOrChannel( 
      fullUser, 
      type, 
      targetID, 
      channelName, 
       channelDescription 
    );

    
    if (result && result.success === false) {
      return res.status(500).json({ error: result.error || "Failed to create channel" });
    }
    
    // Broadcast server list update to all connected clients
    if (wss) {
      const updateMessage = {
        type: "server_list_update",
        userId: req.user.userId,
        channel: result
      };
      
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(updateMessage));
        }
      });
    }
    
    res.status(201).json({ success: true, channel: result });
  } catch (err) {
    console.error("Error creating channel:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Add user to server/channel
router.post("/addUser", authenticateToken, async (req, res) => {
  const { user, channel } = req.body;
  
  if (!user || !channel) {
    return res.status(400).json({ error: "Missing required fields: user, channel" });
  }

  try {
    const result = await dbService.addUserToChannel(user.id, channel.id);
    
    if (result && result.success === false) {
      return res.status(500).json({ error: result.error || "Failed to add user to channel" });
    }
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error adding user to channel:", err);
    res.status(500).json({ error: "Failed to add user to channel" });
  }
});

module.exports = { router, setWebSocketServer };
