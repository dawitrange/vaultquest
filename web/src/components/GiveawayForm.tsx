"use client";

import Link from "next/link";
import { useActionState } from "react";
import { enterGiveawayAction, type GiveawayFormState } from "@/lib/actions/giveaway";

const initial: GiveawayFormState = {};

export function GiveawayForm({
  signedIn,
  defaultName,
  defaultEmail,
  disabled,
  disabledReason,
}: {
  signedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const [state, action, pending] = useActionState(enterGiveawayAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Name</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          disabled={disabled}
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)] disabled:opacity-50"
        />
      </label>
      {signedIn ? (
        <p className="text-sm text-[var(--vq-ink-muted)]">
          Entering as <span className="text-[var(--vq-ink)]">{defaultEmail}</span>. Same account as /earn.
        </p>
      ) : (
        <>
          <label className="block text-sm">
            <span className="text-[var(--vq-ink-muted)]">Email</span>
            <input
              type="email"
              name="email"
              required
              defaultValue={defaultEmail}
              disabled={disabled}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--vq-ink-muted)]">Password</span>
            <input
              type="password"
              name="password"
              required
              disabled={disabled}
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)] disabled:opacity-50"
            />
            <span className="mt-1 block text-xs text-[var(--vq-ink-faint)]">
              Creates a VaultQuest account so you do not type this email twice on /earn.
            </span>
          </label>
        </>
      )}
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Why you should get it</span>
        <textarea
          name="reason"
          required
          rows={4}
          minLength={8}
          maxLength={500}
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)] disabled:opacity-50"
          placeholder="Short note. We read these. We do not pick winners from vibes alone."
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-[var(--vq-ink-muted)]">
        <input name="ageConfirmed" type="checkbox" required disabled={disabled} className="mt-1" />
        <span>I am 18 or older. No purchase necessary. Void where prohibited.</span>
      </label>
      {disabled && disabledReason ? <p className="text-sm text-[var(--vq-ink-muted)]">{disabledReason}</p> : null}
      {state.error ? <p className="text-sm text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-[var(--vq-success)]">{state.message}</p> : null}
      <button
        type="submit"
        disabled={disabled || pending}
        className="rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60"
      >
        {pending ? "Saving…" : signedIn ? "Enter giveaway" : "Create account and enter"}
      </button>
      {signedIn ? null : (
        <p className="text-sm text-[var(--vq-ink-muted)]">
          Already have an account?{" "}
          <Link href="/login?from=giveaway" className="text-[var(--vq-teal)] hover:underline">
            Sign in
          </Link>
          , then come back here.
        </p>
      )}
    </form>
  );
}
