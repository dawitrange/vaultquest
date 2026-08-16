"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  if (state.ok) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-[var(--vq-ink-muted)]">{state.message}</p>
        <Link
          href="/login?reset=1"
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">New password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
        />
      </label>
      {state.error ? <p className="text-sm text-[var(--vq-danger)]">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
      <p className="text-center text-sm text-[var(--vq-ink-muted)]">
        Need a new link?{" "}
        <Link href="/forgot-password" className="text-[var(--vq-teal)] hover:underline">
          Forgot password
        </Link>
      </p>
    </form>
  );
}
