// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { getTableStore } from "../../../game/server";
import TablePage from "./page";

vi.mock("../../../game/server", () => ({
  getTableStore: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn()
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

describe("table page", () => {
  it("shows the created table's invite code and selected rules", async () => {
    vi.mocked(getTableStore).mockReturnValue({
      findByInviteCode: vi.fn().mockResolvedValue({
        inviteCode: "MOSS42",
        hostDisplayName: "Moss",
        playerCount: 2,
        playerDisplayNames: ["Moss", "Fern"],
        settings: {
          visibility: "private",
          maxPlayers: 4,
          expansions: ["alpine", "exploration"]
        }
      })
    } as unknown as ReturnType<typeof getTableStore>);

    render(<MantineProvider>{await TablePage({ params: Promise.resolve({ inviteCode: "moss42" }) })}</MantineProvider>);

    expect(screen.getByRole("heading", { name: "Your table is ready" })).toBeTruthy();
    expect(screen.getByText("MOSS42")).toBeTruthy();
    expect(screen.getByText("Private link")).toBeTruthy();
    expect(screen.getByText("Moss · Fern")).toBeTruthy();
    expect(screen.getByText("2 of 4 seats")).toBeTruthy();
    expect(screen.getByText("Base game · Alpine · Exploration")).toBeTruthy();
  });
});
