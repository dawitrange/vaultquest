import {
  GameRewardStatus,
  LedgerKind,
  LedgerStatus,
  type Prisma,
} from "@prisma/client";
import { VAULT_BLUFF_REWARD_POLICY_VERSION } from "./types";

const PROMO_VP = 1;
const ROLLING_LIMIT_VP = 30;
const HOLD_MS = 24 * 60 * 60 * 1000;

function utcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function positiveInteger(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export type GameRewardResult =
  | { kind: "granted"; vp: number; availableAt: Date }
  | { kind: "blocked"; reason: string };

export async function grantGamePromoInTransaction(args: {
  tx: Prisma.TransactionClient;
  userId: string;
  sessionId: string;
  now: Date;
}): Promise<GameRewardResult> {
  const rewardPeriod = utcDay(args.now);
  const existing = await args.tx.gameRewardGrant.findUnique({
    where: { userId_rewardPeriod: { userId: args.userId, rewardPeriod } },
  });
  if (existing) return { kind: "blocked", reason: "daily_grant_exists" };

  const enabled = process.env.VAULT_BLUFF_REWARDS_ENABLED === "true";
  const fundingCampaign = process.env.VAULT_BLUFF_FUNDING_CAMPAIGN?.trim();
  const reserveVp = positiveInteger(process.env.VAULT_BLUFF_RESERVE_VP);
  let blockReason: string | null = null;
  if (!enabled) blockReason = "feature_disabled";
  else if (!fundingCampaign || reserveVp == null) blockReason = "reserve_not_configured";

  const rollingStart = new Date(args.now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const userRolling = await args.tx.gameRewardGrant.aggregate({
    where: {
      userId: args.userId,
      status: GameRewardStatus.PENDING,
      createdAt: { gte: rollingStart },
    },
    _sum: { vp: true },
  });
  if ((userRolling._sum.vp ?? 0) + PROMO_VP > ROLLING_LIMIT_VP) {
    blockReason = "rolling_cap_reached";
  }

  if (!blockReason && reserveVp != null) {
    const funded = await args.tx.gameRewardGrant.aggregate({
      where: {
        status: GameRewardStatus.PENDING,
        fundingCampaign,
      },
      _sum: { vp: true },
    });
    if ((funded._sum.vp ?? 0) + PROMO_VP > reserveVp) {
      blockReason = "funding_cap_reached";
    }
  }

  if (blockReason) {
    await args.tx.gameRewardGrant.create({
      data: {
        userId: args.userId,
        sessionId: args.sessionId,
        rewardPeriod,
        vp: 0,
        status: GameRewardStatus.BLOCKED,
        blockReason,
        rewardPolicyVersion: VAULT_BLUFF_REWARD_POLICY_VERSION,
        fundingCampaign: fundingCampaign || null,
      },
    });
    return { kind: "blocked", reason: blockReason };
  }

  const availableAt = new Date(args.now.getTime() + HOLD_MS);
  const ledger = await args.tx.ledgerEntry.create({
    data: {
      userId: args.userId,
      vp: PROMO_VP,
      kind: LedgerKind.EARN,
      status: LedgerStatus.PENDING,
      availableAt,
      gameSessionId: args.sessionId,
      rewardPolicyVersion: VAULT_BLUFF_REWARD_POLICY_VERSION,
      fundingCampaign,
      note: `Vault Bluff promo | session=${args.sessionId} | policy=${VAULT_BLUFF_REWARD_POLICY_VERSION} | campaign=${fundingCampaign} | available=${availableAt.toISOString()}`,
    },
  });
  await args.tx.gameRewardGrant.create({
    data: {
      userId: args.userId,
      sessionId: args.sessionId,
      rewardPeriod,
      vp: PROMO_VP,
      status: GameRewardStatus.PENDING,
      rewardPolicyVersion: VAULT_BLUFF_REWARD_POLICY_VERSION,
      fundingCampaign,
      availableAt,
      ledgerEntryId: ledger.id,
    },
  });
  return { kind: "granted", vp: PROMO_VP, availableAt };
}
