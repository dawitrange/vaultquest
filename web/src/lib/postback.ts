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

/** Hosts Yield will accept once Ethio pastes a real wall URL + app_id. Do not invent the path. */
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

/**
 * CPX posts MD5 `secure_hash`. This route does **not** verify it.
 * Yield: CPX is the next network, but a CPX credit is NOT safe until this
 * check exists. Keep refusing CPX callbacks (HTTP 501) until then.
 * Do not invent offers.cpx-research.com / wall.cpx-research.com paths.
 * Do not flip `cpx-survey` — Yield writes that /admin flip after Ethio's URL+app_id.
 */
export const CPX_SECURE_HASH_VERIFIED = false;

/** False until MD5 secure_hash is implemented. Do not treat CPX ledger rows as earn-live. */
export function isCpxCreditSafe(): boolean {
  return CPX_SECURE_HASH_VERIFIED;
}

export const CLICK_ID_ALIASES = ["click_id", "clickId", "subid", "ext_user_id", "s1"] as const;
export const USER_ID_ALIASES = ["user_id", "uid", "s1"] as const;
export const TX_ID_ALIASES = ["tx_id", "TX", "transaction_id", "conversion_id"] as const;
export const VP_ALIASES = ["vp", "points", "val", "VAL", "VALUE"] as const;
export const PAYOUT_ALIASES = ["payout_usd", "payout", "RAW", "USD"] as const;

export function firstAlias(get: (key: string) => string, keys: readonly string[]): string {
  for (const key of keys) {
    const value = get(key);
    if (value) return value;
  }
  return "";
}
