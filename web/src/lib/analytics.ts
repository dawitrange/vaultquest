import { LedgerKind, LedgerStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type FunnelStats = {
  days: number;
  since: Date;
  offerClicks: number;
  earnCredits: number;
  pendingEarnCredits: number;
  s2sEarnCredits: number;
  redemptions: number;
  clickToEarnRate: number | null;
  earnToRedeemRate: number | null;
};

/**
 * Funnel scaffold for analytics dashboard.
 * Counts OfferClick, LedgerEntry(EARN), and Redemption in the last `days`.
 * Rates are exact fractions (earn/clicks, redeem/earn) — callers must not round up.
 * Wire to Datadog/metrics when MCP is provisioned.
 */
export async function funnel(days = 7): Promise<FunnelStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const earnSince = { kind: LedgerKind.EARN, createdAt: { gte: since } };

  const [offerClicks, earnCredits, pendingEarnCredits, s2sEarnCredits, redemptions] = await Promise.all([
    prisma.offerClick.count({ where: { createdAt: { gte: since } } }),
    prisma.ledgerEntry.count({ where: earnSince }),
    prisma.ledgerEntry.count({
      where: { ...earnSince, status: LedgerStatus.PENDING },
    }),
    prisma.ledgerEntry.count({
      where: { ...earnSince, note: { startsWith: "S2S postback" } },
    }),
    prisma.redemption.count({ where: { createdAt: { gte: since } } }),
  ]);

  return {
    days,
    since,
    offerClicks,
    earnCredits,
    pendingEarnCredits,
    s2sEarnCredits,
    redemptions,
    clickToEarnRate: offerClicks > 0 ? earnCredits / offerClicks : null,
    earnToRedeemRate: earnCredits > 0 ? redemptions / earnCredits : null,
  };
}

/** Exact fraction for admin — never Math.round up a conversion rate. */
export function exactFraction(num: number, den: number): string {
  if (den <= 0) return "—";
  return `${num} / ${den}`;
}
