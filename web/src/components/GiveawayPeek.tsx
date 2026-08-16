import Link from "next/link";
import { ROBLOX_GIVEAWAY_PRIZE, ROBLOX_GIVEAWAY_WINDOW_LABEL } from "@/lib/giveaway";

export function GiveawayPeek() {
  return (
    <aside className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/60 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="font-[family-name:var(--vq-font-mono)] text-[10px] uppercase tracking-wider text-[var(--vq-brass)]">
          Same-site giveaway
        </p>
        <p className="mt-1 font-[family-name:var(--vq-font-display)] text-sm font-semibold">
          Roblox gift card giveaway
        </p>
        <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">
          {ROBLOX_GIVEAWAY_PRIZE}. {ROBLOX_GIVEAWAY_WINDOW_LABEL}. We do not publish a running entry count. Gamehag
          (third party) does not count for entries.
        </p>
      </div>
      <Link
        href="/giveaway"
        className="mt-3 inline-flex shrink-0 rounded-md border border-[var(--vq-border-strong)] px-3 py-2 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)] sm:mt-0"
      >
        Open /giveaway
      </Link>
    </aside>
  );
}
