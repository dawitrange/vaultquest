import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EarnAuthPrompt } from "@/components/EarnAuthPrompt";
import { OAuthButtons } from "@/components/OAuthButtons";
import { SignupForm } from "@/components/SignupForm";
import { pathFromAuthHint } from "@/lib/auth-redirect";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const params = await searchParams;
  const from = params.from === "earn" || params.from === "rewards" || params.from === "account" ? params.from : undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        We never ask for your Steam password. Partner-funded quests only.
      </p>
      {from === "earn" ? <EarnAuthPrompt actions={false} /> : null}
      <OAuthButtons
        google={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        discord={Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET)}
        redirectTo={pathFromAuthHint(from)}
      />
      <SignupForm from={from} />
    </div>
  );
}
