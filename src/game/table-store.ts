import { randomInt } from "node:crypto";

import postgres, { type Sql } from "postgres";

import type { ExpansionId, RoomSettings } from "./room";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_INVITE_CODE_ATTEMPTS = 5;
const expansionIds = ["alpine", "woodland-edge", "exploration"] as const satisfies readonly ExpansionId[];

export type TableHost = {
  id: string;
  displayName: string;
};

export type NewTable = {
  host: TableHost;
  settings: RoomSettings;
};

export type HostedTable = {
  inviteCode: string;
};

export type TableSummary = {
  inviteCode: string;
  hostDisplayName: string;
  settings: RoomSettings;
  playerCount: number;
  playerDisplayNames: string[];
};

export type PublicTable = TableSummary & {
  hasJoined: boolean;
};

export type JoiningPlayer = {
  id: string;
  displayName: string;
};

export interface TableStore {
  create(input: NewTable): Promise<HostedTable>;
  findByInviteCode(inviteCode: string): Promise<TableSummary | null>;
  listPublicWaiting(playerId: string): Promise<PublicTable[]>;
  join(input: { inviteCode: string; player: JoiningPlayer }): Promise<HostedTable>;
}

type CreatedTableRow = {
  invite_code: string;
};

type TableSummaryRow = {
  invite_code: string;
  display_name: string;
  visibility: RoomSettings["visibility"];
  max_players: RoomSettings["maxPlayers"];
  expansions: unknown;
  player_count: number;
  player_display_names: string[];
};

type PublicTableRow = TableSummaryRow & {
  has_joined: boolean;
};

type JoinableTableRow = {
  id: string;
  invite_code: string;
  status: string;
  visibility: RoomSettings["visibility"];
  max_players: number;
};

export class PostgresTableStore implements TableStore {
  constructor(private readonly sql: Sql) {}

  async create(input: NewTable): Promise<HostedTable> {
    for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt += 1) {
      const inviteCode = createInviteCode();

      try {
        const table = await this.sql.begin(async (transaction) => {
          const [game] = await transaction<CreatedTableRow[]>`
            INSERT INTO games (invite_code, host_user_id, status, visibility, max_players, expansions)
            VALUES (
              ${inviteCode},
              ${input.host.id},
              'waiting',
              ${input.settings.visibility},
              ${input.settings.maxPlayers},
              ${transaction.json(input.settings.expansions)}
            )
            RETURNING invite_code
          `;

          await transaction`
            INSERT INTO game_players (game_id, user_id, seat, display_name)
            SELECT id, ${input.host.id}, 0, ${input.host.displayName}
            FROM games
            WHERE invite_code = ${game.invite_code}
          `;

          return game;
        });

        return { inviteCode: table.invite_code };
      } catch (error) {
        if (!isInviteCodeCollision(error)) {
          throw error;
        }
      }
    }

    throw new Error("Unable to create a unique table code. Please try again.");
  }

  async findByInviteCode(inviteCode: string): Promise<TableSummary | null> {
    const [table] = await this.sql<TableSummaryRow[]>`
      SELECT
        games.invite_code,
        users.display_name,
        games.visibility,
        games.max_players,
        games.expansions,
        COUNT(game_players.id)::integer AS player_count,
        COALESCE(
          ARRAY_AGG(game_players.display_name ORDER BY game_players.seat)
            FILTER (WHERE game_players.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS player_display_names
      FROM games
      INNER JOIN users ON users.id = games.host_user_id
      LEFT JOIN game_players ON game_players.game_id = games.id
      WHERE games.invite_code = ${inviteCode.toUpperCase()}
      GROUP BY games.id, users.display_name
    `;

    return table
      ? {
          inviteCode: table.invite_code,
          hostDisplayName: table.display_name,
          settings: {
            visibility: table.visibility,
            maxPlayers: table.max_players,
            expansions: parseStoredExpansions(table.expansions)
          },
          playerCount: table.player_count,
          playerDisplayNames: table.player_display_names
        }
      : null;
  }

  async listPublicWaiting(playerId: string): Promise<PublicTable[]> {
    const tables = await this.sql<PublicTableRow[]>`
      SELECT
        games.invite_code,
        users.display_name,
        games.visibility,
        games.max_players,
        games.expansions,
        COUNT(game_players.id)::integer AS player_count,
        COALESCE(
          ARRAY_AGG(game_players.display_name ORDER BY game_players.seat)
            FILTER (WHERE game_players.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS player_display_names,
        COALESCE(BOOL_OR(game_players.user_id = ${playerId}), false) AS has_joined
      FROM games
      INNER JOIN users ON users.id = games.host_user_id
      LEFT JOIN game_players ON game_players.game_id = games.id
      WHERE games.status = 'waiting' AND games.visibility = 'public'
      GROUP BY games.id, users.display_name
      HAVING COUNT(game_players.id) < games.max_players
        OR BOOL_OR(game_players.user_id = ${playerId})
      ORDER BY games.created_at DESC
      LIMIT 24
    `;

    return tables.map((table) => ({
      inviteCode: table.invite_code,
      hostDisplayName: table.display_name,
      settings: {
        visibility: table.visibility,
        maxPlayers: table.max_players,
        expansions: parseStoredExpansions(table.expansions)
      },
      playerCount: table.player_count,
      playerDisplayNames: table.player_display_names,
      hasJoined: table.has_joined
    }));
  }

  async join(input: { inviteCode: string; player: JoiningPlayer }): Promise<HostedTable> {
    return this.sql.begin(async (transaction) => {
      const [table] = await transaction<JoinableTableRow[]>`
        SELECT id, invite_code, status, visibility, max_players
        FROM games
        WHERE invite_code = ${input.inviteCode.toUpperCase()}
        FOR UPDATE
      `;

      if (!table || table.status !== "waiting") {
        throw new Error("This table is no longer available");
      }

      if (table.visibility !== "public") {
        throw new Error("This private table can only be joined from its invite link");
      }

      const [existingPlayer] = await transaction<{ player_id: string }[]>`
        SELECT id AS player_id
        FROM game_players
        WHERE game_id = ${table.id} AND user_id = ${input.player.id}
      `;
      if (existingPlayer) {
        return { inviteCode: table.invite_code };
      }

      const [{ player_count: playerCount }] = await transaction<{ player_count: number }[]>`
        SELECT COUNT(*)::integer AS player_count
        FROM game_players
        WHERE game_id = ${table.id}
      `;
      if (playerCount >= table.max_players) {
        throw new Error("This table is already full");
      }

      await transaction`
        INSERT INTO game_players (game_id, user_id, seat, display_name)
        VALUES (${table.id}, ${input.player.id}, ${playerCount}, ${input.player.displayName})
      `;

      return { inviteCode: table.invite_code };
    });
  }
}

export function createPostgresTableStore(databaseUrl: string): PostgresTableStore {
  return new PostgresTableStore(postgres(databaseUrl, { prepare: false }));
}

function createInviteCode(): string {
  return Array.from(
    { length: 6 },
    () => INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]
  ).join("");
}

function isInviteCodeCollision(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export function parseStoredExpansions(value: unknown): ExpansionId[] {
  const parsed = typeof value === "string" ? parseJson(value) : value;
  return Array.isArray(parsed) ? parsed.filter(isExpansionId) : [];
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function isExpansionId(value: unknown): value is ExpansionId {
  return typeof value === "string" && expansionIds.includes(value as ExpansionId);
}
