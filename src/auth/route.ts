import { NextResponse } from "next/server";

import { sessionCookieOptions } from "./cookie-options";
import { getAuthService } from "./server";
import { SESSION_COOKIE, safeNextPath } from "./session";

type AuthMode = "login" | "register";

const publicErrors = new Set([
  "An account with that email already exists",
  "Display name must be between 2 and 40 characters",
  "Enter a valid email address",
  "Invalid email or password",
  "Password must be at least 12 characters"
]);

export async function completeAuthentication(request: Request, mode: AuthMode): Promise<NextResponse> {
  const formData = await request.formData();
  const nextPath = safeNextPath(formValue(formData, "next"));
  const expectsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  try {
    const authService = getAuthService();
    const result =
      mode === "register"
        ? await authService.register({
            email: formValue(formData, "email") ?? "",
            displayName: formValue(formData, "displayName") ?? "",
            password: formValue(formData, "password") ?? ""
          })
        : await authService.login({
            email: formValue(formData, "email") ?? "",
            password: formValue(formData, "password") ?? ""
          });
    const response = expectsJson
      ? NextResponse.json({ redirectTo: nextPath })
      : NextResponse.redirect(new URL(nextPath, request.url), 303);
    response.cookies.set(
      SESSION_COOKIE,
      result.sessionToken,
      sessionCookieOptions(process.env.NODE_ENV === "production")
    );
    return response;
  } catch (error) {
    const message = error instanceof Error && publicErrors.has(error.message)
      ? error.message
      : "Unable to complete authentication. Please try again.";
    if (expectsJson) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const redirectUrl = new URL(`/${mode}`, request.url);
    redirectUrl.searchParams.set("next", nextPath);
    redirectUrl.searchParams.set("error", message);
    return NextResponse.redirect(redirectUrl, 303);
  }
}

function formValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}
