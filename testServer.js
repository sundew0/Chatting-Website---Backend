const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 4000;

const MESSAGES_FILE = path.join(__dirname, "messages.json");
const USERS_FILE = path.join(__dirname, "users.json");

app.use(cors({
  origin: "*"
}));
app.use(express.json())


// Ensure the messages file exists
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}
// Ensure the Users file exists

if (!fs.existsSync(USERS_FILE)) {
  
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}



app.get("/messages", (req, res) => {
  fs.readFile(MESSAGES_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading messages file:", err);
      return res.status(200).json({ error: "Failed to read messages" });
    }
    res.json(JSON.parse(data));
  });
});
app.get("/ping", (req, res) => {
  return res.status(200).json( {"hi": "hi"});
});







app.post("/create_user", 
  [
    body("username").isAlphanumeric().isLength({ min: 3, max: 20 }),
    body("password").isLength({ min: 8 })
  ],
  async (req, res) => {
    console.log("BODY RECEIVED:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() , test: 1}); 
    }
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    
   let users = []
    //try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

    if ( users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    )) {
      return res.status(409).json( {error: "username already exists", test: usernameExists(username)})
    }
    users.push({ username, password: hashedPassword });
    
    await fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)), (err) => {
      if (err) {
        console.error("Error writing to messages file:", err);
      }
    };
        
    return res.status(201).send();


})
app.post("/login_user", 
  [
    body("username").isAlphanumeric().isLength({ min: 3, max: 20 }),
    body("password").isLength({ min: 8 })
  ],
  async (req, res) => {
    console.log("BODY RECEIVED:", req.body);
    const { username, password } = req.body;

    let users = []
  
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    const user =  users.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (user) {

      const match = await bcrypt.compare(password, user.password)
      const whitelisted = ["sundew", "sewil", "areila"]
      if (match) {

        if (whitelisted.includes(username.toLowerCase()))
        return res.status(200).json( { passed: true})
      }
    }
      
      return res.status(401).json({ error: "Invalid username or password" });

      

})


// WebSocket server
const wss = new WebSocket.Server({ noServer: true });


wss.on("connection", (ws) => {

const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "keep-alive", body: "ping" }));
      }
    });
}, 30000);
  ws.on("message", (message) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (e) {
      console.error("Invalid JSON message:", message);
      return;
    }


    if (parsedMessage.type == "message")
    {

      // Save message safely
      fs.readFile(MESSAGES_FILE, (err, data) => {
        let messages = [];
        if (!err) {
          try {
            messages = JSON.parse(data);
          } catch (e) {
            console.error("Error parsing messages file:", e);
          }
        }
        
        messages.push(parsedMessage);
        
        fs.writeFile(
          MESSAGES_FILE,
          JSON.stringify(messages, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing to messages file:", err);
            }
          }
        );
      })
      
      // Broadcast to all clients (except sender)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage)); // message is already a string
        }
      });
    }
  });
  ws.onclose = () => {
    clearInterval(interval);
  };
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
