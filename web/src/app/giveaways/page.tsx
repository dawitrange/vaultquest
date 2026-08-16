import type { Metadata } from "next";
import Link from "next/link";
import { ROBLOX_GIVEAWAY_PRIZE, ROBLOX_GIVEAWAY_WINDOW_LABEL, giveawayPhase } from "@/lib/giveaway";

export const metadata: Metadata = {
  title: "Giveaways",
  description: "Fair, scheduled VaultQuest giveaways with published rules and public winners.",
};

export default function GiveawaysPage() {
  const phase = giveawayPhase();
  const status =
    phase === "open" ? "Open" : phase === "upcoming" ? "Opens August 17" : "Closed";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Giveaways</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Scheduled, rules published, winners posted. Funded as trust/growth, not everyone gets a free code.
      </p>

      <article className="mt-10 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-6">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-brass)]">
          {status}
        </p>
        <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-2xl font-semibold">
          Roblox gift card giveaway
        </h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          Prize: {ROBLOX_GIVEAWAY_PRIZE}. Window: {ROBLOX_GIVEAWAY_WINDOW_LABEL}. Traffic URL is{" "}
          <Link href="/giveaway" className="text-[var(--vq-teal)] hover:underline">
            /giveaway
          </Link>
          .
        </p>
        <Link
          href="/giveaway"
          className="mt-6 inline-flex rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)]"
        >
          Open /giveaway
        </Link>
      </article>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Past winners</h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-faint)]">No winners yet. This updates after the first draw.</p>
      </section>

      <Link href="/proof" className="mt-8 inline-block text-sm text-[var(--vq-teal)] hover:underline">
        Read Proof & Rules →
      </Link>
    </div>
  );
}
