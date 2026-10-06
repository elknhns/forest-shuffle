import type { ExpansionId, GameRoom } from "./room";

export type GameEvent = {
  version: number;
  type: "turn-ended";
  actorId: string;
  turn: number;
};

export type AsyncGameState = {
  roomId: string;
  status: "active";
  version: number;
  turn: number;
  currentPlayerId: string;
  playerIds: string[];
  enabledExpansions: ExpansionId[];
  deck: string[];
  events: GameEvent[];
};

export function startGame(room: GameRoom, actorId: string, deck: string[]): AsyncGameState {
  if (room.hostId !== actorId) {
    throw new Error("Only the host can start this game");
  }

  if (room.players.length < 2) {
    throw new Error("At least two players are needed to start a game");
  }

  return {
    roomId: room.id,
    status: "active",
    version: 0,
    turn: 1,
    currentPlayerId: room.players[0].id,
    playerIds: room.players.map((player) => player.id),
    enabledExpansions: [...room.settings.expansions],
    deck: [...deck],
    events: []
  };
}

export function endTurn(
  game: AsyncGameState,
  action: { actorId: string; expectedVersion: number }
): AsyncGameState {
  if (action.expectedVersion !== game.version) {
    throw new Error("This game changed; refresh and try again");
  }

  if (action.actorId !== game.currentPlayerId) {
    throw new Error("It is not your turn");
  }

  const currentPlayerIndex = game.playerIds.indexOf(game.currentPlayerId);
  const nextPlayerId = game.playerIds[(currentPlayerIndex + 1) % game.playerIds.length];
  const nextVersion = game.version + 1;

  return {
    ...game,
    version: nextVersion,
    turn: game.turn + 1,
    currentPlayerId: nextPlayerId,
    events: [
      ...game.events,
      { version: nextVersion, type: "turn-ended", actorId: action.actorId, turn: game.turn }
    ]
  };
}
