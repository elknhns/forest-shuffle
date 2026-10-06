import { describe, expect, it } from "vitest";

import { startGame } from "../game/async-game";
import { createRoom, joinRoom } from "../game/room";
import { InMemoryGameStore } from "./game-store";

function newGame() {
  const room = joinRoom(
    createRoom({
      id: "room-1",
      host: { id: "user-1", kind: "registered", displayName: "Moss" },
      settings: { maxPlayers: 2, expansions: [], visibility: "private" }
    }),
    { id: "guest-1", kind: "guest", displayName: "Fern" }
  );

  return startGame(room, "user-1", ["card-1"]);
}

describe("game store", () => {
  it("loads the game snapshot saved for a room", async () => {
    const store = new InMemoryGameStore();
    const game = newGame();

    await store.save(game);

    await expect(store.load("room-1")).resolves.toEqual(game);
  });

  it("does not expose its saved state to mutations by the caller", async () => {
    const store = new InMemoryGameStore();
    const game = newGame();

    await store.save(game);
    const loadedGame = await store.load("room-1");
    loadedGame?.events.push({ version: 99, type: "turn-ended", actorId: "user-1", turn: 99 });

    await expect(store.load("room-1")).resolves.toEqual(game);
  });
});
