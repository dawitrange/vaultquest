import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getBalance } from "@/lib/ledger";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";
import { getPlayProgress } from "@/lib/vault-bluff/service";
import { nextRank } from "@/lib/vault-bluff/progress";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Play Vault Bluff against a clearly labeled VaultQuest bot. Earn XP for completed matches. Verified quests remain the main VP source.",
  alternates: { canonical: "/play" },
};

export default async function PlayPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const [balance, progress] = session?.user?.id
    ? await Promise.all([
        getBalance(session.user.id),
        getPlayProgress(session.user.id),
        captureServerEvent(session.user.id, PH_EVENTS.game_hub_viewed, {
          engine_version: "vault-bluff-engine-v1",
          policy_version: "vault-bluff-policy-v1",
        }),
      ]).then(([userBalance, userProgress]) => [userBalance, userProgress])
    : [
        { available: 0, pending: 0 },
        {
          completedMatches: 0,
          totalXp: 0,
          rank: "Scout",
          cosmetic: "Brass Starter Case",
          promoVp30Days: 0,
          rewardedToday: false,
          rewardsEnabled: false,
        },
      ];
  const rankProgress = nextRank(progress.totalXp);
  const rankPercent =
    rankProgress.nextTarget === rankProgress.currentFloor
      ? 100
      : Math.min(
          100,
          ((progress.totalXp - rankProgress.currentFloor) /
            (rankProgress.nextTarget - rankProgress.currentFloor)) *
            100,
        );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-3xl">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--vq-brass)]">
          Play lab
        </p>
        <h1 className="mt-3 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Read the tell. Protect the key.
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--vq-ink-muted)]">
          Vault Bluff is a four-round game against a clearly labeled VaultQuest bot.
          The hidden key decides the round only. Completed matches build XP, rank,
          and cosmetics.
        </p>
      </header>

      <section aria-label="Vault balances and game progress" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Available VP", balance.available, "var(--vq-teal)"],
          ["Pending VP", balance.pending, "var(--vq-warn)"],
          ["Vault Bluff XP", progress.totalXp, "var(--vq-brass)"],
          ["Completed matches", progress.completedMatches, "var(--vq-ink)"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">{label}</p>
            <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-2xl" style={{ color: String(color) }}>
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <article className="relative overflow-hidden rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-6 sm:p-8">
          <div className="absolute right-5 top-4 font-[family-name:var(--vq-font-display)] text-6xl text-[var(--vq-brass)]/20" aria-hidden="true">
            ◆
          </div>
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
            Featured game
          </p>
          <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-3xl font-bold">
            Vault Bluff
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[var(--vq-ink-muted)]">
            Inspect your case or question the bot. Ask two structured questions,
            then keep your case or take theirs. Four rounds. Ties allowed.
          </p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            <li>Bot opponent is always labeled</li>
            <li>No free text or hidden rule changes</li>
            <li>Performance changes XP only</li>
            <li>Refresh restores the active match</li>
          </ul>
          <Link
            href={signedIn ? "/play/vault-bluff" : "/login?from=play"}
            className="mt-7 inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
          >
            {signedIn ? "Enter Vault Bluff" : "Sign in to play"}
          </Link>
        </article>

        <div className="space-y-5">
          <article className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
            <h2 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">
              Daily promotional VP
            </h2>
            <p className="mt-2 font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-teal)]">
              {progress.promoVp30Days} / 30 VP
            </p>
            <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
              {progress.rewardsEnabled
                ? progress.rewardedToday
                  ? "Today's eligible grant is already recorded."
                  : "First eligible completion may grant 1 pending VP."
                : "Promotional VP is disabled until a funded reserve and kill switch are configured."}
            </p>
          </article>
          <article className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">
                {progress.rank}
              </h2>
              <span className="text-xs text-[var(--vq-brass)]">{progress.cosmetic}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--vq-bg-sunken)]">
              <div className="h-full bg-[var(--vq-brass)]" style={{ width: `${rankPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
              {progress.totalXp >= 2_000
                ? "Top V1 rank reached."
                : `${rankProgress.nextTarget - progress.totalXp} XP to ${rankProgress.nextRank}.`}
            </p>
          </article>
        </div>
      </section>

      <aside className="mt-6 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50 px-5 py-4 text-sm text-[var(--vq-ink-muted)]">
        Verified partner quests remain the main source of VP. Vault Bluff never pays
        VP for winning, losing, clicking, starting, refreshing, or forfeiting.{" "}
        <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
          See verified quests
        </Link>
      </aside>
    </div>
  );
}
