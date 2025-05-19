import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8081 });
wss.on("connection", (ws) => {
    console.log("New WebSocket connection established.");
    ws.on("message", (message) => {
        console.log("Received:", message.toString());
        ws.send(`Server received: ${message}`);
    });
    ws.on("close", () => {
        console.log("WebSocket connection closed.");
    });
});
console.log("WebSocket server is running on ws://localhost:8081");
