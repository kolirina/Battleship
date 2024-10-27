import WebSocket, { WebSocketServer } from "ws";
import { handleConnection } from "../utils.ts";

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection", (ws: WebSocket) => {
  console.log("New connection established");
  handleConnection(ws);
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
