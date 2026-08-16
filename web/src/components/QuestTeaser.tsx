import Link from "next/link";
import { QuestMark } from "@/components/QuestMark";
import type { Quest } from "@/lib/affiliates";

/** Home peek. Next click stays on vaultquest.io — never /api/go from here. */
export function QuestTeaser({ quest }: { quest: Quest }) {
  return (
    <Link
      href="/earn"
      className="flex flex-col rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4 transition hover:border-[var(--vq-border-strong)] hover:bg-[var(--vq-surface-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <QuestMark quest={quest} />
        {quest.hideVpReward ? (
          <span className="font-[family-name:var(--vq-font-mono)] text-[10px] uppercase tracking-wider text-[var(--vq-brass)]">
            Third party
          </span>
        ) : (
          <p className="font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-teal)]">+{quest.vpReward} VP</p>
        )}
      </div>
      <p className="mt-3 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">{quest.timeHint}</p>
      <h3 className="mt-1 font-[family-name:var(--vq-font-display)] text-base font-semibold leading-snug">{quest.title}</h3>
    </Link>
  );
}
