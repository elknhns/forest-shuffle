import { randomUUID } from "node:crypto";

import type { AvatarCardId } from "../avatar/cards";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarCard: AvatarCardId;
  passwordHash: string;
};

export type AuthSession = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export interface AuthStore {
  createUser(input: Omit<AuthUser, "id">): Promise<AuthUser>;
  createSession(session: AuthSession): Promise<void>;
  findSession(tokenHash: string): Promise<AuthSession | null>;
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<AuthUser | null>;
}

export class InMemoryAuthStore implements AuthStore {
  private readonly usersByEmail = new Map<string, AuthUser>();
  private readonly usersById = new Map<string, AuthUser>();
  private readonly sessions = new Map<string, AuthSession>();

  async createUser(input: Omit<AuthUser, "id">): Promise<AuthUser> {
    const user = { id: randomUUID(), ...input };
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return { ...user };
  }

  async createSession(session: AuthSession): Promise<void> {
    this.sessions.set(session.tokenHash, { ...session });
  }

  async findSession(tokenHash: string): Promise<AuthSession | null> {
    const session = this.sessions.get(tokenHash);
    return session ? { ...session } : null;
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const user = this.usersByEmail.get(email);
    return user ? { ...user } : null;
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const user = this.usersById.get(id);
    return user ? { ...user } : null;
  }
}
