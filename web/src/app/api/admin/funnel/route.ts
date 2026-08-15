import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { exactFraction, funnel } from "@/lib/analytics";

/** Admin JSON for postback-smoke / last-7d quotes. Never includes secrets. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const stats = await funnel(7);
  return NextResponse.json({
    ok: true,
    days: stats.days,
    since: stats.since.toISOString(),
    offerClicks: stats.offerClicks,
    earnCredits: stats.earnCredits,
    pendingEarnCredits: stats.pendingEarnCredits,
    s2sEarnCredits: stats.s2sEarnCredits,
    redemptions: stats.redemptions,
    clickToEarn: exactFraction(stats.earnCredits, stats.offerClicks),
    earnToRedeem: exactFraction(stats.redemptions, stats.earnCredits),
  });
}
