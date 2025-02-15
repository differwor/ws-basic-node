import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import http from "http";

const app = express();
const server = http.createServer(app);

// create a web socket
const wss = new WebSocketServer({ server });

// config allow CORS
app.use(
  cors({
    origin: process.env.ALLOWED_CORS_URL || "http://localhost:3000", // Allow frontend origin
    credentials: true,
  })
);

// to store list connected clients
let clients = new Set(); 

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("[WS] client connected, count: ", clients.size);

  ws.on("close", () => {
    console.log("[WS] lient disconnected");
    clients.delete(ws);
  });
});

app.use(express.json());

// API emit any messages with type
app.post("/ws", (req, res) => {
  const { type, message } = req.body;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, message }));
    }
  });
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[WS] WebSocket API Server running in ${PORT}`);
});
