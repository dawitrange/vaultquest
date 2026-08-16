import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EarnAuthPrompt } from "@/components/EarnAuthPrompt";
import { OAuthButtons } from "@/components/OAuthButtons";
import { SignupForm } from "@/components/SignupForm";
import { pathAfterSignup } from "@/lib/auth-redirect";
import { utmFromSearchParams } from "@/lib/utm";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (session?.user) redirect(pathAfterSignup());

  const fromRaw = Array.isArray(params.from) ? params.from[0] : params.from;
  const from = fromRaw === "earn" || fromRaw === "rewards" || fromRaw === "account" ? fromRaw : undefined;
  const utm = utmFromSearchParams(params);

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        An account is how the partner credits you. Points hold 3–14 days. We never ask for your Steam password.
      </p>
      {from === "earn" ? <EarnAuthPrompt actions={false} /> : null}
      <OAuthButtons
        google={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        discord={Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET)}
        redirectTo={pathAfterSignup()}
        utm={utm}
      />
      <SignupForm from={from} utm={utm} />
    </div>
  );
}
