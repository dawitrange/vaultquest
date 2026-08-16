import { LedgerKind, LedgerStatus } from "@prisma/client";
import { getQuest } from "./affiliates";
import {
  CPX_SECURE_HASH_ENV_NAMES,
  HMAC_SECRET_ENV_NAMES,
  PAYOUT_ALIASES,
  TX_ID_ALIASES,
  VP_ALIASES,
  firstAlias,
  hasPostbackSubject,
  isCpxPartner,
  isCpxReversalStatus,
  officialCpxSecureHash,
  postbackSubjectIds,
  shouldSkipHmacForCpx,
  verifyCpxSecureHash,
  verifyPostbackHash,
} from "./postback";

export type PostbackJson = Record<string, unknown>;

export type PostbackResult = {
  status: number;
  body: PostbackJson;
};

/** Minimal Prisma surface used by S2S credit. Tests pass an in-memory stand-in. */
export type PostbackDb = {
  offerClick: {
    findUnique: (args: {
      where: { id: string };
      include?: { affiliateLink: boolean };
    }) => Promise<{
      id: string;
      userId: string | null;
      credited: boolean;
      questId: string | null;
      affiliateLink: { partner: string };
    } | null>;
    update: (args: { where: { id: string }; data: { credited: boolean } }) => Promise<unknown>;
  };
  user: {
    findUnique: (args: { where: { id: string }; select?: { id: true } }) => Promise<{ id: string } | null>;
  };
  ledgerEntry: {
    findFirst: (args: {
      where: { userId: string; note: { contains: string } };
    }) => Promise<{
      id: string;
      kind: LedgerKind;
      status: LedgerStatus;
      note: string | null;
    } | null>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    update: (args: {
      where: { id: string };
      data: { status: LedgerStatus; note: string };
    }) => Promise<unknown>;
  };
  $transaction: <T>(fn: (tx: Omit<PostbackDb, "$transaction">) => Promise<T>) => Promise<T>;
};

/**
 * S2S postback core. Official CPX may send `user_id` and no click_id — that
 * must credit via wall flow, not 400 `click_id required`.
 */
export async function handlePostbackRequest(args: {
  url: string;
  get: (key: string) => string;
  prisma: PostbackDb;
  nowMs?: number;
}): Promise<PostbackResult> {
  const { get, prisma } = args;
  const nowMs = args.nowMs ?? Date.now();

  const secret = process.env.POSTBACK_SECRET;
  if (!secret) {
    return json(503, { ok: false, error: "POSTBACK_SECRET not configured" });
  }

  if (get("secret") !== secret) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const partnerHint = get("partner").toLowerCase();
  const officialMd5 = officialCpxSecureHash(get("secure_hash"));
  const skipHmac = shouldSkipHmacForCpx(partnerHint, officialMd5);
  let cpxMd5Ok = false;

  const cpxMd5Value = officialMd5 || (isCpxPartner(partnerHint) ? get("hash").trim() : "");
  if (cpxMd5Value) {
    const cpxCheck = verifyCpxSecureHash({
      transId: firstAlias(get, TX_ID_ALIASES),
      providedHash: cpxMd5Value,
      secrets: CPX_SECURE_HASH_ENV_NAMES.map((name) => process.env[name]),
    });
    if (!cpxCheck.ok) {
      console.warn("[postback] cpx secure_hash failed", cpxCheck.reason ?? "mismatch");
      return json(401, {
        ok: false,
        error: "cpx_secure_hash_failed",
        reason: cpxCheck.reason,
        partner: "cpx",
        safe: false,
      });
    }
    cpxMd5Ok = true;
  }

  const hashParam = skipHmac ? "" : get("hash");
  const hashCheck = verifyPostbackHash({
    url: args.url,
    hash: hashParam || null,
    secrets: HMAC_SECRET_ENV_NAMES.map((name) => process.env[name]),
  });
  if (!hashCheck.ok) {
    console.warn("[postback] hash verification failed", hashCheck.reason ?? "mismatch");
    return json(401, { ok: false, error: "hash verification failed" });
  }
  const hashOk = Boolean(hashParam && hashCheck.ok);

  if (!hasPostbackSubject(get)) {
    return json(400, { ok: false, error: "click_id required" });
  }

  const { clickIdCandidate, userIdCandidate } = postbackSubjectIds(get);

  // Prefer click flow when a click-id alias matches an OfferClick.id
  // ({subid} / {subid_1} / {subid_2} / click_id). user_id is not a click alias.
  const click = clickIdCandidate
    ? await prisma.offerClick.findUnique({
        where: { id: clickIdCandidate },
        include: { affiliateLink: true },
      })
    : null;

  let userId: string | undefined;
  let partnerName: string;
  let clickId: string | null;
  let clickQuestId: string | null | undefined;

  if (click) {
    if (click.credited) {
      return json(200, { ok: true, duplicate: true });
    }
    userId = userIdCandidate || click.userId || undefined;
    partnerName = click.affiliateLink.partner;
    clickId = click.id;
    clickQuestId = click.questId;
  } else {
    const candidateUserId = userIdCandidate || clickIdCandidate;
    const user = candidateUserId
      ? await prisma.user.findUnique({ where: { id: candidateUserId }, select: { id: true } })
      : null;
    if (!user) {
      return json(404, { ok: false, error: "unknown click_id or user" });
    }
    userId = user.id;
    partnerName = get("partner") || "partner wall";
    clickId = null;
    clickQuestId = null;
  }

  if (!userId) {
    return json(400, { ok: false, error: "user_id required (click had no user)" });
  }

  const txIdEarly = firstAlias(get, TX_ID_ALIASES);
  if (isCpxReversalStatus(get("status")) && (isCpxPartner(partnerHint) || officialMd5 || cpxMd5Ok)) {
    if (!txIdEarly) {
      return json(200, {
        ok: true,
        reversed: false,
        gap: "status_2_no_tx",
        partner: "cpx",
      });
    }
    const prior = await prisma.ledgerEntry.findFirst({
      where: { userId, note: { contains: `tx=${txIdEarly}` } },
    });
    if (!prior) {
      return json(200, {
        ok: true,
        reversed: false,
        unmatched: true,
        tx_id: txIdEarly,
        partner: "cpx",
      });
    }
    if (prior.status === LedgerStatus.VOID) {
      return json(200, { ok: true, reversed: true, duplicate: true, tx_id: txIdEarly });
    }
    await prisma.ledgerEntry.update({
      where: { id: prior.id },
      data: {
        status: LedgerStatus.VOID,
        note: `${prior.note ?? ""} cpx_status=2_void`.trim(),
      },
    });
    return json(200, {
      ok: true,
      reversed: true,
      tx_id: txIdEarly,
      ledger_id: prior.id,
      gap: prior.kind === LedgerKind.EARN ? undefined : "status_2_non_earn",
    });
  }

  const questId = get("quest_id") || clickQuestId || undefined;
  const quest = questId ? getQuest(questId) : null;

  let vp = Number(firstAlias(get, VP_ALIASES) || "");
  if (!Number.isFinite(vp) || vp <= 0) {
    const payoutUsd = Number(firstAlias(get, PAYOUT_ALIASES) || "");
    if (Number.isFinite(payoutUsd) && payoutUsd > 0) {
      vp = Math.max(1, Math.floor(payoutUsd * 100 * 0.7));
    } else if (quest) {
      vp = quest.vpReward;
    } else {
      return json(400, { ok: false, error: "vp or payout_usd required" });
    }
  }

  const txId = firstAlias(get, TX_ID_ALIASES);
  if (txId) {
    const dup = await prisma.ledgerEntry.findFirst({ where: { userId, note: { contains: `tx=${txId}` } } });
    if (dup) return json(200, { ok: true, duplicate: true, tx_id: txId });
  }

  const holdDaysRaw = Number(get("hold_days") || quest?.holdDays || 3);
  const holdDays = Number.isFinite(holdDaysRaw) ? holdDaysRaw : 3;
  const availableAt = holdDays > 0 ? new Date(nowMs + holdDays * 86400000) : null;

  let credited = false;
  try {
    credited = await prisma.$transaction(async (tx) => {
      if (clickId) {
        const fresh = await tx.offerClick.findUnique({ where: { id: clickId } });
        if (!fresh || fresh.credited) return false;
      }

      await tx.ledgerEntry.create({
        data: {
          userId,
          vp,
          kind: LedgerKind.EARN,
          status: holdDays > 0 ? LedgerStatus.PENDING : LedgerStatus.POSTED,
          availableAt,
          questId,
          clickId,
          note: `S2S postback via ${partnerName}${txId ? ` tx=${txId}` : ""}${hashOk ? " hmac=ok" : ""}${cpxMd5Ok ? " cpx_md5=ok" : ""}`,
        },
      });

      if (clickId) {
        await tx.offerClick.update({
          where: { id: clickId },
          data: { credited: true },
        });
      }
      return true;
    });
  } catch (e) {
    console.error("[postback] credit_failed");
    return json(500, { ok: false, error: "credit_failed" });
  }

  if (!credited) {
    return json(200, { ok: true, duplicate: true, ...(txId ? { tx_id: txId } : {}) });
  }

  return json(200, {
    ok: true,
    click_id: clickId ?? clickIdCandidate,
    vp,
    user_id: userId,
    ...(hashOk ? { hash: "ok" } : {}),
    ...(cpxMd5Ok ? { cpx_md5: "ok", hash: "ok" } : {}),
    ...(txId ? { tx_id: txId } : {}),
  });
}

function json(status: number, body: PostbackJson): PostbackResult {
  return { status, body };
}
