// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthForm } from "./auth-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AuthForm", () => {
  it("shows the registration fields and preserves the host return path", () => {
    render(<AuthForm mode="register" nextPath="/games/new" />);

    expect(screen.getByRole("form", { name: "Register" })).toHaveProperty(
      "action",
      "http://localhost:3000/auth/register"
    );
    expect(screen.getByLabelText("Display name")).toBeTruthy();
    expect(screen.getByDisplayValue("/games/new")).toBeTruthy();
  });

  it("shows the sign-in fields without a display-name field", () => {
    render(<AuthForm mode="login" nextPath="/games/new" />);

    expect(screen.getByRole("form", { name: "Sign in" })).toHaveProperty(
      "action",
      "http://localhost:3000/auth/login"
    );
    expect(screen.queryByLabelText("Display name")).toBeNull();
  });

  it("keeps entered values visible and shows an error when authentication fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid email or password" })
    } as Response);
    const onAuthenticated = vi.fn();

    render(<AuthForm mode="login" nextPath="/games/new" onAuthenticated={onAuthenticated} />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "moss@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Invalid email or password");
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("moss@example.com");
    expect((screen.getByLabelText("Password") as HTMLInputElement).value).toBe("wrong-password");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it("navigates only after successful authentication", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ redirectTo: "/games/new" })
    } as Response);
    const onAuthenticated = vi.fn();

    render(<AuthForm mode="login" nextPath="/games/new" onAuthenticated={onAuthenticated} />);
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith("/games/new"));
  });
});
