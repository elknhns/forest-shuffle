import { describe, expect, it } from "vitest";

import { safeNextPath } from "./session";

describe("safeNextPath", () => {
  it("keeps an in-app return path", () => {
    expect(safeNextPath("/games/new")).toBe("/games/new");
  });

  it("rejects external and protocol-relative return paths", () => {
    expect(safeNextPath("https://not-our-app.example")).toBe("/games/new");
    expect(safeNextPath("//not-our-app.example")).toBe("/games/new");
    expect(safeNextPath("/\\not-our-app.example")).toBe("/games/new");
  });
});
