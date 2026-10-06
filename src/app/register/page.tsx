import Link from "next/link";

import { AuthForm } from "../components/auth-form";
import { safeNextPath } from "../../auth/session";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <main className="auth-page">
      <Link href="/">Forest Shuffle</Link>
      <h1>Create your host account</h1>
      <p>Registered players can host async games. Guests can still join an open table.</p>
      <AuthForm error={params.error} mode="register" nextPath={nextPath} />
    </main>
  );
}
