import { createHash, randomBytes } from "node:crypto";

import { pickAvatarCard } from "../avatar/cards";
import { hashPassword, verifyPassword } from "./password";
import type { AuthStore, AuthUser } from "./store";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export type SignedInUser = Pick<AuthUser, "id" | "email" | "displayName" | "avatarCard">;

type Credentials = {
  email: string;
  password: string;
};

type Registration = Credentials & {
  displayName: string;
};

export class AuthService {
  constructor(private readonly store: AuthStore) {}

  async register(input: Registration): Promise<{ user: SignedInUser; sessionToken: string }> {
    const email = normalizeEmail(input.email);
    const displayName = normalizeDisplayName(input.displayName);
    validatePassword(input.password);

    if (await this.store.findUserByEmail(email)) {
      throw new Error("An account with that email already exists");
    }

    const user = await this.store.createUser({
      email,
      displayName,
      avatarCard: pickAvatarCard(),
      passwordHash: await hashPassword(input.password)
    });

    return this.createSession(user);
  }

  async login(input: Credentials): Promise<{ user: SignedInUser; sessionToken: string }> {
    const user = await this.store.findUserByEmail(normalizeEmail(input.email));

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new Error("Invalid email or password");
    }

    return this.createSession(user);
  }

  async currentUser(sessionToken: string | undefined): Promise<SignedInUser | null> {
    if (!sessionToken) {
      return null;
    }

    const session = await this.store.findSession(hashToken(sessionToken));
    if (!session || session.expiresAt <= new Date()) {
      return null;
    }

    const user = await this.store.findUserById(session.userId);
    return user ? publicUser(user) : null;
  }

  private async createSession(user: AuthUser): Promise<{ user: SignedInUser; sessionToken: string }> {
    const sessionToken = randomBytes(32).toString("base64url");
    await this.store.createSession({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
    });

    return { user: publicUser(user), sessionToken };
  }
}

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Enter a valid email address");
  }
  return normalizedEmail;
}

function normalizeDisplayName(displayName: string): string {
  const normalizedDisplayName = displayName.trim();
  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 40) {
    throw new Error("Display name must be between 2 and 40 characters");
  }
  return normalizedDisplayName;
}

function validatePassword(password: string): void {
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters");
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function publicUser(user: AuthUser): SignedInUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarCard: user.avatarCard
  };
}
