import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handlePostbackRequest, type PostbackDb } from "@/lib/postback-handler";

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
 *           Official CPX may send `user_id` (and/or `uid`) with no click_id —
 *           that credits the matching User via wall flow (clickId may be null).
 *           status=2 voids a matching PENDING/POSTED EARN; does not unwind REDEEM.
 *           Live URL has no hash=. MD5 stays for later signed CPX posts.
 *           Yield flipped cpx-survey to the official offers host + app_id 35413
 *           (healthy). Not earn-live until a prod pending VP is visible.
 */

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(req: NextRequest) {
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
  const result = await handlePostbackRequest({
    url: req.nextUrl.toString(),
    get,
    prisma: prisma as unknown as PostbackDb,
  });
  return NextResponse.json(result.body, { status: result.status });
}
