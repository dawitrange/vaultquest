import crypto from "crypto";

/** Shared S2S HMAC helpers for /api/postback and the postback-smoke tester. */

export function stripHashParam(url: string): string {
  const stripped = url
    .replace(/&hash=[^&]*/, "")
    .replace(/\?hash=[^&]*&?/, (m) => (m.endsWith("&") ? "?" : ""));
  return stripped.replace(/\?$/, "");
}

export function hmacHex(secret: string, payload: string, algo: "sha1" | "sha256"): string {
  return crypto.createHmac(algo, secret).update(payload).digest("hex");
}

export function signPostbackUrl(
  urlWithoutHash: string,
  secret: string,
  algo: "sha1" | "sha256" = "sha1",
): string {
  return hmacHex(secret, urlWithoutHash, algo);
}

/**
 * BitLabs: HEX(SHA1_HMAC(urlWithoutHash, app secret)).
 * ayeT / others: SHA256 accepted as fallback.
 *
 * Fail-closed: a `hash` param with no configured HMAC secret is a 401, not a skip.
 * Unsigned callbacks (no hash) still rely on POSTBACK_SECRET alone.
 */
export function verifyPostbackHash(args: {
  url: string;
  hash: string | null | undefined;
  secrets: Array<string | undefined>;
}): { ok: boolean; reason?: string; matched?: "sha1" | "sha256" } {
  const hash = args.hash?.trim();
  if (!hash) return { ok: true };
  const candidates = args.secrets.filter((s): s is string => Boolean(s));
  if (candidates.length === 0) {
    return { ok: false, reason: "hmac secret not configured" };
  }
  const urlWithoutHash = stripHashParam(args.url);
  const want = hash.toLowerCase();
  for (const secret of candidates) {
    const sha1 = hmacHex(secret, urlWithoutHash, "sha1");
    if (sha1.toLowerCase() === want) return { ok: true, matched: "sha1" };
    const sha256 = hmacHex(secret, urlWithoutHash, "sha256");
    if (sha256.toLowerCase() === want) return { ok: true, matched: "sha256" };
  }
  return { ok: false, reason: "hash mismatch" };
}

export function isForbiddenProdSmokeTarget(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === "vaultquest.io" || host === "www.vaultquest.io" || host.endsWith(".vaultquest.io");
  } catch {
    return false;
  }
}

export const HMAC_SECRET_ENV_NAMES = [
  "BITLABS_APP_SECRET",
  "BITLABS_SECRET",
  "AYET_HMAC_SECRET",
  "AYET_SECRET",
] as const;

/**
 * Official AdGate Rewards macros (docs.prodegeads.com): {s1} user, {points},
 * {payout}, {conversion_id}. Secret in the template is a placeholder — never
 * commit a real POSTBACK_SECRET.
 */
export const ADGATE_POSTBACK_TEMPLATE =
  "https://vaultquest.io/api/postback?secret=…&click_id={s1}&user_id={s1}&vp={points}&payout_usd={payout}&tx_id={conversion_id}&partner=adgate";

export const ADGATE_SLUG = "adgate-backup";
export const CPX_SLUG = "cpx-survey";

/** Manager 2026-08-15: app_id exists. Not a wall URL — do not concatenate a placement. */
export const CPX_APP_ID = "35413";

/** Hosts Yield will accept when flipping /admin. Do not invent or hardcode the path. */
export const CPX_ALLOWED_WALL_HOSTS = ["offers.cpx-research.com", "wall.cpx-research.com"] as const;

/** Apex/www marketing sites — never smoke or serve, any path. */
const MARKETING_SITE_HOSTS = new Set([
  "www.cpx-research.com",
  "cpx-research.com",
]);

/** Seed / marketing homepages — never smoke or serve these as "Start quest". */
const MARKETING_HOMEPAGE_HOSTS = new Set([
  "adgatemedia.com",
  "www.adgatemedia.com",
  "lootably.com",
  "www.lootably.com",
  "torox.io",
  "www.torox.io",
  "timewall.io",
  "www.timewall.io",
  "offerdaddy.com",
  "www.offerdaddy.com",
  "www.bitlabs.ai",
  "bitlabs.ai",
  "www.ayetstudios.com",
  "ayetstudios.com",
  "adgem.com",
  "www.adgem.com",
]);

export function isMarketingHomepageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (MARKETING_SITE_HOSTS.has(host)) return true;
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (!MARKETING_HOMEPAGE_HOSTS.has(host)) return false;
    return path === "/" || path === "/index.html" || path === "/index.php";
  } catch {
    return false;
  }
}

export function isAllowedCpxWallHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (CPX_ALLOWED_WALL_HOSTS as readonly string[]).includes(host);
  } catch {
    return false;
  }
}

/** Official CPX wall hop: offers./wall. host, or the cpx-survey AffiliateLink row. */
export function isCpxWallHop(link: { slug: string; url: string }): boolean {
  return link.slug === CPX_SLUG || isAllowedCpxWallHost(link.url);
}

export type GoRedirectResult =
  | { ok: true; location: string }
  | { ok: false; reason: "sign_in" };

/** Signed-out CPX / survey hops go here — login + signup, not a raw error page. */
export const GO_SIGN_IN_PATH = "/login?from=earn";

export function goFailurePath(reason: "sign_in" | "no_link"): string {
  return reason === "sign_in" ? GO_SIGN_IN_PATH : "/earn?error=no_link";
}

/**
 * Attach common partner tracking params. CPX official wall requires
 * ext_user_id=session user; never open that wall with a blank/0 user.
 */
export function buildGoRedirect(args: {
  destinationUrl: string;
  clickId: string;
  userId?: string | null;
  link: { slug: string; url: string };
}): GoRedirectResult {
  const cpx = isCpxWallHop(args.link) || isAllowedCpxWallHost(args.destinationUrl);
  if (cpx && !args.userId) {
    return { ok: false, reason: "sign_in" };
  }

  const target = new URL(args.destinationUrl);
  const s1 = args.userId ?? args.clickId;
  target.searchParams.set("subid", args.clickId);
  target.searchParams.set("click_id", args.clickId);
  target.searchParams.set("s1", s1);
  if (args.userId) target.searchParams.set("user_id", args.userId);
  if (cpx && args.userId) target.searchParams.set("ext_user_id", args.userId);
  // Official CPX dashboard macros include {subid} and {subid_1}. Both must
  // echo the OfferClick id so a postback can attach the click. user_id /
  // ext_user_id stay the VaultQuest user id — never the click id.
  if (cpx) target.searchParams.set("subid_1", args.clickId);
  return { ok: true, location: target.toString() };
}

/**
 * True only after Yield pastes a real offers./wall. URL that already includes
 * app_id 35413. Does not build or return a URL. Live smoke stays on standby
 * until /admin flip.
 */
export function isYieldFlippedCpxWallUrl(url: string): boolean {
  if (isMarketingHomepageUrl(url) || !isAllowedCpxWallHost(url)) return false;
  try {
    return new URL(url).searchParams.get("app_id") === CPX_APP_ID;
  } catch {
    return false;
  }
}

/**
 * CPX MD5 hook (issue #15 scope). Official publisher formulas:
 *   postback inbound: md5(`${trans_id}-${app_secure_hash}`)
 *   wall/API outbound: md5(`${ext_user_id}-${app_secure_hash}`)
 * Env name: CPX_SECURE_HASH (or CPX_APP_SECRET). Never commit the value.
 * Hook ready ≠ earn-live. Ethio's CPX postback test succeeded. Live URL has
 * no hash=. Yield already flipped cpx-survey to the official offers host +
 * app_id 35413 (healthy). Earn-live is still not certified until a production
 * pending VP credit is visible.
 */
export const CPX_MD5_HOOK_READY = true;
export const CPX_EARN_LIVE_CERTIFIED = false;
/** Inventory flip happened; stay false so we do not smoke or certify earn-live. */
export const CPX_YIELD_FLIP_CONFIRMED = false;
/** Smoke only after flip confirm. Path is CPX / q-surveys — not Freecash, not a homepage. */
export const CPX_LIVE_SMOKE_ALLOWED = false;
export const CPX_SECURE_HASH_ENV_NAMES = ["CPX_SECURE_HASH", "CPX_APP_SECRET"] as const;

/**
 * Official CPX postback. Use `secure_hash={secure_hash}` — never `hash={secure_hash}`.
 * Current prod HMAC-checks `hash` and would 401. Ethio is saving without HMAC `hash=`.
 */
export const CPX_POSTBACK_TEMPLATE =
  "https://vaultquest.io/api/postback?secret=…&user_id={user_id}&trans_id={trans_id}&vp={amount_local}&payout_usd={amount_usd}&status={status}&secure_hash={secure_hash}&partner=cpx";

export function md5Hex(payload: string): string {
  return crypto.createHash("md5").update(payload).digest("hex");
}

export function signCpxPostbackHash(transId: string, appSecureHash: string): string {
  return md5Hex(`${transId}-${appSecureHash}`);
}

/** Wall/API helper only. Do not call this to invent a placement URL. */
export function signCpxWallHash(extUserId: string, appSecureHash: string): string {
  return md5Hex(`${extUserId}-${appSecureHash}`);
}

function timingSafeEqualHex(leftHex: string, rightHex: string): boolean {
  const left = Buffer.from(leftHex.toLowerCase(), "utf8");
  const right = Buffer.from(rightHex.toLowerCase(), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function isCpxPartner(partner: string): boolean {
  return partner.trim().toLowerCase() === "cpx";
}

/** Official CPX MD5 query param. Do not HMAC-check this value. */
export function officialCpxSecureHash(secureHash: string): string {
  return secureHash.trim();
}

/**
 * Skip BitLabs/ayeT HMAC when this is a CPX callback.
 * Missing HMAC `hash` must not 401. Official MD5 lives on `secure_hash`.
 */
export function shouldSkipHmacForCpx(partner: string, secureHash: string): boolean {
  return isCpxPartner(partner) || Boolean(secureHash.trim());
}

/** CPX status=2 is reversal/chargeback. status=1 is credit. */
export function isCpxReversalStatus(status: string): boolean {
  const s = status.trim().toLowerCase();
  return s === "2" || s === "chargeback" || s === "reversed";
}

/**
 * Fail-closed CPX MD5. Call only when official `secure_hash` (or partner=cpx `hash` equivalent) is present.
 * Formula: md5(`${trans_id}-${appsecurehash}`).
 */
export function verifyCpxSecureHash(args: {
  transId: string | null | undefined;
  providedHash: string | null | undefined;
  secrets: Array<string | undefined>;
}): { ok: boolean; reason?: string } {
  const provided = args.providedHash?.trim();
  if (!provided) return { ok: false, reason: "cpx secure_hash missing" };
  const transId = args.transId?.trim();
  if (!transId) return { ok: false, reason: "cpx trans_id missing" };
  const candidates = args.secrets.filter((s): s is string => Boolean(s?.trim()));
  if (candidates.length === 0) {
    return { ok: false, reason: "cpx secure hash secret not configured" };
  }
  const want = provided.toLowerCase();
  for (const secret of candidates) {
    if (timingSafeEqualHex(signCpxPostbackHash(transId, secret), want)) return { ok: true };
  }
  return { ok: false, reason: "cpx secure_hash mismatch" };
}

export function cpxSecureHashEnvConfigured(): boolean {
  return CPX_SECURE_HASH_ENV_NAMES.some((name) => Boolean(process.env[name]?.trim()));
}

/** False until Yield flips a real offers./wall. URL. Hook ready is not earn-live. */
export function isCpxCreditSafe(): boolean {
  return CPX_EARN_LIVE_CERTIFIED;
}

/**
 * Click-row keys only. Official CPX `{user_id}` / `{ext_user_id}` are VaultQuest
 * user ids — they must not live here or a user-id-only postback is looked up as
 * OfferClick.id and can 404 before wall flow.
 */
export const CLICK_ID_ALIASES = ["click_id", "clickId", "subid", "subid_1", "subid_2", "s1"] as const;
export const USER_ID_ALIASES = ["user_id", "uid", "ext_user_id", "s1"] as const;

export function postbackSubjectIds(get: (key: string) => string): {
  clickIdCandidate: string;
  userIdCandidate: string;
} {
  return {
    clickIdCandidate: firstAlias(get, CLICK_ID_ALIASES),
    userIdCandidate: firstAlias(get, USER_ID_ALIASES),
  };
}

export function hasPostbackSubject(get: (key: string) => string): boolean {
  const { clickIdCandidate, userIdCandidate } = postbackSubjectIds(get);
  return Boolean(clickIdCandidate || userIdCandidate);
}

export const TX_ID_ALIASES = ["trans_id", "tx_id", "TX", "transaction_id", "conversion_id"] as const;
export const VP_ALIASES = ["vp", "points", "amount_local", "val", "VAL", "VALUE"] as const;
export const PAYOUT_ALIASES = ["payout_usd", "amount_usd", "payout", "RAW", "USD"] as const;

export function firstAlias(get: (key: string) => string, keys: readonly string[]): string {
  for (const key of keys) {
    const value = get(key);
    if (value) return value;
  }
  return "";
}
