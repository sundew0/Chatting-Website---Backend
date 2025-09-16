const WebSocket = require("ws");
const { readMessages, writeMessages } = require("../utils/fileHelpers");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    const interval = setInterval(() => {
      ws.send(JSON.stringify({ type: "keep-alive", body: "ping" }));
    }, 30000);

    ws.on("message", (message) => {
      let parsed;
      try { parsed = JSON.parse(message); } catch { return; }

      if (parsed.type === "message") {
        const messages = readMessages();
        messages.push(parsed);
        writeMessages(messages);

        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify(parsed));
        });
      }
    });

    ws.on("close", () => clearInterval(interval));
  });
};
