import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the password used to create a hash", async () => {
    const passwordHash = await hashPassword("maple-syrup-42");

    await expect(verifyPassword("maple-syrup-42", passwordHash)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const passwordHash = await hashPassword("maple-syrup-42");

    await expect(verifyPassword("different-password", passwordHash)).resolves.toBe(false);
  });
});
