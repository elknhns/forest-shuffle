import postgres, { type Sql } from "postgres";

import type { AvatarCardId } from "../avatar/cards";
import type { AuthSession, AuthStore, AuthUser } from "./store";

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  avatar_card: AvatarCardId;
  password_hash: string;
};

type SessionRow = {
  user_id: string;
  token_hash: string;
  expires_at: Date;
};

export class PostgresAuthStore implements AuthStore {
  constructor(private readonly sql: Sql) {}

  async createUser(input: Omit<AuthUser, "id">): Promise<AuthUser> {
    const [row] = await this.sql<UserRow[]>`
      INSERT INTO users (email, display_name, avatar_card, password_hash)
      VALUES (${input.email}, ${input.displayName}, ${input.avatarCard}, ${input.passwordHash})
      RETURNING id, email, display_name, avatar_card, password_hash
    `;

    return toAuthUser(row);
  }

  async createSession(session: AuthSession): Promise<void> {
    await this.sql`
      INSERT INTO sessions (token_hash, user_id, expires_at)
      VALUES (${session.tokenHash}, ${session.userId}, ${session.expiresAt})
    `;
  }

  async findSession(tokenHash: string): Promise<AuthSession | null> {
    const [row] = await this.sql<SessionRow[]>`
      SELECT user_id, token_hash, expires_at
      FROM sessions
      WHERE token_hash = ${tokenHash}
    `;

    return row
      ? { userId: row.user_id, tokenHash: row.token_hash, expiresAt: row.expires_at }
      : null;
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const [row] = await this.sql<UserRow[]>`
      SELECT id, email, display_name, avatar_card, password_hash
      FROM users
      WHERE email = ${email}
    `;

    return row ? toAuthUser(row) : null;
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const [row] = await this.sql<UserRow[]>`
      SELECT id, email, display_name, avatar_card, password_hash
      FROM users
      WHERE id = ${id}
    `;

    return row ? toAuthUser(row) : null;
  }
}

export function createPostgresAuthStore(databaseUrl: string): PostgresAuthStore {
  return new PostgresAuthStore(postgres(databaseUrl, { prepare: false }));
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarCard: row.avatar_card,
    passwordHash: row.password_hash
  };
}
