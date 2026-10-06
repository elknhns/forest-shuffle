import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import type { Metadata } from "next";
import { Amatic_SC, Roboto_Condensed } from "next/font/google";
import "@mantine/core/styles.css";
import "./globals.css";

const displayFont = Amatic_SC({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"]
});

const bodyFont = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-body"
});

const theme = createTheme({
  fontFamily: "var(--font-body), sans-serif",
  headings: { fontFamily: "var(--font-display), cursive", fontWeight: "700" },
  primaryColor: "forest",
  colors: {
    forest: ["#edf7f1", "#d7eadf", "#b1d4bf", "#88bd9d", "#64a67e", "#4e926a", "#3d7655", "#2e5a42", "#214432", "#173a2a"]
  }
});

export const metadata: Metadata = {
  title: "Forest Shuffle · Play async",
  description: "A calm, asynchronous way to play Forest Shuffle with friends."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
        <MantineProvider defaultColorScheme="light" theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
