import WebSocket from "ws";
import { createPlayer, validatePlayer } from "./player.ts";
import {
  createRoom,
  joinRoom,
  updateRoomState,
  updateWinners,
} from "./room.ts";
import { attack, initializeGame } from "./game.ts";
import { inMemoryDB } from "./inMemoryDB.ts";

interface Command {
  type: string;
  data: any;
  id: number;
}

export function handlePlayerCommand(ws: WebSocket, command: Command) {
  const { type, data, id } = command;
  let parsedData;
  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Failed to parse data:", error);
    ws.send(
      JSON.stringify({
        type: "reg",
        data: {
          index: "",
          error: true,
          errorText: "Invalid data format",
        },
        id,
      })
    );
    return;
  }

  const { name, password } = parsedData;
  const playerResponse = createPlayer(name, password);

  if (playerResponse) {
    const formattedResponse = {
      type: playerResponse.type,
      data: JSON.stringify(playerResponse.data),
      id: playerResponse.id,
    };

    ws.send(JSON.stringify(formattedResponse));
  } else {
    ws.send(
      JSON.stringify({
        type: "reg",
        data: {
          index: "",
          error: true,
          errorText: "Player name already taken",
        },
        id,
      })
    );
  }

  if (type === "login") {
    const { name, password } = data;
    const player = validatePlayer(name, password);
    if (player) {
      ws.send(
        JSON.stringify({
          status: "success",
          message: "Login successful",
          player,
        })
      );
    } else {
      ws.send(
        JSON.stringify({ status: "error", message: "Invalid credentials" })
      );
    }
  }
  updateRoomState();
  console.log("in commands");
  updateWinners();
}

export function handleRoomCommand(ws: WebSocket, command: Command) {
  console.log("Received room command:", command);
  const { type, data, id } = command;
  console.log(data);

  if (type === "create_room") {
    const currentPlayer = inMemoryDB.getCurrentPlayer();

    if (currentPlayer) {
      const currentPlayerId = currentPlayer.id;
      console.log(`Current player ID: ${currentPlayerId}`);
    } else {
      console.log("No current player.");
    }
    if (currentPlayer) {
      const room = createRoom(currentPlayer);
      inMemoryDB.roomDb.set(room.id, room);
      updateRoomState();
    } else {
      ws.send(JSON.stringify({ status: "error", message: "Player not found" }));
    }
  }

  if (type === "add_user_to_room") {
    const parsedData = JSON.parse(data);
    const indexRoom = parsedData.indexRoom;

    console.log(indexRoom);
    console.log(1111, indexRoom);
    const room = inMemoryDB.roomDb.get(indexRoom);
    const currentPlayer = inMemoryDB.getCurrentPlayer();

    if (currentPlayer) {
      const currentPlayerId = currentPlayer.id;
      console.log(`Current player ID: ${currentPlayerId}`, indexRoom);
    } else {
      console.log("No current player.");
    }
    if (room && currentPlayer) {
      updateRoomState();
      //   const success = joinRoom(indexRoom, currentPlayer);

      //   ws.send(
      //     JSON.stringify({
      //       status: success ? "success" : "error",
      //       message: success
      //         ? "Player added to room"
      //         : "Room is full or not found",
      //     })
      //   );
    } else {
      ws.send(
        JSON.stringify({ status: "error", message: "Room or player not found" })
      );
    }
  }
}

export function handleGameCommand(ws: WebSocket, command: Command) {
  const { type, data, id } = command;

  if (type === "start_game") {
    const { roomId } = data;
    const room = inMemoryDB.roomDb.get(roomId);
    if (room && room.players.length === 2) {
      initializeGame(
        roomId,
        room.players.map((player) => player.id)
      );
      ws.send(JSON.stringify({ status: "success", message: "Game started" }));
    } else {
      ws.send(
        JSON.stringify({
          status: "error",
          message: "Room not found or not enough players",
        })
      );
    }
  }

  if (type === "attack") {
    const { gameId, playerId, x, y } = data;
    const result = attack(gameId, playerId, x, y);
    ws.send(JSON.stringify({ status: "success", result }));
  }
}
