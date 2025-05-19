import WebSocket from "ws";
import {
  handlePlayerCommand,
  handleRoomCommand,
  handleGameCommand,
} from "./ws_server/commands.ts";

export function handleConnection(ws: WebSocket): void {
  ws.on("message", (message: string) => {
    console.log(
      "полученное сообщение >>>>>>>>",
      JSON.parse(message),
      ">>>>>>>>>>"
    );
    try {
      const command = JSON.parse(message);
      switch (command.type) {
        case "reg":
          handlePlayerCommand(ws, command);
          break;
        case "create_room":
        case "add_user_to_room":
        case "create_game":
          handleRoomCommand(ws, command);
          break;
        case "start_game":
        case "add_ships":
        case "attack":
        case "randomAttack":
          handleGameCommand(ws, command);
          break;
        default:
          console.error(`Unknown command type: ${command.type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Connection closed");
  });
}

export const activeSockets: Map<number | string, WebSocket> = new Map();
