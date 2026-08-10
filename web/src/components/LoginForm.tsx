"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

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
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-[var(--vq-ink-muted)]">
        No account?{" "}
        <Link href="/signup" className="text-[var(--vq-teal)] hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
