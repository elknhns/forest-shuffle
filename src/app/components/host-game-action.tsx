import React from "react";

const gameSetupPath = "/games/new";
const registrationPath = "/register?next=%2Fgames%2Fnew";
const loginPath = "/login?next=%2Fgames%2Fnew";

export function HostGameAction({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <a className="host-game-action__primary" href={gameSetupPath}>
        Host a game
      </a>
    );
  }

  return (
    <div className="host-game-action">
      <a className="host-game-action__primary" href={registrationPath}>
        Register to host
      </a>
      <a className="host-game-action__secondary" href={loginPath}>
        Sign in
      </a>
    </div>
  );
}
