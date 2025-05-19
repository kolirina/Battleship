import { inMemoryDB } from "./inMemoryDB.ts";
import { activeSockets } from "../utils.ts";
import WebSocket from "ws";

export interface Player {
  id: string;
  name: string;
  password: string;
  wins: number;
  ships: Ship[];
}

export interface Ship {
  type: string;
  size: number;
  coordinates: Coordinate[];
}

export interface Coordinate {
  x: number;
  y: number;
}

const players: Map<string, Player> = new Map();

interface RegistrationResponse {
  type: string;
  data: {
    name: string;
    index: string;
    error: boolean;
    errorText: string;
  };
  id: number;
}

export function createPlayer(
  name: string,
  password: string,
  socket: WebSocket
): RegistrationResponse {
  console.log("Before adding:", Array.from(inMemoryDB.playerDb.values()));
  const existingPlayer = Array.from(inMemoryDB.playerDb.values()).find(
    (p) => p.name === name
  );

  if (existingPlayer) {
    return {
      type: "reg",
      data: {
        name,
        index: "",
        error: true,
        errorText: "Player already exists",
      },
      id: 0,
    };
  }

  const id = generateUniqueId();
  const player: Player = { id, name, password, wins: 0, ships: [] };
  inMemoryDB.playerDb.set(id, player);
  inMemoryDB.setCurrentPlayer(player);
  activeSockets.set(id, socket);
  console.log(`Logged in as: ${player.id}`);
  console.log("After adding:", Array.from(inMemoryDB.playerDb.values()));

  return {
    type: "reg",
    data: {
      name,
      index: id,
      error: false,
      errorText: "",
    },
    id: 0,
  };
}

export function getPlayer(id: string): Player | undefined {
  return players.get(id);
}

export function validatePlayer(
  name: string,
  password: string,
  socket: WebSocket
): Player | null {
  for (const player of players.values()) {
    if (player.name === name && player.password === password) {
      activeSockets.set(player.id, socket);
      return player;
    }
  }
  return null;
}

export function updatePlayerWins(id: string): void {
  const player = players.get(id);
  if (player) player.wins += 1;
}

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function currentUser(socket: WebSocket): Player | undefined {
  const userId = [...activeSockets.entries()].find(
    ([_, s]) => s === socket
  )?.[0];
  if (userId !== undefined) {
    console.log(
      "Array.from(inMemoryDB.playerDb.values()).fin",
      Array.from(inMemoryDB.playerDb.values())
    );
    return Array.from(inMemoryDB.playerDb.values()).find(
      (p) => p.id === userId
    );
  }
  return undefined;
}
