import { describe, expect, it, vi } from "vitest";

import { PostgresTableStore, parseStoredExpansions } from "./table-store";

describe("stored table settings", () => {
  it("reads a legacy JSON-string expansion list as expansion IDs", () => {
    expect(parseStoredExpansions('["alpine", "exploration"]')).toEqual(["alpine", "exploration"]);
  });

  it("includes lobby player display names in invite-code table summaries", async () => {
    const sql = vi.fn().mockResolvedValue([
      {
        invite_code: "MOSS42",
        display_name: "Moss",
        visibility: "public",
        max_players: 3,
        expansions: ["alpine"],
        player_count: 2,
        player_display_names: ["Moss", "Fern"]
      }
    ]);
    const store = new PostgresTableStore(sql as never);

    await expect(store.findByInviteCode("moss42")).resolves.toEqual({
      inviteCode: "MOSS42",
      hostDisplayName: "Moss",
      playerDisplayNames: ["Moss", "Fern"],
      playerCount: 2,
      settings: { visibility: "public", maxPlayers: 3, expansions: ["alpine"] }
    });
  });
});
