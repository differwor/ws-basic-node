import express from "express";
import { WebSocketServer, WebSocket } from "ws";
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

app.use(express.json());

// emit any data
app.post("/", (req, res) => {
  const { type, message } = req.body;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, message }));
    }
  });
  res.json({ success: true });
});

// to store list connected clients
let clients = new Set(); 

// connect web socket
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Total clients: ${clients.size}`);

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Total clients: ${clients.size}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[WS] WebSocket API Server running in ${PORT}`);
});
