"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function SignupForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(signupAction, initial);

  return (
    <form action={action} className="mt-8 space-y-4">
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Name</span>
        <input
          name="name"
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
        />
      </label>
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
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-[var(--vq-ink-muted)]">
        <input name="ageConfirmed" type="checkbox" required className="mt-1" />
        <span>I confirm I am 16+ (or 18+ where partner offers require it) and accept the Proof & Rules.</span>
      </label>
      {state.error ? <p className="text-sm text-[var(--vq-danger)]">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-[var(--vq-ink-muted)]">
        Already have an account?{" "}
        <Link
          href={from ? `/login?from=${encodeURIComponent(from)}` : "/login"}
          className="text-[var(--vq-teal)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
