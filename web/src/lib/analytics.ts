import { prisma } from "@/lib/db";
import { LedgerKind } from "@prisma/client";

export type FunnelStats = {
  days: number;
  since: Date;
  offerClicks: number;
  earnCredits: number;
  redemptions: number;
  clickToEarnRate: number | null;
  earnToRedeemRate: number | null;
};

/**
 * Funnel scaffold for analytics dashboard.
 * Counts OfferClick, LedgerEntry(EARN), and Redemption in the last `days`.
 * Wire to Datadog/metrics when MCP is provisioned.
 */
export async function funnel(days = 7): Promise<FunnelStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [offerClicks, earnCredits, redemptions] = await Promise.all([
    prisma.offerClick.count({ where: { createdAt: { gte: since } } }),
    prisma.ledgerEntry.count({
      where: { kind: LedgerKind.EARN, createdAt: { gte: since } },
    }),
    prisma.redemption.count({ where: { createdAt: { gte: since } } }),
  ]);

  return {
    days,
    since,
    offerClicks,
    earnCredits,
    redemptions,
    clickToEarnRate: offerClicks > 0 ? earnCredits / offerClicks : null,
    earnToRedeemRate: earnCredits > 0 ? redemptions / earnCredits : null,
  };
}
