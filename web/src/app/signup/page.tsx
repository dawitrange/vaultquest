import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OAuthButtons } from "@/components/OAuthButtons";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        We never ask for your Steam password. Partner-funded quests only.
      </p>
      <OAuthButtons
        google={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
        discord={Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET)}
      />
      <SignupForm />
    </div>
  );
}
