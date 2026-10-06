export const SESSION_COOKIE = "forest_shuffle_session";
export const DEFAULT_SIGNED_IN_PATH = "/games/new";

export function safeNextPath(nextPath: string | null | undefined): string {
  if (nextPath?.startsWith("/") && !nextPath.startsWith("//") && !nextPath.includes("\\")) {
    return nextPath;
  }

  return DEFAULT_SIGNED_IN_PATH;
}
