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
      <header>
        <h1 className="font-[family-name:var(--vq-font-display)] text-3xl font-bold tracking-tight sm:text-4xl">Earn</h1>
        <p className="mt-1 text-[var(--vq-ink-muted)]">Quests → Vault Points → Steam.</p>
      </header>

      {params.error === "no_link" ? (
        <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">That quest isn&apos;t available. Pick another.</p>
      ) : null}

      {!anyAvailable ? (
        <p className="mt-8 text-sm text-[var(--vq-ink-muted)]">No quests to show right now.</p>
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

      <p className="mt-6 text-sm text-[var(--vq-ink-muted)]">
        Before you click: pending 3–14 days · 18+ · S2S · Gamehag (third party) does not pay VP.
      </p>
    </div>
  );
}
