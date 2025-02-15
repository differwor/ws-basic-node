import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();

// Config allow CORS
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // Allow frontend origin
    credentials: true,
  })
);

// Create a web socket
const wss = new WebSocketServer({ port: process.env.WS_PORT|| 8080 });

let clients = new Set(); // List connected clients

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

app.listen(process.env.EMIT_API_PORT || 8081, () => {
  console.log("[WS] WebSocket API Server running");
});
