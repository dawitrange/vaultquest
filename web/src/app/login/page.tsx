import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EarnAuthPrompt } from "@/components/EarnAuthPrompt";
import { LoginForm } from "@/components/LoginForm";
import { OAuthButtons } from "@/components/OAuthButtons";
import { authHintFromValue, pathFromAuthHint } from "@/lib/auth-redirect";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reset?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const params = await searchParams;
  const from = authHintFromValue(params.from);

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">Access your Vault points and rewards.</p>
      {from === "earn" ? <EarnAuthPrompt actions={false} /> : null}
      {params.reset === "1" ? (
        <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">Password updated. Sign in with your new password.</p>
      ) : null}
      <OAuthButtons
        google={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        discord={Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET)}
        redirectTo={pathFromAuthHint(from)}
      />
      <LoginForm from={from} />
    </div>
  );
}
