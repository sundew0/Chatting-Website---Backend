const express = require("express");
const cors = require("cors");
const http = require("http");


const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { router: channelRoutes, setWebSocketServer } = require("./routes/channel");
const userRoutes = require("./routes/user");
const setupWebSocket = require("./websocket/wsServer");

const app = express();
const PORT = 4000;


app.use(cors({
  origin: "*"
}));
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/messages", messageRoutes);
app.use("/channel", channelRoutes);
app.use("/user", userRoutes);

const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
const wss = setupWebSocket(server);

// Set the WebSocket server reference for channel routes
setWebSocketServer(wss);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

