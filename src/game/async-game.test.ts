import { describe, expect, it } from "vitest";

import { endTurn, startGame } from "./async-game";
import { createRoom, joinRoom } from "./room";

function waitingRoom() {
  const room = createRoom({
    id: "room-1",
    host: { id: "user-1", kind: "registered", displayName: "Moss" },
    settings: { maxPlayers: 2, expansions: ["alpine"], visibility: "private" }
  });

  return joinRoom(room, { id: "guest-1", kind: "guest", displayName: "Fern" });
}

describe("async game state", () => {
  it("starts a two-player room when its host starts it", () => {
    const game = startGame(waitingRoom(), "user-1", ["card-1", "card-2", "card-3"]);

    expect(game).toMatchObject({
      roomId: "room-1",
      status: "active",
      version: 0,
      turn: 1,
      currentPlayerId: "user-1",
      enabledExpansions: ["alpine"],
      deck: ["card-1", "card-2", "card-3"],
      events: []
    });
  });

  it("only lets the host start a game", () => {
    expect(() => startGame(waitingRoom(), "guest-1", [])).toThrow(
      "Only the host can start this game"
    );
  });

  it("records a versioned end-turn action and passes the turn to the next player", () => {
    const game = startGame(waitingRoom(), "user-1", ["card-1"]);

    const nextGame = endTurn(game, { actorId: "user-1", expectedVersion: 0 });

    expect(nextGame).toMatchObject({
      version: 1,
      turn: 2,
      currentPlayerId: "guest-1",
      events: [
        { version: 1, type: "turn-ended", actorId: "user-1", turn: 1 }
      ]
    });
  });

  it("rejects stale actions and actions from the wrong player", () => {
    const game = startGame(waitingRoom(), "user-1", []);

    expect(() => endTurn(game, { actorId: "user-1", expectedVersion: 4 })).toThrow(
      "This game changed; refresh and try again"
    );
    expect(() => endTurn(game, { actorId: "guest-1", expectedVersion: 0 })).toThrow(
      "It is not your turn"
    );
  });
});
