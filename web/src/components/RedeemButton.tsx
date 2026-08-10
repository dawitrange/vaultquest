"use client";

import { useActionState } from "react";
import { redeemAction, type ActionState } from "@/lib/actions/ledger";

const initial: ActionState = {};

export function RedeemButton({ sku, disabled }: { sku: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(redeemAction, initial);

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="sku" value={sku} />
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded-md bg-[var(--vq-teal)] px-3 py-2 text-sm font-semibold text-[var(--vq-bg-deep)] disabled:cursor-not-allowed disabled:border disabled:border-[var(--vq-border)] disabled:bg-transparent disabled:text-[var(--vq-ink-faint)]"
      >
        {pending ? "Unlocking…" : disabled ? "Need more VP" : "Unlock from vault"}
      </button>
      {state.error ? <p className="mt-2 text-xs text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="mt-2 text-xs text-[var(--vq-success)]">{state.message}</p> : null}
    </form>
  );
}
