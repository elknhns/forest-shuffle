import { afterEach, describe, expect, it, vi } from "vitest";

import { getAuthService } from "./server";
import { completeAuthentication } from "./route";
import { SESSION_COOKIE } from "./session";

vi.mock("./server", () => ({
  getAuthService: vi.fn()
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("completeAuthentication", () => {
  it("returns a JSON success response and session cookie for a JavaScript form", async () => {
    vi.mocked(getAuthService).mockReturnValue({
      login: vi.fn().mockResolvedValue({ sessionToken: "session-token" })
    } as unknown as ReturnType<typeof getAuthService>);

    const response = await completeAuthentication(
      requestWithForm({ email: "moss@example.com", password: "maple-syrup-42", next: "/games/new" }),
      "login"
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/games/new" });
    expect(response.cookies.get(SESSION_COOKIE)?.value).toBe("session-token");
  });

  it("returns a JSON error without a redirect when a JavaScript form fails", async () => {
    vi.mocked(getAuthService).mockReturnValue({
      login: vi.fn().mockRejectedValue(new Error("Invalid email or password"))
    } as unknown as ReturnType<typeof getAuthService>);

    const response = await completeAuthentication(
      requestWithForm({ email: "moss@example.com", password: "wrong-password", next: "/games/new" }),
      "login"
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid email or password" });
    expect(response.headers.get("location")).toBeNull();
  });
});

function requestWithForm(values: Record<string, string>): Request {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return new Request("http://localhost/auth/login", {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData
  });
}
