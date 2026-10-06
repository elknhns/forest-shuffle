import { cookies } from "next/headers";

import { createPostgresAuthStore } from "./postgres-store";
import { AuthService, type SignedInUser } from "./service";
import { SESSION_COOKIE } from "./session";

let service: AuthService | undefined;

export function getAuthService(): AuthService {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be configured before authentication can be used");
  }

  service ??= new AuthService(createPostgresAuthStore(databaseUrl));
  return service;
}

export async function getCurrentUser(): Promise<SignedInUser | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const cookieStore = await cookies();
  return getAuthService().currentUser(cookieStore.get(SESSION_COOKIE)?.value);
}
