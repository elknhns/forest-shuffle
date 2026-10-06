// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { HostGameAction } from "./host-game-action";

afterEach(cleanup);

describe("HostGameAction", () => {
  it("directs signed-out visitors to register and lets them choose sign-in", () => {
    render(<HostGameAction signedIn={false} />);

    expect(screen.getByRole("link", { name: "Register to host" })).toHaveProperty(
      "href",
      "http://localhost:3000/register?next=%2Fgames%2Fnew"
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveProperty(
      "href",
      "http://localhost:3000/login?next=%2Fgames%2Fnew"
    );
  });

  it("directs signed-in visitors to create a game", () => {
    render(<HostGameAction signedIn />);

    expect(screen.getByRole("link", { name: "Host a game" })).toHaveProperty(
      "href",
      "http://localhost:3000/games/new"
    );
    expect(screen.queryByRole("link", { name: "Register to host" })).toBeNull();
  });
});
