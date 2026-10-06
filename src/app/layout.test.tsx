import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Amatic_SC: () => () => ({ variable: "--font-display" }),
  Roboto_Condensed: () => () => ({ variable: "--font-body" })
}));

import RootLayout from "./layout";

describe("root layout", () => {
  it("suppresses expected hydration mismatches on root elements", () => {
    // Vitest compiles JSX using the classic transform, unlike Next.js.
    globalThis.React = React;
    const layout = RootLayout({ children: <main>Forest Shuffle</main> });
    const [, body] = React.Children.toArray(layout.props.children);
    const bodyElement = body as React.ReactElement<{ suppressHydrationWarning?: boolean }>;

    expect(layout.type).toBe("html");
    expect(layout.props.suppressHydrationWarning).toBe(true);
    expect(bodyElement.type).toBe("body");
    expect(bodyElement.props.suppressHydrationWarning).toBe(true);
  });
});
