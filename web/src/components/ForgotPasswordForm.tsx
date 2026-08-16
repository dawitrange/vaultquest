"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
        />
      </label>
      {state.error ? <p className="text-sm text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-[var(--vq-ink-muted)]">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-[var(--vq-ink-muted)]">
        Remembered it?{" "}
        <Link href="/login" className="text-[var(--vq-teal)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
