"use client";

import React, { useState, type FormEvent } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath: string;
  error?: string;
  onAuthenticated?: (path: string) => void;
};

type AuthenticationResponse = {
  error?: string;
  redirectTo?: string;
};

const GENERIC_ERROR = "Unable to complete authentication. Please try again.";

export function AuthForm({ mode, nextPath, error, onAuthenticated }: AuthFormProps) {
  const registering = mode === "register";
  const action = registering ? "/auth/register" : "/auth/login";
  const title = registering ? "Register" : "Sign in";
  const alternatePath = registering ? "/login" : "/register";
  const alternateLabel = registering ? "Already have an account? Sign in" : "Need an account? Register";
  const [submissionError, setSubmissionError] = useState(error);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(undefined);
    setIsSubmitting(true);

    try {
      const response = await fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(event.currentTarget)
      });
      const payload = (await response.json()) as AuthenticationResponse;

      if (!response.ok || !payload.redirectTo) {
        setSubmissionError(payload.error ?? GENERIC_ERROR);
        return;
      }

      (onAuthenticated ?? ((path) => window.location.assign(path)))(payload.redirectTo);
    } catch {
      setSubmissionError(GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={action} aria-label={title} className="auth-form" method="post" onSubmit={handleSubmit}>
      <input name="next" type="hidden" value={nextPath} />
      {submissionError ? <p role="alert">{submissionError}</p> : null}
      {registering ? (
        <label>
          Display name
          <input autoComplete="nickname" maxLength={40} minLength={2} name="displayName" required />
        </label>
      ) : null}
      <label>
        Email address
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Password
        <input autoComplete={registering ? "new-password" : "current-password"} minLength={12} name="password" required type="password" />
      </label>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Please wait…" : registering ? "Create account" : "Sign in"}
      </button>
      <a href={`${alternatePath}?next=${encodeURIComponent(nextPath)}`}>{alternateLabel}</a>
    </form>
  );
}
