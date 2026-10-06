// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { HomePageContent } from "./components/home-page-content";

describe("home page", () => {
  it("introduces the async game lobby and the supported expansions", () => {
    render(<HomePageContent signedIn={false} />);

    expect(
      screen.getByRole("heading", { name: "A quieter way to play Forest Shuffle." })
    ).toBeTruthy();
    expect(screen.getByText("Alpine")).toBeTruthy();
    expect(screen.getByText("Woodland Edge")).toBeTruthy();
    expect(screen.getByText("Exploration")).toBeTruthy();
  });
});
