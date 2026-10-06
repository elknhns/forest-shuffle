// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getCurrentUser } from "../../../auth/server";
import { getTableStore } from "../../../game/server";
import NewGamePage from "./page";

vi.mock("@mantine/core", async (importOriginal) => {
  const mantine = await importOriginal<typeof import("@mantine/core")>();

  return {
    ...mantine,
    // Reproduce the failed compound export seen in the browser bundle. The
    // page must use the standalone RadioGroup export instead of Radio.Group.
    Radio: { ...mantine.Radio, Group: undefined }
  };
});

vi.mock("../../../auth/server", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("../../../game/server", () => ({
  getTableStore: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("new-game page", () => {
  it("lets a signed-in player configure a table before hosting it", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "moss@example.com",
      displayName: "Moss",
      avatarCard: "birch"
    } as never);
    vi.mocked(getTableStore).mockReturnValue({
      listPublicWaiting: vi.fn().mockResolvedValue([])
    } as unknown as ReturnType<typeof getTableStore>);

    render(<MantineProvider>{await NewGamePage()}</MantineProvider>);

    expect(screen.getByRole("heading", { name: "Host a table" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Moss's Birch avatar" })).toBeTruthy();
    expect(screen.getByRole("form", { name: "Table settings" })).toBeTruthy();
    expect((screen.getByRole("radio", { name: /^Public lobby/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("combobox", { name: "Players" }) as HTMLSelectElement).value).toBe("2");
    expect((screen.getByRole("checkbox", { name: "Alpine" }) as HTMLInputElement).name).toBe("expansions");
    expect((screen.getByRole("checkbox", { name: "Woodland Edge" }) as HTMLInputElement).name).toBe("expansions");
    expect(screen.queryByRole("checkbox", { name: "Exploration" })).toBeNull();
    expect(screen.getByRole("button", { name: "Create table" })).toBeTruthy();
  });

  it("shows a public table that the signed-in player can join", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "moss@example.com",
      displayName: "Moss",
      avatarCard: "birch"
    });
    vi.mocked(getTableStore).mockReturnValue({
      listPublicWaiting: vi.fn().mockResolvedValue([
        {
          inviteCode: "FERN42",
          hostDisplayName: "Fern",
          playerCount: 2,
          playerDisplayNames: ["Fern", "Moss"],
          hasJoined: false,
          settings: { visibility: "public", maxPlayers: 3, expansions: ["alpine"] }
        }
      ])
    } as unknown as ReturnType<typeof getTableStore>);

    render(<MantineProvider>{await NewGamePage()}</MantineProvider>);

    expect(screen.getByRole("heading", { name: "Available tables" })).toBeTruthy();
    expect(screen.getByText("Fern's table")).toBeTruthy();
    expect(screen.getByText("2 / 3 players")).toBeTruthy();
    expect(screen.getByText("Fern · Moss")).toBeTruthy();
    expect(screen.getAllByText("Alpine")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Join table" })).toBeTruthy();
  });
});
