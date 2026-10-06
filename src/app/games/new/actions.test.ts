import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "../../../auth/server";
import { getTableStore } from "../../../game/server";
import { redirect } from "next/navigation";
import { createTable, joinTable } from "./actions";

vi.mock("../../../auth/server", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("../../../game/server", () => ({
  getTableStore: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createTable", () => {
  it("creates a table with the signed-in host's chosen settings", async () => {
    const create = vi.fn().mockResolvedValue({ inviteCode: "MOSS42" });
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "moss@example.com",
      displayName: "Moss",
      avatarCard: "birch"
    });
    vi.mocked(getTableStore).mockReturnValue({
      create,
      findByInviteCode: vi.fn(),
      listPublicWaiting: vi.fn(),
      join: vi.fn()
    } as ReturnType<typeof getTableStore>);

    const formData = new FormData();
    formData.set("visibility", "private");
    formData.set("maxPlayers", "4");
    formData.append("expansions", "alpine");
    formData.append("expansions", "exploration");

    await createTable(formData);

    expect(create).toHaveBeenCalledWith({
      host: { id: "user-1", displayName: "Moss" },
      settings: {
        visibility: "private",
        maxPlayers: 4,
        expansions: ["alpine", "exploration"]
      }
    });
    expect(redirect).toHaveBeenCalledWith("/games/MOSS42");
  });

  it("joins the signed-in player to a public waiting table", async () => {
    const join = vi.fn().mockResolvedValue({ inviteCode: "FERN42" });
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "moss@example.com",
      displayName: "Moss",
      avatarCard: "birch"
    });
    vi.mocked(getTableStore).mockReturnValue({
      create: vi.fn(),
      findByInviteCode: vi.fn(),
      listPublicWaiting: vi.fn(),
      join
    } as unknown as ReturnType<typeof getTableStore>);

    const formData = new FormData();
    formData.set("inviteCode", "fern42");

    await joinTable(formData);

    expect(join).toHaveBeenCalledWith({
      inviteCode: "fern42",
      player: { id: "user-1", displayName: "Moss" }
    });
    expect(redirect).toHaveBeenCalledWith("/games/FERN42");
  });
});
