const express = require("express");
const cors = require("cors");
const http = require("http");


const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const setupWebSocket = require("./websocket/wsServer");

const app = express();
const PORT = 4000;


app.use(cors({
  origin: "*"
}));
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/messages", messageRoutes);

const server = http.createServer(app)

setupWebSocket(server)


// Create an HTTP server to attach the WebSocket server
server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

