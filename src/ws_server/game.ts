interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

interface GameBoard {
  ships: Ship[];
  hits: Set<string>;
}

const games: Map<string, { boards: Map<string, GameBoard> }> = new Map();

export function initializeGame(gameId: string, players: string[]): void {
  const boards = new Map<string, GameBoard>();
  players.forEach((player) =>
    boards.set(player, { ships: [], hits: new Set() })
  );
  games.set(gameId, { boards });
}

export function addShips(
  gameId: string,
  playerId: string,
  ships: Ship[]
): boolean {
  const game = games.get(gameId);
  if (game) {
    const board = game.boards.get(playerId);
    if (board) {
      board.ships = ships;
      return true;
    }
  }
  return false;
}

export function attack(
  gameId: string,
  playerId: string,
  x: number,
  y: number
): "miss" | "hit" | "killed" {
  const game = games.get(gameId);
  if (game) {
    const enemyBoard = Array.from(game.boards.values()).find(
      (board) => board !== game.boards.get(playerId)
    );
    if (enemyBoard) {
      const hitKey = `${x},${y}`;
      if (enemyBoard.hits.has(hitKey)) return "miss";
      enemyBoard.hits.add(hitKey);
      const shipHit = enemyBoard.ships.some((ship) => isHit(ship, x, y));
      return shipHit ? "hit" : "miss";
    }
  }
  return "miss";
}

function isHit(ship: Ship, x: number, y: number): boolean {
  return false;
}
