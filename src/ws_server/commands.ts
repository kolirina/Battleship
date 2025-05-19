import WebSocket from "ws";
import { createPlayer, currentUser, validatePlayer } from "./player.ts";
import {
  createRoom,
  joinRoom,
  updateRoomState,
  updateWinners,
  createGame,
} from "./room.ts";
import { attack, initializeGame } from "./game.ts";
import { inMemoryDB } from "./inMemoryDB.ts";
import { json } from "stream/consumers";

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
  const playerResponse = createPlayer(name, password, ws);

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
    const player = validatePlayer(name, password, ws);
    if (player) {
      inMemoryDB.setCurrentPlayer(player);
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
    const currentPlayer = currentUser(ws);

    if (currentPlayer) {
      const currentPlayerId = currentPlayer.id;
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

    const room = inMemoryDB.roomDb.get(indexRoom);
    // const currentPlayer = inMemoryDB.getCurrentPlayer();
    const currentPlayer = currentUser(ws);

    if (currentPlayer) {
      const currentPlayerId = currentPlayer.id;
      console.log(`Current player ID: ${currentPlayerId}`, indexRoom);
    } else {
      console.log("No current player.");
    }
    if (room && currentPlayer) {
      joinRoom(room.id, currentPlayer);
      updateRoomState();

      if (room && room.players.length === 2) {
        createGame();
      }
    } else {
      ws.send(
        JSON.stringify({ status: "error", message: "Room or player not found" })
      );
    }
  }
}

export function handleGameCommand(ws: WebSocket, command: Command) {
  const { type, data, id } = command;

  if (type === "create_game") {
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

  // if (type === "start_game") {
  //   const { roomId } = data;
  //   const room = inMemoryDB.roomDb.get(roomId);
  //   if (room && room.players.length === 2) {
  //     initializeGame(
  //       roomId,
  //       room.players.map((player) => player.id)
  //     );
  //     console.log(
  //       "from back to front in handlegamecommand start_game",
  //       JSON.stringify({ status: "success", message: "Game started" })
  //     );
  //     ws.send(JSON.stringify({ status: "success", message: "Game started" }));
  //   } else {
  //     ws.send(
  //       JSON.stringify({
  //         status: "error",
  //         message: "Room not found or not enough players",
  //       })
  //     );
  //   }
  // }

  if (type === "add_ships") {
    const currentPlayer = currentUser(ws);
    currentPlayer!.ships = JSON.parse(command.data)["ships"];
    console.log(currentPlayer!.ships);
    console.log(
      "Array.from(inMemoryDB.playerDb.values())",
      Array.from(inMemoryDB.playerDb.values())
    );
    const players = Array.from(inMemoryDB.playerDb.values());
    players.forEach((player) => {
      if (player["ships"].length === 0) {
        return;
      } else {
        ws.send(
          JSON.stringify({
            type: "start_game",
            data: {
              gameId: "504dtj2z",
              ships: [
                {
                  position: { x: 4, y: 1 },
                  direction: true,
                  type: "huge",
                  length: 4,
                },
                {
                  position: { x: 5, y: 9 },
                  direction: false,
                  type: "large",
                  length: 3,
                },
                {
                  position: { x: 0, y: 2 },
                  direction: false,
                  type: "large",
                  length: 3,
                },
                {
                  position: { x: 6, y: 3 },
                  direction: true,
                  type: "medium",
                  length: 2,
                },
                {
                  position: { x: 6, y: 1 },
                  direction: false,
                  type: "medium",
                  length: 2,
                },
                {
                  position: { x: 7, y: 6 },
                  direction: true,
                  type: "medium",
                  length: 2,
                },
                {
                  position: { x: 2, y: 0 },
                  direction: true,
                  type: "small",
                  length: 1,
                },
                {
                  position: { x: 3, y: 8 },
                  direction: true,
                  type: "small",
                  length: 1,
                },
                {
                  position: { x: 5, y: 6 },
                  direction: true,
                  type: "small",
                  length: 1,
                },
                {
                  position: { x: 8, y: 3 },
                  direction: true,
                  type: "small",
                  length: 1,
                },
              ],
              indexPlayer: "oz2rc3yc",
            },
            id,
          })
        );
      }
    });
  }

  if (type === "attack") {
    const { gameId, playerId, x, y } = data;
    const result = attack(gameId, playerId, x, y);
    ws.send(JSON.stringify({ status: "success", result }));
  }
}
