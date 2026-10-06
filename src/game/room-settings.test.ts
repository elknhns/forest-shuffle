import { describe, expect, it } from "vitest";

import { parseRoomSettings } from "./room-settings";

describe("table settings", () => {
  it("accepts a private four-player table with selected expansions", () => {
    const formData = new FormData();
    formData.set("visibility", "private");
    formData.set("maxPlayers", "4");
    formData.append("expansions", "alpine");
    formData.append("expansions", "exploration");

    expect(parseRoomSettings(formData)).toEqual({
      visibility: "private",
      maxPlayers: 4,
      expansions: ["alpine", "exploration"]
    });
  });

  it("rejects settings outside the supported options", () => {
    const formData = new FormData();
    formData.set("visibility", "friends-only");
    formData.set("maxPlayers", "6");
    formData.append("expansions", "unreleased");

    expect(() => parseRoomSettings(formData)).toThrow("Choose a public or private table");
  });
});
