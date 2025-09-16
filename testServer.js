const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;

const MESSAGES_FILE = path.join(__dirname, "messages.json");

app.use(cors({
    origin: "*"
}));


// Ensure the messages file exists
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}



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

    ws.onmessage = (message) => {
        // Save the message to the messages file
        fs.readFile(MESSAGES_FILE, (err, data) => {
            if (err) throw err;
            const messages = JSON.parse(data);
   //         let messages = JSON.parse(data).map(message =>
    //            typeof message === "string" ? JSON.parse(message) : message
     //       );
            
            messages.push(JSON.parse(message.data));
        
        fs.writeFile( 
            MESSAGES_FILE,
            JSON.stringify(
                messages, // Parse each stringified object
                null,
                2 // Indentation for readability
            ), (err) => {
            if (err) {
            console.error("Error writing to messages file:", err);
            }});
    });



    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.data);
        }
    });
    }
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
