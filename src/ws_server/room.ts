import { Player } from "./player.ts";
import wss from "./index.ts";
import WebSocket from "ws";

interface Message {
  type: string;
  data: any;
  id: number;
}

export interface Room {
  id: string;
  players: Player[];
  isGameActive: boolean;
}

// export interface Room {
//     id: string;
//     players: { player: Player; socket: WebSocket }[];
//   }

const rooms: Map<string, Room> = new Map();
const players: Map<string, Player> = new Map();

export function createRoom(player: Player): Room {
  const roomId = generateUniqueId();
  const room = { id: roomId, players: [player], isGameActive: false };
  rooms.set(roomId, room);

  return room;
}

export function joinRoom(roomId: string, player: Player): boolean {
  const room = rooms.get(roomId);
  if (room && room.players.length < 2) {
    room.players.push(player);
    if (room.players.length === 2) room.isGameActive = true;
    return true;
  }
  return false;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function getActiveRooms(): Room[] {
  return Array.from(rooms.values()).filter((room) => !room.isGameActive);
}

function broadcastMessage(message: Message) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export function updateRoomState(): void {
  const activeRooms = getActiveRooms().map((room) => ({
    roomId: room.id,
    roomUsers: room.players.map((player, index) => ({
      name: player.name,
      index: index,
    })),
  }));

  const message: Message = {
    type: "update_room",
    data: JSON.stringify(activeRooms),
    id: 0,
  };

  broadcastMessage(message);
}

export function updateWinners(): void {
  const winners = Array.from(players.values())
    .filter((player) => player.wins > 0)
    .sort((a, b) => b.wins - a.wins)
    .map((player) => ({
      name: player.name,
      wins: player.wins,
    }));

  const message: Message = {
    type: "update_winners",
    data: winners,
    id: 0,
  };

  broadcastMessage(message);
}

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10);
}
