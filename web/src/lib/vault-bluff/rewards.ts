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
const VP_PER_USD = 100;
const BLUFF_PROGRAM_CEILING_USD = 500;
const BLUFF_PROGRAM_CEILING_VP = BLUFF_PROGRAM_CEILING_USD * VP_PER_USD;
const BLUFF_CAMPAIGN_PREFIX = "vault-bluff-";

export function isVaultBluffVpKillSwitchOpen(): boolean {
  return process.env.VAULT_BLUFF_VP_KILL_SWITCH === "allow";
}

export function canFulfillVaultBluffPromo(): boolean {
  const fundingCampaign = process.env.VAULT_BLUFF_FUNDING_CAMPAIGN?.trim();
  const reserveVp = positiveInteger(process.env.VAULT_BLUFF_RESERVE_VP);
  return (
    process.env.VAULT_BLUFF_REWARDS_ENABLED === "true" &&
    isVaultBluffVpKillSwitchOpen() &&
    process.env.VAULT_BLUFF_ANTI_FARM_READY === "true" &&
    isIsolatedBluffCampaign(fundingCampaign) &&
    reserveVp != null &&
    reserveVp <= BLUFF_PROGRAM_CEILING_VP
  );
}

function utcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function positiveInteger(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function isIsolatedBluffCampaign(value: string | undefined): value is string {
  return Boolean(
    value?.startsWith(BLUFF_CAMPAIGN_PREFIX) &&
      !/(earn|roblox|giveaway|probe)/i.test(value),
  );
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
  const existing = await args.tx.gameRewardGrant.findFirst({
    where: {
      userId: args.userId,
      rewardPeriod,
      status: GameRewardStatus.PENDING,
    },
  });

  const enabled = process.env.VAULT_BLUFF_REWARDS_ENABLED === "true";
  const fundingCampaign = process.env.VAULT_BLUFF_FUNDING_CAMPAIGN?.trim();
  const reserveVp = positiveInteger(process.env.VAULT_BLUFF_RESERVE_VP);
  let blockReason: string | null = existing ? "daily_grant_exists" : null;
  if (!blockReason && !enabled) blockReason = "feature_disabled";
  else if (!blockReason && !isVaultBluffVpKillSwitchOpen()) {
    blockReason = "kill_switch_stopped";
  } else if (!blockReason && process.env.VAULT_BLUFF_ANTI_FARM_READY !== "true") {
    blockReason = "anti_farm_not_ready";
  } else if (!blockReason && !isIsolatedBluffCampaign(fundingCampaign)) {
    blockReason = "funding_campaign_not_isolated";
  } else if (!blockReason && reserveVp == null) blockReason = "reserve_not_configured";
  else if (!blockReason && reserveVp > BLUFF_PROGRAM_CEILING_VP) {
    blockReason = "bluff_program_ceiling_exceeded";
  }

  if (!blockReason) {
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
  }

  if (!blockReason && reserveVp != null) {
    const funded = await args.tx.gameRewardGrant.aggregate({
      where: {
        status: GameRewardStatus.PENDING,
      },
      _sum: { vp: true },
    });
    const remainingReserveVp = reserveVp - (funded._sum.vp ?? 0);
    const grantLiabilityVp = PROMO_VP;
    if (remainingReserveVp < grantLiabilityVp) {
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
  // Pending VP is a redemption liability, not cash and not collectible funds.
  // Any future fulfillment caller must also pass canFulfillVaultBluffPromo().
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
