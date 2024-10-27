import { inMemoryDB } from "./inMemoryDB.ts";

export interface Player {
  id: string;
  name: string;
  password: string;
  wins: number;
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
  password: string
): RegistrationResponse {
  console.log("Before adding:", Array.from(inMemoryDB.playerDb.values())); // перед добавлением игрока
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
  const player: Player = { id, name, password, wins: 0 };
  inMemoryDB.playerDb.set(id, player);
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

export function validatePlayer(name: string, password: string): Player | null {
  for (const player of players.values()) {
    if (player.name === name && player.password === password) return player;
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
