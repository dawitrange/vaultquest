import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        Enter the email on your account. If we have it, we send a reset link.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
