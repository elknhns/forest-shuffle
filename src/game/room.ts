export type ExpansionId = "alpine" | "woodland-edge" | "exploration";

export type PlayerIdentity = {
  id: string;
  kind: "registered" | "guest";
  displayName: string;
};

export type RoomSettings = {
  maxPlayers: 2 | 3 | 4 | 5;
  expansions: ExpansionId[];
  visibility: "public" | "private";
};

export type RoomPlayer = {
  id: string;
  role: "host" | "player";
  displayName: string;
};

export type GameRoom = {
  id: string;
  hostId: string;
  status: "waiting";
  settings: RoomSettings;
  players: RoomPlayer[];
};

export function createRoom(input: {
  id: string;
  host: PlayerIdentity;
  settings: RoomSettings;
}): GameRoom {
  if (input.host.kind !== "registered") {
    throw new Error("Only registered users can host a game");
  }

  return {
    id: input.id,
    hostId: input.host.id,
    status: "waiting",
    settings: input.settings,
    players: [
      {
        id: input.host.id,
        role: "host",
        displayName: input.host.displayName
      }
    ]
  };
}

export function joinRoom(room: GameRoom, player: PlayerIdentity): GameRoom {
  if (room.players.length >= room.settings.maxPlayers) {
    throw new Error("This game is already full");
  }

  if (room.players.some((existingPlayer) => existingPlayer.id === player.id)) {
    throw new Error("You have already joined this game");
  }

  return {
    ...room,
    players: [
      ...room.players,
      { id: player.id, role: "player", displayName: player.displayName }
    ]
  };
}
