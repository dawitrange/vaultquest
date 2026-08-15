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
