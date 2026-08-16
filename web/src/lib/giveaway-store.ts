import { LedgerKind, LedgerStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  ROBLOX_GIVEAWAY_CLOSES_AT,
  ROBLOX_GIVEAWAY_OPENS_AT,
  ROBLOX_GIVEAWAY_SLUG,
  countExtraEntriesFromRows,
  tallyFromParts,
  type GiveawayTally,
} from "@/lib/giveaway";

export async function countCompletedQuestsInWindow(userId: string): Promise<number> {
  const rows = await prisma.ledgerEntry.findMany({
    where: {
      userId,
      kind: LedgerKind.EARN,
      status: { in: [LedgerStatus.PENDING, LedgerStatus.POSTED] },
      createdAt: {
        gte: ROBLOX_GIVEAWAY_OPENS_AT,
        lt: ROBLOX_GIVEAWAY_CLOSES_AT,
      },
    },
    select: { kind: true, status: true, createdAt: true, questId: true },
  });
  return countExtraEntriesFromRows(rows);
}

export async function getGiveawayTally(userId: string): Promise<GiveawayTally> {
  const [entry, extraEntries] = await Promise.all([
    prisma.giveawayEntry.findUnique({
      where: {
        campaignSlug_userId: { campaignSlug: ROBLOX_GIVEAWAY_SLUG, userId },
      },
      select: { id: true },
    }),
    countCompletedQuestsInWindow(userId),
  ]);
  return tallyFromParts(Boolean(entry), extraEntries);
}
