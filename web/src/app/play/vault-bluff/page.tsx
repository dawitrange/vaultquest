import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { VaultBluffGame } from "@/components/play/VaultBluffGame";
import { listServableQuests } from "@/lib/affiliates";
import { getPlayProgress } from "@/lib/vault-bluff/service";

export const metadata: Metadata = {
  title: "Vault Bluff",
  description: "A four-round structured bluff game against a VaultQuest bot.",
  robots: { index: false, follow: false },
};

export default async function VaultBluffPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=play");

  const progress = await getPlayProgress(session.user.id);
  const earnQuest =
    progress.completedMatches >= 3
      ? (await listServableQuests()).find((quest) => quest.id === "q-surveys") ?? null
      : null;

  return (
    <VaultBluffGame
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
  );
}
