import { describe, expect, it } from "vitest";

import { sessionCookieOptions } from "./cookie-options";

describe("session cookie options", () => {
  it("creates a host-only HttpOnly cookie with a bounded lifetime", () => {
    expect(sessionCookieOptions(false)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  });

  it("requires HTTPS in production", () => {
    expect(sessionCookieOptions(true)).toMatchObject({ secure: true });
  });
});
