"use client";

import Link from "next/link";
import { DemoCreditButton } from "@/components/DemoCreditButton";
import { QuestMark } from "@/components/QuestMark";
import type { Quest } from "@/lib/affiliates";

export function QuestTile({
  quest,
  signedIn,
  demoEnabled = false,
}: {
  quest: Quest;
  signedIn: boolean;
  demoEnabled?: boolean;
}) {
  const thirdParty = Boolean(quest.hideVpReward);
  const status = thirdParty ? "Third party" : "Available";
  const cta = quest.ctaLabel ?? "Start quest";

  return (
    <article className="flex flex-col rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4 transition hover:border-[var(--vq-border-strong)] hover:bg-[var(--vq-surface-hover)]">
      <div className="flex items-start justify-between gap-3">
        <QuestMark quest={quest} />
        {thirdParty ? null : (
          <p className="font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-teal)]">+{quest.vpReward} VP</p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {quest.featured ? (
          <span className="rounded bg-[var(--vq-teal-glow)] px-2 py-0.5 font-[family-name:var(--vq-font-mono)] text-[10px] uppercase tracking-wider text-[var(--vq-teal)]">
            Featured
          </span>
        ) : null}
        <span className="font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
          {quest.effort} · {quest.timeHint}
        </span>
      </div>
      <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-lg font-semibold leading-snug">{quest.title}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--vq-ink-muted)]">{quest.description}</p>
      <p className="mt-3 font-[family-name:var(--vq-font-mono)] text-[11px] uppercase tracking-wider text-[var(--vq-ink-faint)]">
        {status}
      </p>
      <div className="mt-auto flex flex-col gap-2 pt-3">
        {quest.openInNewTab ? (
          <a
            href={`/api/go/${quest.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
          >
            {cta}
          </a>
        ) : (
          <Link
            href={`/api/go/${quest.id}`}
            className="rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
          >
            {cta}
          </Link>
        )}
        {signedIn && demoEnabled && !thirdParty ? <DemoCreditButton questId={quest.id} /> : null}
      </div>
    </article>
  );
}
