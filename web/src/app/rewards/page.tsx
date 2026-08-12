import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { RedeemButton } from "@/components/RedeemButton";
import { getBalance } from "@/lib/ledger";
import { REWARD_GUIDES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Redeem Vault points for Steam credit. Manual vault fulfillment in MVP.",
  alternates: { canonical: "/rewards" },
};

const CATALOG = [
  { id: "steam-5", label: "Steam Wallet $5", costVp: SITE.minRedeemUsd * SITE.vpPerUsd, eta: "24–48h" },
  { id: "steam-10", label: "Steam Wallet $10", costVp: 10 * SITE.vpPerUsd, eta: "24–48h" },
  { id: "steam-20", label: "Steam Wallet $20", costVp: 20 * SITE.vpPerUsd, eta: "24–48h" },
];

export default async function RewardsPage() {
  const session = await auth();
  const balance = session?.user?.id
    ? await getBalance(session.user.id)
    : { available: 0, pending: 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Rewards</h1>
        <p className="mt-3 text-[var(--vq-ink-muted)]">
          Redeem your Vault points for Steam credit. Cash out from about ${SITE.minRedeemUsd} — we send your code to
          your VaultQuest account, usually within 24–48 hours.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50 px-4 py-4">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">Available VP</p>
            <p className="font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-teal)]">{balance.available}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">Pending VP</p>
            <p className="font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-warn)]">{balance.pending}</p>
          </div>
        </div>
        {!session?.user ? (
          <Link href="/login" className="text-sm text-[var(--vq-teal)] hover:underline">
            Sign in to redeem →
          </Link>
        ) : (
          <Link href="/account" className="text-sm text-[var(--vq-teal)] hover:underline">
            View ledger →
          </Link>
        )}
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {CATALOG.map((item) => {
          const canRedeem = Boolean(session?.user) && balance.available >= item.costVp;
          return (
            <li
              key={item.id}
              className="flex flex-col rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5"
            >
              <h2 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">{item.label}</h2>
              <p className="mt-2 font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-teal)]">{item.costVp} VP</p>
              <p className="mt-1 text-xs text-[var(--vq-ink-faint)]">Code to your account · usually {item.eta}</p>
              {session?.user ? (
                <RedeemButton sku={item.id} disabled={!canRedeem} />
              ) : (
                <Link
                  href="/login"
                  className="mt-6 block rounded-md border border-[var(--vq-border)] px-3 py-2 text-center text-sm text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/30 hover:text-[var(--vq-ink)]"
                >
                  Sign in to unlock
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-lg border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/40 px-4 py-3 text-xs text-[var(--vq-ink-muted)]">
        Codes are delivered to your VaultQuest account — we&apos;ll never ask for your Steam password. See{" "}
        <Link href="/proof#winners" className="text-[var(--vq-teal)] hover:underline">how redemptions are listed</Link>.
      </div>

      <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
        Need points first?{" "}
        <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
          Browse earn quests
        </Link>
        {" "}· <Link href="/how-it-works" className="text-[var(--vq-teal)] hover:underline">How it works</Link>
      </p>

      <section className="mt-14 border-t border-[var(--vq-border)] pt-10">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold tracking-tight">
          Reward guides
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--vq-ink-muted)]">
          Honest pages for common searches. Live redeem catalog above is Steam-first — guides that say “not live yet”
          mean exactly that.
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {REWARD_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/rewards/${g.slug}`}
                className="flex items-center justify-between rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50 px-4 py-3 text-sm text-[var(--vq-ink)] hover:border-[var(--vq-teal)]/40"
              >
                <span>{g.title}</span>
                <span className="text-[var(--vq-teal)]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
