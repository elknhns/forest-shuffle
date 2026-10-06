import { describe, expect, it } from "vitest";

import { createRoom, joinRoom } from "./room";

const host = {
  id: "user-1",
  kind: "registered" as const,
  displayName: "Moss"
};

describe("game rooms", () => {
  it("lets a registered host create a waiting room with the selected expansions", () => {
    const room = createRoom({
      id: "room-1",
      host,
      settings: {
        maxPlayers: 4,
        expansions: ["alpine", "woodland-edge", "exploration"],
        visibility: "public"
      }
    });

    expect(room).toMatchObject({
      id: "room-1",
      hostId: "user-1",
      status: "waiting",
      settings: {
        maxPlayers: 4,
        expansions: ["alpine", "woodland-edge", "exploration"],
        visibility: "public"
      },
      players: [{ id: "user-1", role: "host", displayName: "Moss" }]
    });
  });

  it("rejects a guest trying to host a room", () => {
    expect(() =>
      createRoom({
        id: "room-1",
        host: { id: "guest-1", kind: "guest", displayName: "Fern" },
        settings: { maxPlayers: 2, expansions: [], visibility: "private" }
      })
    ).toThrow("Only registered users can host a game");
  });

  it("allows a guest to join a waiting room without changing the host", () => {
    const room = createRoom({
      id: "room-1",
      host,
      settings: { maxPlayers: 2, expansions: [], visibility: "private" }
    });

    const joinedRoom = joinRoom(room, {
      id: "guest-1",
      kind: "guest",
      displayName: "Fern"
    });

    expect(joinedRoom.hostId).toBe("user-1");
    expect(joinedRoom.players).toEqual([
      { id: "user-1", role: "host", displayName: "Moss" },
      { id: "guest-1", role: "player", displayName: "Fern" }
    ]);
  });

  it("does not let a player join twice or exceed the configured table size", () => {
    const room = createRoom({
      id: "room-1",
      host,
      settings: { maxPlayers: 2, expansions: [], visibility: "private" }
    });
    const guest = { id: "guest-1", kind: "guest" as const, displayName: "Fern" };
    const fullRoom = joinRoom(room, guest);

    expect(() => joinRoom(fullRoom, guest)).toThrow("This game is already full");
    expect(() =>
      joinRoom(fullRoom, { id: "guest-2", kind: "guest", displayName: "Lark" })
    ).toThrow("This game is already full");
  });
});
