import { Player } from "./player";

export interface Room {
  id: string;
  players: Player[];
  isGameActive: boolean;
}

const rooms: Map<string, Room> = new Map();

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

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10);
}
