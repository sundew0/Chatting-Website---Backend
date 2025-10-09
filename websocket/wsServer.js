const WebSocket = require("ws");
const url = require("url");
const { logError } = require("../utils/errorHandlers");

// Replace this with your real saveMessage / MESSAGE_TYPES if needed
const MESSAGE_TYPES = { MESSAGE: "message", KEEP_ALIVE: "keep-alive" };



module.exports = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  const rooms = {}; // roomKey -> Set<ws>

  server.on("upgrade", (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;

    if (!pathname.startsWith("/ws/")) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.path = pathname;
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    try {
      console.log("✅ New WebSocket connection:", ws.path);

      // Parse room
      const [, , type, id] = ws.path.split("/");
      const roomKey = `${type}:${id}`;
      if (!rooms[roomKey]) rooms[roomKey] = new Set();
      rooms[roomKey].add(ws);
      ws.roomKey = roomKey;

      // Keep-alive ping every 30s
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: MESSAGE_TYPES.KEEP_ALIVE, body: "ping" }));
        }
      }, 30000);

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data);
          console.log("Received message:", message);

          switch (message.type) {
            case MESSAGE_TYPES.MESSAGE:
            
              rooms[roomKey].forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(message));
                }
              });
              break;

            case MESSAGE_TYPES.KEEP_ALIVE:
              ws.send(JSON.stringify({ type: MESSAGE_TYPES.KEEP_ALIVE, body: "pong" }));
              break;

            default:
              ws.send(JSON.stringify({ type: "error", error: "Unknown message type." }));
          }

        } catch (err) {
          logError({ message: err.message, stack: err.stack, severity: "server" });
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "error", error: "Invalid message format." }));
          }
        }
      });

      ws.on("close", () => {
        clearInterval(interval);
        rooms[roomKey].delete(ws);
        if (rooms[roomKey].size === 0) delete rooms[roomKey];
        console.log("❌ WebSocket closed:", ws.path);
      });

      ws.on("error", (err) => {
        logError({ message: err.message, stack: err.stack, severity: "server" });
      });

    } catch (err) {
      console.error("WebSocket setup error:", err);
      if (ws.readyState === WebSocket.OPEN) ws.close();
    }
  });

  return wss;
};
