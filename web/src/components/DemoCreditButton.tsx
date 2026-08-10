"use client";

import { useActionState } from "react";
import { demoCompleteQuestAction, type ActionState } from "@/lib/actions/ledger";

const initial: ActionState = {};

export function DemoCreditButton({ questId }: { questId: string }) {
  const [state, action, pending] = useActionState(demoCompleteQuestAction, initial);

  return (
    <form action={action} className="flex flex-col items-stretch gap-1 sm:items-end">
      <input type="hidden" name="questId" value={questId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--vq-border-strong)] px-3 py-2 text-xs font-medium text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)] disabled:opacity-60"
      >
        {pending ? "Crediting…" : "Demo: credit VP"}
      </button>
      {state.error ? <p className="text-xs text-[var(--vq-danger)]">{state.error}</p> : null}
      {state.message ? <p className="max-w-[14rem] text-right text-xs text-[var(--vq-success)]">{state.message}</p> : null}
    </form>
  );
}
