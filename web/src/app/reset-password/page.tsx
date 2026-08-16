import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          This reset link is missing or incomplete.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/forgot-password" className="text-[var(--vq-teal)] hover:underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        At least 8 characters. This is your VaultQuest password, not Steam.
      </p>
      <ResetPasswordForm token={token} />
    </div>
  );
}