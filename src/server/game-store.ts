import type { AsyncGameState } from "../game/async-game";

export interface GameStore {
  load(roomId: string): Promise<AsyncGameState | null>;
  save(game: AsyncGameState): Promise<void>;
}

export class InMemoryGameStore implements GameStore {
  private readonly games = new Map<string, AsyncGameState>();

  async load(roomId: string): Promise<AsyncGameState | null> {
    const game = this.games.get(roomId);
    return game ? structuredClone(game) : null;
  }

  async save(game: AsyncGameState): Promise<void> {
    this.games.set(game.roomId, structuredClone(game));
  }
}
