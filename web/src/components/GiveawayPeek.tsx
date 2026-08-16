import Link from "next/link";
import { ROBLOX_GIVEAWAY_PRIZE } from "@/lib/giveaway";

export function GiveawayPeek() {
  return (
    <aside className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/60 px-4 py-3">
      <p className="text-sm text-[var(--vq-ink)]">
        <span className="font-[family-name:var(--vq-font-display)] font-semibold">{ROBLOX_GIVEAWAY_PRIZE}</span>
        <span className="text-[var(--vq-ink-muted)]"> · Aug 17–Sep 1, 2026</span>
      </p>
      <Link
        href="/giveaway"
        className="inline-flex shrink-0 rounded-md border border-[var(--vq-border-strong)] px-3 py-2 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
      >
        Open /giveaway
      </Link>
    </aside>
  );
}
