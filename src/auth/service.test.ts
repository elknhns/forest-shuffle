import { describe, expect, it } from "vitest";

import { InMemoryAuthStore } from "./store";
import { AuthService } from "./service";

describe("authentication service", () => {
  it("registers a user and creates a session", async () => {
    const store = new InMemoryAuthStore();
    const service = new AuthService(store);

    const result = await service.register({
      email: "Moss@Example.com",
      displayName: "Moss",
      password: "maple-syrup-42"
    });

    expect(result.user).toMatchObject({ email: "moss@example.com", displayName: "Moss" });
    await expect(service.currentUser(result.sessionToken)).resolves.toEqual(result.user);
  });

  it("assigns a preset card avatar when a user first registers", async () => {
    const service = new AuthService(new InMemoryAuthStore());

    const result = await service.register({
      email: "fern@example.com",
      displayName: "Fern",
      password: "maple-syrup-42"
    });

    expect(["birch", "roe-deer", "european-hare", "oak", "red-fox", "tawny-owl"]).toContain(
      (result.user as { avatarCard?: unknown }).avatarCard
    );
    await expect(service.currentUser(result.sessionToken)).resolves.toEqual(result.user);
  });

  it("does not create a second account for an email address", async () => {
    const service = new AuthService(new InMemoryAuthStore());
    const input = { email: "moss@example.com", displayName: "Moss", password: "maple-syrup-42" };

    await service.register(input);

    await expect(service.register(input)).rejects.toThrow("An account with that email already exists");
  });

  it("signs in an existing user with the correct password", async () => {
    const service = new AuthService(new InMemoryAuthStore());
    const registration = await service.register({
      email: "moss@example.com",
      displayName: "Moss",
      password: "maple-syrup-42"
    });

    const login = await service.login({ email: "moss@example.com", password: "maple-syrup-42" });

    expect(login.user).toEqual(registration.user);
    await expect(service.currentUser(login.sessionToken)).resolves.toEqual(registration.user);
  });

  it("does not sign in an account with the wrong password", async () => {
    const service = new AuthService(new InMemoryAuthStore());
    await service.register({
      email: "moss@example.com",
      displayName: "Moss",
      password: "maple-syrup-42"
    });

    await expect(
      service.login({ email: "moss@example.com", password: "wrong-password" })
    ).rejects.toThrow("Invalid email or password");
  });
});
