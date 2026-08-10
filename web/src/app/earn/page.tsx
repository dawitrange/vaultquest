import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { QuestRow } from "@/components/QuestRow";
import { QUESTS } from "@/lib/affiliates";

export const metadata: Metadata = {
  title: "Earn",
  description: "Complete partner quests, earn Vault points. Links rotate automatically when networks cap.",
};

export default async function EarnPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Earn</h1>
        <p className="mt-3 text-[var(--vq-ink-muted)]">
          Pick a quest. Partner links are wrapped and rotated if a network hits a cap or goes unhealthy. We may earn when
          you complete offers — that funds the vault.
        </p>
      </header>

      <div className="mt-6 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50 px-4 py-3 text-sm text-[var(--vq-ink-muted)]">
        <strong className="text-[var(--vq-ink)]">Tracked quests:</strong> Start quest creates a click ID and rotates
        partner URLs. Partners verify your completion server-side to credit VP after their hold clears.{" "}
        {signedIn ? (
          <span>
            <strong className="text-[var(--vq-ink)]">Demo: credit VP</strong> still works for local testing — real
            credits need postbacks, not browser pixels.
          </span>
        ) : (
          <span>
            <Link href="/signup" className="text-[var(--vq-teal)] underline decoration-[var(--vq-border-strong)] underline-offset-2 hover:decoration-[var(--vq-teal)]">
              Sign up
            </Link>{" "}
            so clicks attach to your ledger. Guest clicks are tracked but can&apos;t credit without an account.
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">Holds 3–14 days by partner</span>
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">We never ask for Steam passwords</span>
        <Link href="/proof#earnings" className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]">How holds work →</Link>
        <Link href="/rewards" className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]">Rewards catalog →</Link>
      </div>

      {QUESTS.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)]/40 px-6 py-10 text-center">
          <p className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">No quests available right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--vq-ink-muted)]">
            Partners rotate by region and cap. Check back shortly, or review{" "}
            <Link href="/proof" className="text-[var(--vq-teal)] hover:underline">Proof & Rules</Link> for how rotation and S2S verification work. No fake offers are shown to fill this feed.
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {QUESTS.map((quest) => (
            <QuestRow key={quest.id} quest={quest} signedIn={signedIn} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-[var(--vq-ink-faint)]">
        Disclosure: some quest links are affiliate/partner links — we may earn when you verify. That funds the vault.{" "}
        <Link href="/proof#disclosure" className="text-[var(--vq-ink-muted)] hover:text-[var(--vq-teal)] hover:underline">Full disclosure →</Link>
      </p>
    </div>
  );
}
