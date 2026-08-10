"use client";

import Link from "next/link";
import { DemoCreditButton } from "@/components/DemoCreditButton";
import type { Quest } from "@/lib/affiliates";

export function QuestRow({ quest, signedIn }: { quest: Quest; signedIn: boolean }) {
  return (
    <article className="flex flex-col gap-4 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5 transition hover:border-[var(--vq-border-strong)] hover:bg-[var(--vq-surface-hover)] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {quest.featured ? (
            <span className="rounded bg-[var(--vq-teal-glow)] px-2 py-0.5 font-[family-name:var(--vq-font-mono)] text-[10px] uppercase tracking-wider text-[var(--vq-teal)]">
              Featured
            </span>
          ) : null}
          <span className="font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
            {quest.effort} · {quest.timeHint}
          </span>
        </div>
        <h2 className="mt-1 font-[family-name:var(--vq-font-display)] text-lg font-semibold">{quest.title}</h2>
        <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">{quest.description}</p>
        <p className="mt-2 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
          Starts via tracked redirect · S2S postback credits VP
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <p className="font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-teal)]">+{quest.vpReward} VP</p>
        <Link
          href={`/api/go/${quest.id}`}
          className="rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
        >
          Start quest
        </Link>
        {signedIn ? <DemoCreditButton questId={quest.id} /> : null}
      </div>
    </article>
  );
}
