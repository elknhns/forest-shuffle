const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  };
}
