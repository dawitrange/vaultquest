import { NextRequest, NextResponse } from "next/server";
import { LedgerKind, LedgerStatus } from "@prisma/client";
import { getQuest } from "@/lib/affiliates";
import { prisma } from "@/lib/db";
import {
  CLICK_ID_ALIASES,
  CPX_SECURE_HASH_ENV_NAMES,
  HMAC_SECRET_ENV_NAMES,
  PAYOUT_ALIASES,
  TX_ID_ALIASES,
  USER_ID_ALIASES,
  VP_ALIASES,
  firstAlias,
  isCpxPartner,
  isCpxReversalStatus,
  officialCpxSecureHash,
  shouldSkipHmacForCpx,
  verifyCpxSecureHash,
  verifyPostbackHash,
} from "@/lib/postback";

/**
 * S2S postback endpoint for offerwall partners.
 *
 * Generic:  GET /api/postback?secret=...&click_id=...&vp=150
 * AdGate:   ADGATE_POSTBACK_TEMPLATE (macros {s1} {points} {payout} {conversion_id})
 * BitLabs:  GET /api/postback?secret=...&click_id=...&vp=...&hash=HEX_SHA1_HMAC
 *           hash = HEX(SHA1_HMAC(full_url_without_hash, BITLABS_APP_SECRET))
 * ayeT:     same pattern with AYET_HMAC_SECRET if set
 * CPX:      official param `secure_hash` = md5(`${trans_id}-${appsecurehash}`).
 *           Do not put MD5 on HMAC `hash=` — current prod HMAC-checks `hash` and 401s.
 *           partner=cpx with no HMAC `hash` must not 401. Missing `secure_hash`
 *           skips MD5 (Ethio's current save) and still credits via POSTBACK_SECRET.
 *           status=2 voids a matching PENDING/POSTED EARN; does not unwind REDEEM.
 *           Live URL has no hash=. MD5 stays for later signed CPX posts.
 *           Ethio's postback test succeeded. Yield is flipping — do not smoke
 *           until Yield confirms. Not earn-live until a prod pending VP is visible.
 */

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(req: NextRequest) {
  const secret = process.env.POSTBACK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "POSTBACK_SECRET not configured" }, { status: 503 });
  }

  const url = req.nextUrl;
  let body: Record<string, string> = {};
  if (req.method === "POST") {
    try {
      const json = await req.json();
      if (json && typeof json === "object") {
        body = Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v ?? "")]));
      }
    } catch {
      // ignore
    }
  }

  const get = (key: string) => url.searchParams.get(key) ?? body[key] ?? "";

  if (get("secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const partnerHint = get("partner").toLowerCase();
  const officialMd5 = officialCpxSecureHash(get("secure_hash"));
  const skipHmac = shouldSkipHmacForCpx(partnerHint, officialMd5);
  let cpxMd5Ok = false;

  // Official CPX param is secure_hash. Verify MD5 only when that (or partner=cpx
  // hash= equivalent) is present. Do not 401 for a missing HMAC hash on CPX.
  const cpxMd5Value = officialMd5 || (isCpxPartner(partnerHint) ? get("hash").trim() : "");
  if (cpxMd5Value) {
    const cpxCheck = verifyCpxSecureHash({
      transId: firstAlias(get, TX_ID_ALIASES),
      providedHash: cpxMd5Value,
      secrets: CPX_SECURE_HASH_ENV_NAMES.map((name) => process.env[name]),
    });
    if (!cpxCheck.ok) {
      console.warn("[postback] cpx secure_hash failed", cpxCheck.reason ?? "mismatch");
      return NextResponse.json(
        {
          ok: false,
          error: "cpx_secure_hash_failed",
          reason: cpxCheck.reason,
          partner: "cpx",
          safe: false,
        },
        { status: 401 },
      );
    }
    cpxMd5Ok = true;
  }

  // BitLabs / ayeT HMAC on hash= only. CPX must skip this — missing hash is OK.
  const hashParam = skipHmac ? "" : get("hash");
  const hashCheck = verifyPostbackHash({
    url: req.nextUrl.toString(),
    hash: hashParam || null,
    secrets: HMAC_SECRET_ENV_NAMES.map((name) => process.env[name]),
  });
  if (!hashCheck.ok) {
    console.warn("[postback] hash verification failed", hashCheck.reason ?? "mismatch");
    return NextResponse.json({ ok: false, error: "hash verification failed" }, { status: 401 });
  }
  const hashOk = Boolean(hashParam && hashCheck.ok);

  const trackingId = firstAlias(get, CLICK_ID_ALIASES);
  if (!trackingId) {
    return NextResponse.json({ ok: false, error: "click_id required" }, { status: 400 });
  }

  // Two crediting paths share this endpoint:
  //  (1) per-redirect click flow (/api/go): trackingId is an OfferClick.id.
  //  (2) embedded-wall flow (CPX / TimeWall / Notik): the wall echoes a STABLE
  //      per-user id we put in the wall URL — there is no per-redirect click.
  //      In that case resolve the VaultQuest user directly and credit them.
  const click = await prisma.offerClick.findUnique({
    where: { id: trackingId },
    include: { affiliateLink: true },
  });

  let userId: string | undefined;
  let partnerName: string;
  let clickId: string | null;
  let clickQuestId: string | null | undefined;

  if (click) {
    if (click.credited) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    userId = firstAlias(get, USER_ID_ALIASES) || click.userId || undefined;
    partnerName = click.affiliateLink.partner;
    clickId = click.id;
    clickQuestId = click.questId;
  } else {
    // Wall flow: the echoed id (or an explicit user_id) is a VaultQuest user id.
    const candidateUserId = firstAlias(get, USER_ID_ALIASES) || trackingId;
    const user = candidateUserId
      ? await prisma.user.findUnique({ where: { id: candidateUserId }, select: { id: true } })
      : null;
    if (!user) {
      return NextResponse.json({ ok: false, error: "unknown click_id or user" }, { status: 404 });
    }
    userId = user.id;
    partnerName = get("partner") || "partner wall";
    clickId = null;
    clickQuestId = null;
  }

  if (!userId) {
    return NextResponse.json({ ok: false, error: "user_id required (click had no user)" }, { status: 400 });
  }

  // CPX status=2 is reversal/chargeback. Never credit. VOID a matching EARN if
  // found. Does not unwind an already-spent REDEEM (flagged gap).
  const txIdEarly = firstAlias(get, TX_ID_ALIASES);
  if (isCpxReversalStatus(get("status")) && (isCpxPartner(partnerHint) || officialMd5 || cpxMd5Ok)) {
    if (!txIdEarly) {
      return NextResponse.json({
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
      return NextResponse.json({
        ok: true,
        reversed: false,
        unmatched: true,
        tx_id: txIdEarly,
        partner: "cpx",
      });
    }
    if (prior.status === LedgerStatus.VOID) {
      return NextResponse.json({ ok: true, reversed: true, duplicate: true, tx_id: txIdEarly });
    }
    await prisma.ledgerEntry.update({
      where: { id: prior.id },
      data: {
        status: LedgerStatus.VOID,
        note: `${prior.note ?? ""} cpx_status=2_void`.trim(),
      },
    });
    return NextResponse.json({
      ok: true,
      reversed: true,
      tx_id: txIdEarly,
      ledger_id: prior.id,
      gap: prior.kind === LedgerKind.EARN ? undefined : "status_2_non_earn",
    });
  }

  const questId = get("quest_id") || clickQuestId || undefined;
  const quest = questId ? getQuest(questId) : null;

  // vp may come as [%VALUE:CURRENCY%] / [%VAL%] / val / vp
  let vp = Number(firstAlias(get, VP_ALIASES) || "");
  if (!Number.isFinite(vp) || vp <= 0) {
    const payoutUsd = Number(firstAlias(get, PAYOUT_ALIASES) || "");
    if (Number.isFinite(payoutUsd) && payoutUsd > 0) {
      vp = Math.max(1, Math.floor(payoutUsd * 100 * 0.7));
    } else if (quest) {
      vp = quest.vpReward;
    } else {
      return NextResponse.json({ ok: false, error: "vp or payout_usd required" }, { status: 400 });
    }
  }

  // Deduplicate on tx_id if partner sends it
  const txId = firstAlias(get, TX_ID_ALIASES);
  if (txId) {
    // Dedup per user on the partner tx id (works for both click and wall flows).
    const dup = await prisma.ledgerEntry.findFirst({ where: { userId, note: { contains: `tx=${txId}` } } });
    if (dup) return NextResponse.json({ ok: true, duplicate: true, tx_id: txId });
  }

  const holdDaysRaw = Number(get("hold_days") || quest?.holdDays || 3);
  const holdDays = Number.isFinite(holdDaysRaw) ? holdDaysRaw : 3;
  const availableAt = holdDays > 0 ? new Date(Date.now() + holdDays * 86400000) : null;

  let credited = false;
  try {
    credited = await prisma.$transaction(async (tx) => {
      // Click flow: re-check + mark the click credited atomically.
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
    return NextResponse.json({ ok: false, error: "credit_failed" }, { status: 500 });
  }

  if (!credited) {
    return NextResponse.json({ ok: true, duplicate: true, ...(txId ? { tx_id: txId } : {}) });
  }

  return NextResponse.json({
    ok: true,
    click_id: trackingId,
    vp,
    user_id: userId,
    ...(hashOk ? { hash: "ok" } : {}),
    ...(cpxMd5Ok ? { cpx_md5: "ok", hash: "ok" } : {}),
    ...(txId ? { tx_id: txId } : {}),
  });
}
