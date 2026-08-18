import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FaceoffQuestsTab } from "@/components/play/FaceoffQuestsTab";
import { VaultBluffGame } from "@/components/play/VaultBluffGame";
import { getRotatedEarnRecommendation } from "@/lib/affiliates";
import { isVaultBluffFaceoffEnabled } from "@/lib/vault-bluff/faceoff-presentation";
import { getPlayProgress } from "@/lib/vault-bluff/service";

export const metadata: Metadata = {
  title: "Vault Bluff",
  description: "A four-round structured bluff game against a VaultQuest bot.",
  robots: { index: false, follow: false },
};

export default async function VaultBluffPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=play");
  const faceoffEnabled = isVaultBluffFaceoffEnabled(
    process.env.VAULT_BLUFF_FACEOFF_UI,
  );

  const progress = await getPlayProgress(session.user.id);
  if (!progress.schemaReady) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <section className="rounded-[12px] border border-[var(--vq-warn)]/50 bg-[var(--vq-bg-raised)] p-6 sm:p-8">
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-warn)]">
            Temporarily unavailable
          </p>
          <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-3xl font-bold">
            Vault Bluff is safely unavailable
          </h1>
          <p className="mt-3 text-[var(--vq-ink-muted)]">
            Vault Bluff cannot start right now. Try again later.
          </p>
          <p className="mt-3 text-sm text-[var(--vq-ink-faint)]">
            No game session or promotional VP was created.
          </p>
          <Link
            href="/play"
            className="mt-6 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
          >
            Back to Play
          </Link>
        </section>
      </div>
    );
  }
  const earnQuest =
    progress.completedMatches >= 3
      ? await getRotatedEarnRecommendation({
          userId: session.user.id,
          rotationOffset: progress.completedMatches,
        })
      : null;

  return (
    <>
      {faceoffEnabled ? (
        <FaceoffQuestsTab />
      ) : null}
      <VaultBluffGame
        faceoffEnabled={faceoffEnabled}
        completedMatches={progress.completedMatches}
        initialTotalXp={progress.totalXp}
        earnQuest={
          earnQuest
            ? {
                id: earnQuest.id,
                title: earnQuest.title,
                vpReward: earnQuest.vpReward,
                effort: earnQuest.effort,
                timeHint: earnQuest.timeHint,
                holdDays: earnQuest.holdDays ?? 3,
              }
            : null
        }
      />
    </>
  );
}
