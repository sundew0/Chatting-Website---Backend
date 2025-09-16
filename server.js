const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Path to the file where messages will be stored
const MESSAGES_FILE = path.join(__dirname, "messages.json");

// Ensure the messages file exists
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

// Enable CORS for frontend
app.use(cors({
  origin: "https://chat.sundewdev.xyz",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]   

}));

// Serve a simple route for testing
app.get("/", (req, res) => {
  res.send("Chat backend is running!");
});

// Fetch messages for new connections
app.get("/messages", (req, res) => {
  fs.readFile(MESSAGES_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading messages file:", err);
      return res.status(500).json({ error: "Failed to read messages" });
    }
    res.json(JSON.parse(data));
  });
});

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Listen for messages from the client
  ws.on("message", (message) => {
    console.log("Received message:", message);

    const msgData = JSON.parse(message);

    // Add UTC timestamp to the message
    const messageWithTimestamp = {
      ...msgData,
      timestamp: new Date().toISOString(), // UTC timestamp
    };

    // Save the message to the file
    fs.readFile(MESSAGES_FILE, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading messages file:", err);
        return;
      }

      const messages = JSON.parse(data);
      messages.push(messageWithTimestamp);

      fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), (err) => {
        if (err) {
          console.error("Error writing to messages file:", err);
        }
      });
    });

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageWithTimestamp));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Create an HTTP server to attach the WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
