import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { QuestRow } from "@/components/QuestRow";
import { isDemoCreditEnabled } from "@/lib/actions/ledger";
import { getServableCategories, isSlugServable, QUESTS } from "@/lib/affiliates";
import { GO_SIGN_IN_PATH } from "@/lib/postback";

export const metadata: Metadata = {
  title: "Earn",
  description:
    "Quests pay Vault Points. Vault Points cash out to Steam credit. Browse the catalog before you sign up.",
};

export default async function EarnPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error === "sign_in") {
    redirect(GO_SIGN_IN_PATH);
  }

  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const [servable, demoEnabled] = await Promise.all([getServableCategories(), isDemoCreditEnabled()]);
  const pinned = [...new Set(QUESTS.map((q) => q.pinSlug).filter((slug): slug is string => Boolean(slug)))];
  const pinnedServable = new Set(
    (await Promise.all(pinned.map(async (slug) => ((await isSlugServable(slug)) ? slug : null)))).filter(
      (slug): slug is string => Boolean(slug),
    ),
  );
  const quests = QUESTS.map((quest) => ({
    quest,
    available: quest.pinSlug ? pinnedServable.has(quest.pinSlug) : servable.has(quest.category),
  }));
  const anyAvailable = quests.some((q) => q.available);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--vq-teal)]">
          Public catalog
        </p>
        <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Earn</h1>
        <p className="mt-3 text-[var(--vq-ink-muted)]">
          Quests → Vault Points → Steam credit. That is the grind. Surveys, partner signups, and play offers take
          real time. Points start pending and sit 3–14 days. Read the list before you make an account. Hopping a
          quest still needs a session.
        </p>
        {signedIn ? (
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            Your account is ready. Stay on this page and start a quest. That is how Vault Points show up. Gamehag is
            a third-party hop, not the next step.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            <Link
              href="/signup?from=earn"
              className="text-[var(--vq-teal)] underline decoration-[var(--vq-border-strong)] underline-offset-2 hover:decoration-[var(--vq-teal)]"
            >
              Sign up
            </Link>{" "}
            so a finished quest credits your account. After that, stay here and pick a quest. Do not leave for a
            third-party site as your first move.
          </p>
        )}
        {params.error === "no_link" ? (
          <p className="mt-3 text-sm text-[var(--vq-ink-muted)]">
            That quest isn&apos;t available right now. Pick another, or try again later.
          </p>
        ) : null}
      </header>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          Points post after a 3–14 day hold
        </span>
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          18+ on partner walls
        </span>
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          Free to join
        </span>
        <Link
          href="/giveaway"
          className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
        >
          Roblox giveaway →
        </Link>
        <Link
          href="/proof#earnings"
          className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
        >
          How tracking works →
        </Link>
        <Link
          href="/rewards"
          className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
        >
          Rewards catalog →
        </Link>
      </div>

      <article className="mt-10 max-w-2xl rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-brass)]">
          Same-site giveaway
        </p>
        <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-lg font-semibold">
          Roblox gift card giveaway
        </h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          Five $25 Roblox gift cards. Enter on this site at{" "}
          <Link href="/giveaway" className="text-[var(--vq-teal)] hover:underline">
            /giveaway
          </Link>
          . Rules and the form live there. We do not publish a running entry count.
        </p>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          Window: August 17, 2026 12:00 AM to September 1, 2026 11:59 PM, America/New_York. After you have an
          account, come back here and do a quest.
        </p>
        <Link
          href="/giveaway"
          className="mt-4 inline-flex rounded-md bg-[var(--vq-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
        >
          Open /giveaway
        </Link>
      </article>

      {!anyAvailable ? (
        <div className="mt-10 rounded-xl border border-dashed border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)]/40 px-6 py-10 text-center">
          <p className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">No quests available right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--vq-ink-muted)]">
            We only show a quest once a partner network is live and verified for your region. No dead links or fake
            offers to fill this feed. New quests appear here as networks come online. Meanwhile, see{" "}
            <Link href="/proof" className="text-[var(--vq-teal)] hover:underline">
              Proof & Rules
            </Link>{" "}
            for how rotation and S2S verification work.
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {quests.map(({ quest, available }) => (
            <QuestRow key={quest.id} quest={quest} signedIn={signedIn} available={available} demoEnabled={demoEnabled} />
          ))}
        </div>
      )}

      <section className="mt-10 max-w-2xl space-y-2 text-sm text-[var(--vq-ink-muted)]">
        <h2 className="font-[family-name:var(--vq-font-display)] text-base font-semibold text-[var(--vq-ink)]">
          Before you click
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>VaultQuest path: quest → pending VP → Steam. Not instant, not a generator.</li>
          <li>We don&apos;t control partner walls. Pending can take days.</li>
          <li>18+ where the partner requires it. Gamehag (third party) is their site and does not pay Vault Points.</li>
        </ul>
      </section>

      <p className="mt-8 text-xs text-[var(--vq-ink-faint)]">
        Some quests are partner links. We earn a commission when you complete them, which funds your rewards.{" "}
        <Link href="/proof#disclosure" className="text-[var(--vq-ink-muted)] hover:text-[var(--vq-teal)] hover:underline">
          Full disclosure →
        </Link>
      </p>
    </div>
  );
}
