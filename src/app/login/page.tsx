import Link from "next/link";

import { AuthForm } from "../components/auth-form";
import { safeNextPath } from "../../auth/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <main className="auth-page">
      <Link href="/">Forest Shuffle</Link>
      <h1>Welcome back</h1>
      <p>Sign in to host a new table or return to one of your forests.</p>
      <AuthForm error={params.error} mode="login" nextPath={nextPath} />
    </main>
  );
}
