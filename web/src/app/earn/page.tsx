import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GiveawayPeek } from "@/components/GiveawayPeek";
import { QuestTile } from "@/components/QuestTile";
import { isDemoCreditEnabled } from "@/lib/actions/ledger";
import { listServableQuests } from "@/lib/affiliates";
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
  const [quests, demoEnabled] = await Promise.all([listServableQuests(), isDemoCreditEnabled()]);
  const anyAvailable = quests.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--vq-teal)]">
          Public catalog
        </p>
        <h1 className="mt-1 font-[family-name:var(--vq-font-display)] text-3xl font-bold tracking-tight sm:text-4xl">Earn</h1>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)] sm:text-base">
          Quests → Vault Points → Steam credit. Points start pending and sit 3–14 days. Read the list before you make
          an account. Hopping a quest still needs a session.
        </p>
        {signedIn ? (
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            Stay on this page and start a quest. Gamehag is a third-party hop, not the next step.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            <Link
              href="/signup?from=earn"
              className="text-[var(--vq-teal)] underline decoration-[var(--vq-border-strong)] underline-offset-2 hover:decoration-[var(--vq-teal)]"
            >
              Sign up
            </Link>{" "}
            so a finished quest credits your account. Stay here for the next click.
          </p>
        )}
        {params.error === "no_link" ? (
          <p className="mt-3 text-sm text-[var(--vq-ink-muted)]">
            That quest isn&apos;t available right now. Pick another, or try again later.
          </p>
        ) : null}
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          Pending 3–14 days
        </span>
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          18+ on partner walls
        </span>
        <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-faint)]">
          Tracked redirect · S2S
        </span>
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

      {!anyAvailable ? (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)]/40 px-6 py-10 text-center">
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quests.map((quest) => (
            <QuestTile key={quest.id} quest={quest} signedIn={signedIn} demoEnabled={demoEnabled} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <GiveawayPeek />
      </div>

      <section className="mt-8 max-w-2xl space-y-2 text-sm text-[var(--vq-ink-muted)]">
        <h2 className="font-[family-name:var(--vq-font-display)] text-base font-semibold text-[var(--vq-ink)]">
          Before you click
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tracked redirect. S2S postback credits pending VP. Hold is 3–14 days. 18+ where the partner requires it.</li>
          <li>VaultQuest path: quest → pending VP → Steam. Not instant, not a generator.</li>
          <li>Gamehag (third party) is their site and does not pay Vault Points.</li>
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
