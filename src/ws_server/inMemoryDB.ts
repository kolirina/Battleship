import { Player } from "./player.ts";
import { Room } from "./room.ts";

const playerDb: Map<string, Player> = new Map();
const roomDb: Map<string, Room> = new Map();

export const inMemoryDB = {
  playerDb,
  roomDb,
};
