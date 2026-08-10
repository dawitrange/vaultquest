import { LedgerKind, LedgerStatus, type LedgerEntry } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";

export type Balance = {
  available: number;
  pending: number;
};

function isPendingActive(entry: LedgerEntry, now: Date) {
  return (
    entry.status === LedgerStatus.PENDING &&
    entry.availableAt != null &&
    entry.availableAt.getTime() > now.getTime()
  );
}

export function computeBalance(entries: LedgerEntry[], now = new Date()): Balance {
  let available = 0;
  let pending = 0;
  for (const e of entries) {
    if (e.status === LedgerStatus.VOID) continue;
    if (isPendingActive(e, now)) {
      pending += e.vp;
    } else {
      available += e.vp;
    }
  }
  return { available, pending };
}

export async function getBalance(userId: string): Promise<Balance> {
  const entries = await prisma.ledgerEntry.findMany({
    where: { userId, status: { not: LedgerStatus.VOID } },
  });
  return computeBalance(entries);
}

export async function creditEarn(opts: {
  userId: string;
  vp: number;
  questId?: string;
  clickId?: string;
  note?: string;
  holdDays?: number;
}) {
  if (opts.vp <= 0) throw new Error("Earn amount must be positive");
  const holdDays = opts.holdDays ?? 3;
  const availableAt = new Date();
  availableAt.setDate(availableAt.getDate() + holdDays);

  return prisma.ledgerEntry.create({
    data: {
      userId: opts.userId,
      vp: opts.vp,
      kind: LedgerKind.EARN,
      status: holdDays > 0 ? LedgerStatus.PENDING : LedgerStatus.POSTED,
      availableAt: holdDays > 0 ? availableAt : null,
      questId: opts.questId,
      clickId: opts.clickId,
      note: opts.note ?? "Quest earn (pending hold)",
    },
  });
}

/** Demo helper: instantly post available VP (admin/testing). */
export async function creditAvailable(opts: {
  userId: string;
  vp: number;
  note?: string;
}) {
  if (opts.vp <= 0) throw new Error("Credit must be positive");
  return prisma.ledgerEntry.create({
    data: {
      userId: opts.userId,
      vp: opts.vp,
      kind: LedgerKind.ADJUST,
      status: LedgerStatus.POSTED,
      note: opts.note ?? "Adjustment (available)",
    },
  });
}

export async function requestRedeem(opts: {
  userId: string;
  sku: string;
  label: string;
  costVp: number;
}) {
  if (opts.costVp < SITE.minRedeemUsd * SITE.vpPerUsd) {
    throw new Error(`Minimum redeem is ${SITE.minRedeemUsd * SITE.vpPerUsd} VP`);
  }

  return prisma.$transaction(async (tx) => {
    const entries = await tx.ledgerEntry.findMany({
      where: { userId: opts.userId, status: { not: LedgerStatus.VOID } },
    });
    const { available } = computeBalance(entries);
    if (available < opts.costVp) {
      throw new Error("Insufficient available Vault points");
    }

    await tx.ledgerEntry.create({
      data: {
        userId: opts.userId,
        vp: -opts.costVp,
        kind: LedgerKind.REDEEM,
        status: LedgerStatus.POSTED,
        note: `Redeem ${opts.label}`,
      },
    });

    return tx.redemption.create({
      data: {
        userId: opts.userId,
        sku: opts.sku,
        label: opts.label,
        costVp: opts.costVp,
      },
    });
  });
}

export async function listLedger(userId: string, take = 40) {
  return prisma.ledgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
