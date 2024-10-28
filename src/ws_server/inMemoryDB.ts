import { Player } from "./player.ts";
import { Room } from "./room.ts";

const playerDb: Map<string, Player> = new Map();
const roomDb: Map<string, Room> = new Map();

let currentPlayer: Player | null = null;

export const inMemoryDB = {
  playerDb,
  roomDb,
  createPlayer: (player: Player) => playerDb.set(player.id, player),
  getPlayer: (id: string) => playerDb.get(id),
  validatePlayer: (name: string, password: string): Player | null => {
    for (const player of playerDb.values()) {
      if (player.name === name && player.password === password) {
        return player;
      }
    }
    return null;
  },
  setCurrentPlayer: (player: Player) => {
    currentPlayer = player;
  },
  getCurrentPlayer: () => currentPlayer,

  sendMessageToRoom: (roomId: string, message: any) => {
    const room = roomDb.get(roomId);
    if (!room) {
      console.error(`Комната с id ${roomId} не найдена`);
      return;
    }

    // room.players.forEach(({ socket }) => {
    //   if (socket.readyState === WebSocket.OPEN) {
    //     socket.send(JSON.stringify(message));
    //   }
    // });
  },
};
