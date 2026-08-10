"use client";

import { useActionState } from "react";
import { contactAction, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = {};

export function ContactForm({ defaultEmail, defaultName }: { defaultEmail?: string; defaultName?: string }) {
  const [state, action, pending] = useActionState(contactAction, initial);

  return (
    <form action={action} className="mt-10 space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Name</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)]"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Email</span>
        <input
          type="email"
          name="email"
          required
          defaultValue={defaultEmail}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)]"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[var(--vq-ink-muted)]">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          minLength={10}
          className="mt-1 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2 text-[var(--vq-ink)]"
          placeholder="Account, redeem, or giveaway question — never share Steam passwords"
        />
      </label>
      {state.error ? <p className="text-sm text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-[var(--vq-success)]">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
