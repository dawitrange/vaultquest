import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { LedgerKind, LedgerStatus } from "@prisma/client";
import { getQuest } from "@/lib/affiliates";
import { prisma } from "@/lib/db";

/**
 * S2S postback endpoint for offerwall partners.
 *
 * Generic:  GET /api/postback?secret=...&click_id=...&vp=150
 * BitLabs:  GET /api/postback?secret=...&click_id=...&vp=...&hash=HEX_SHA1_HMAC
 *           hash = HEX(SHA1_HMAC(full_url_without_hash, BITLABS_APP_SECRET))
 * ayeT:     same pattern with AYET_HMAC_SECRET if set
 */

function verifyHash(
  req: NextRequest,
  secrets: Array<string | undefined>,
): { ok: boolean; reason?: string } {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) return { ok: true };
  const candidates = secrets.filter(Boolean) as string[];
  if (candidates.length === 0) return { ok: true };
  const full = req.nextUrl.toString();
  const stripped = full.replace(/&hash=[^&]*/, "").replace(/\?hash=[^&]*&?/, (m) => (m.endsWith("&") ? "?" : ""));
  const urlWithoutHash = stripped.replace(/\?$/, "");
  for (const secret of candidates) {
    const expected = crypto.createHmac("sha1", secret).update(urlWithoutHash).digest("hex");
    if (expected === hash.toLowerCase() || expected.toLowerCase() === hash.toLowerCase()) {
      return { ok: true };
    }
    // Also try SHA256 for networks that use it
    const expected256 = crypto.createHmac("sha256", secret).update(urlWithoutHash).digest("hex");
    if (expected256 === hash.toLowerCase()) return { ok: true };
  }
  return { ok: false, reason: "hash mismatch" };
}

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

  // BitLabs / ayeT HMAC validation when hash param present
  const hashCheck = verifyHash(req, [
    process.env.BITLABS_APP_SECRET,
    process.env.BITLABS_SECRET,
    process.env.AYET_HMAC_SECRET,
    process.env.AYET_SECRET,
  ]);
  if (!hashCheck.ok) {
    console.warn("[postback] hash verification failed", req.nextUrl.toString());
    return NextResponse.json({ ok: false, error: "hash verification failed" }, { status: 401 });
  }

  const clickId = get("click_id") || get("clickId") || get("subid") || get("ext_user_id");
  if (!clickId) {
    return NextResponse.json({ ok: false, error: "click_id required" }, { status: 400 });
  }

  const click = await prisma.offerClick.findUnique({
    where: { id: clickId },
    include: { affiliateLink: true },
  });
  if (!click) {
    return NextResponse.json({ ok: false, error: "unknown click_id" }, { status: 404 });
  }
  if (click.credited) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const userId = get("user_id") || get("uid") || click.userId;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "user_id required (click had no user)" }, { status: 400 });
  }

  const questId = get("quest_id") || click.questId || undefined;
  const quest = questId ? getQuest(questId) : null;

  // vp may come as [%VALUE:CURRENCY%] / [%VAL%] / val / vp
  let vp = Number(get("vp") || get("points") || get("val") || get("VAL") || get("VALUE") || "");
  if (!Number.isFinite(vp) || vp <= 0) {
    const payoutUsd = Number(get("payout_usd") || get("payout") || get("RAW") || get("USD") || "");
    if (Number.isFinite(payoutUsd) && payoutUsd > 0) {
      vp = Math.max(1, Math.floor(payoutUsd * 100 * 0.7));
    } else if (quest) {
      vp = quest.vpReward;
    } else {
      return NextResponse.json({ ok: false, error: "vp or payout_usd required" }, { status: 400 });
    }
  }

  // Deduplicate on tx_id if partner sends it
  const txId = get("tx_id") || get("TX") || get("transaction_id") || "";
  if (txId) {
    const dup = await prisma.ledgerEntry.findFirst({ where: { clickId, note: { contains: `tx=${txId}` } } });
    if (dup) return NextResponse.json({ ok: true, duplicate: true, tx_id: txId });
  }

  const holdDaysRaw = Number(get("hold_days") || quest?.holdDays || 3);
  const holdDays = Number.isFinite(holdDaysRaw) ? holdDaysRaw : 3;
  const availableAt = holdDays > 0 ? new Date(Date.now() + holdDays * 86400000) : null;

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.offerClick.findUnique({ where: { id: clickId } });
      if (!fresh || fresh.credited) return;

      await tx.ledgerEntry.create({
        data: {
          userId,
          vp,
          kind: LedgerKind.EARN,
          status: holdDays > 0 ? LedgerStatus.PENDING : LedgerStatus.POSTED,
          availableAt,
          questId,
          clickId,
          note: `S2S postback via ${click.affiliateLink.partner}${txId ? ` tx=${txId}` : ""}${get("hash") ? " hmac=ok" : ""}`,
        },
      });

      await tx.offerClick.update({
        where: { id: clickId },
        data: { credited: true },
      });
    });
  } catch (e) {
    console.error("[postback]", e);
    return NextResponse.json({ ok: false, error: "credit_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, click_id: clickId, vp, user_id: userId });
}
