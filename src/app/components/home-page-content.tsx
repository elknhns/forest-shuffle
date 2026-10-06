import React from "react";

import { HostGameAction } from "./host-game-action";

const expansions = [
  { name: "Base game", detail: "The living forest at its heart." },
  { name: "Alpine", detail: "High-altitude habitats and wildlife." },
  { name: "Woodland Edge", detail: "New life where forest meets meadow." },
  { name: "Exploration", detail: "A wider world to discover together." }
];

export function HomePageContent({ signedIn }: { signedIn: boolean }) {
  return (
    <main>
      <header>
        <a href="#top" aria-label="Forest Shuffle home">
          Forest Shuffle
        </a>
        <nav aria-label="Primary navigation">
          <a href="#lobby">Lobby</a>
          <a href="#how-it-works">How it works</a>
          <a href={signedIn ? "/games/new" : "/login?next=%2Fgames%2Fnew"}>
            {signedIn ? "Host a game" : "Sign in"}
          </a>
        </nav>
      </header>

      <section id="top" aria-labelledby="welcome-heading">
        <p>ASYNC TABLETOP · 2–5 PLAYERS</p>
        <h1 id="welcome-heading">A quieter way to play Forest Shuffle.</h1>
        <p>
          Build a thriving habitat with friends—one thoughtful turn at a time.
          Your game waits safely until everyone is ready to return.
        </p>
        <div>
          <a href="#lobby">Browse the lobby</a>
          <HostGameAction signedIn={signedIn} />
        </div>
      </section>

      <section id="lobby" aria-labelledby="lobby-heading">
        <p>OPEN TABLES</p>
        <h2 id="lobby-heading">Find your next forest.</h2>
        <p>Public games will appear here. Registered players can host; guests can join an open seat.</p>
        <HostGameAction signedIn={signedIn} />
      </section>

      <section id="how-it-works" aria-labelledby="expansion-heading">
        <p>YOUR TABLE, YOUR SEASON</p>
        <h2 id="expansion-heading">Choose the world you want to grow.</h2>
        <ul>
          {expansions.map((expansion) => (
            <li key={expansion.name}>
              <strong>{expansion.name}</strong>
              <span>{expansion.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="sign-in" aria-labelledby="start-heading">
        <p>READY WHEN YOU ARE</p>
        <h2 id="start-heading">Start a table, invite a friend, and play at your own pace.</h2>
        <HostGameAction signedIn={signedIn} />
      </section>
    </main>
  );
}
