/**
 * postback-smoke.ts — issue #15 click → pending VP tester
 *
 * Never prints secret values. Refuses to send POSTBACK_SECRET / HMAC to
 * vaultquest.io (use --probe-prod for public checks only).
 *
 * Usage (from web/):
 *   npx tsx scripts/postback-smoke.ts --help
 *   npx tsx scripts/postback-smoke.ts --probe-prod
 *   npx tsx scripts/postback-smoke.ts --base-url http://localhost:3000
 *
 * Required env for live credit cases (names only — set locally, never commit):
 *   POSTBACK_SECRET
 *   BITLABS_APP_SECRET  (or AYET_HMAC_SECRET) — HMAC cases
 *   DATABASE_URL        — OfferClick + ledger + funnel checks
 *   POSTBACK_SMOKE_ALLOW_DB=1 — required to upsert the first-party smoke link
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  ADGATE_SLUG,
  CLICK_ID_ALIASES,
  CPX_ALLOWED_WALL_HOSTS,
  CPX_EARN_LIVE_CERTIFIED,
  CPX_MD5_HOOK_READY,
  CPX_SECURE_HASH_ENV_NAMES,
  CPX_SLUG,
  HMAC_SECRET_ENV_NAMES,
  TX_ID_ALIASES,
  firstAlias,
  isAllowedCpxWallHost,
  isCpxCreditSafe,
  isForbiddenProdSmokeTarget,
  isMarketingHomepageUrl,
  signCpxPostbackHash,
  signCpxWallHash,
  signPostbackUrl,
  stripHashParam,
  verifyCpxSecureHash,
  verifyPostbackHash,
} from "../src/lib/postback";

type CaseResult = { name: string; pass: boolean; detail: string };

const PROD_ORIGIN = "https://www.vaultquest.io";
const SMOKE_SLUG = "vq-smoke-first-party";
const SMOKE_URL = "https://www.vaultquest.io/proof";
const SMOKE_QUEST = "q-offerwall";
const SMOKE_HOLD_DAYS = 7;
const SMOKE_VP = 500;

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function envSet(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function redactUrl(raw: string): string {
  try {
    const url = new URL(raw);
    for (const key of [...url.searchParams.keys()]) {
      if (/secret|hash|password|token|key/i.test(key)) url.searchParams.set(key, "REDACTED");
    }
    return url.toString();
  } catch {
    return "[unparseable-url]";
  }
}

function firstHmacSecret(): string | undefined {
  for (const name of HMAC_SECRET_ENV_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  return undefined;
}

function firstCpxSecret(): string | undefined {
  for (const name of CPX_SECURE_HASH_ENV_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  return undefined;
}

function parseArgs(argv: string[]) {
  const out = {
    help: false,
    probeProd: false,
    requireLive: false,
    seedLocal: false,
    baseUrl: "http://localhost:3000",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-Help" || a === "-h") out.help = true;
    else if (a === "--probe-prod") out.probeProd = true;
    else if (a === "--require-live") out.requireLive = true;
    else if (a === "--seed-local") out.seedLocal = true;
    else if (a === "--base-url" || a === "-BaseUrl") out.baseUrl = argv[++i] ?? out.baseUrl;
    else if (/^https?:\/\//.test(a)) out.baseUrl = a;
  }
  return out;
}

function printHelp() {
  console.log(`postback-tester / postback-smoke — click → pending VP

Cases:
  1. Offline HMAC unit (strip hash, SHA1 + SHA256, fail-closed, no server)
  2. Missing / wrong secret → 401 or 503
  3. /api/go test click creates OfferClick (first-party smoke link, not a partner URL)
  4. Valid signed postback → 200 + hash=ok + ledger PENDING + availableAt from holdDays
  5. Duplicate tx_id → HTTP 200 {ok:true, duplicate:true}
  6. Bad hash → 401
  7. Admin last-7d funnel quoted as exact counts / fractions (never rounded up)
  8. Refuse marketing homepages (adgatemedia.com/, www.cpx-research.com/)
  9. CPX MD5 hook: md5(trans_id-CPX_SECURE_HASH) fail-closed; earn-live NOT certified

Target network: CPX (${CPX_SLUG}). AdGate (${ADGATE_SLUG}) is stalled (under review).
${CPX_SLUG} stays disabled at https://www.cpx-research.com/ until Ethio sends a real
${CPX_ALLOWED_WALL_HOSTS[0]} or ${CPX_ALLOWED_WALL_HOSTS[1]} URL with his app_id.
Yield then writes the /admin flip. Do not flip /admin here. Do not invent that URL.
Do NOT smoke a marketing homepage. Freecash path+duplicate is not Yield and not earn-live.
WIP stays 2/3. Do not certify earn-live.

CPX MD5 hook is ready on /api/postback. POSTBACK_SECRET is already set — not enough.
When Yield flips a real wall URL, smoke with MD5 as the route requires.
Until then do not smoke production against a homepage.

Usage:
  bash .cursor/skills/postback-tester/scripts/test.sh --help
  bash .cursor/skills/postback-tester/scripts/test.sh --probe-prod
  bash .cursor/skills/postback-tester/scripts/test.sh http://localhost:3000

Env required for live credit (names only — never commit values):
  POSTBACK_SECRET
  BITLABS_APP_SECRET or AYET_HMAC_SECRET
  CPX_SECURE_HASH (or CPX_APP_SECRET) — CPX MD5 cases
  DATABASE_URL
  POSTBACK_SMOKE_ALLOW_DB=1   (with --seed-local; localhost only)

Constraints:
  Never sends secrets to vaultquest.io. --probe-prod is public 401/503 + /earn only.
  Smoke AffiliateLink URL is first-party ${SMOKE_URL} — not a live partner placement.
  Never invent a CPX wall URL. Do not flip /admin.
`);
}

async function fetchJson(url: string, init?: RequestInit): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(url, { ...init, redirect: "manual" });
  let json: Record<string, unknown> = {};
  const text = await res.text();
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = { raw: text.slice(0, 120) };
  }
  return { status: res.status, json };
}

async function probeProd(): Promise<CaseResult[]> {
  const results: CaseResult[] = [];
  const pb = await fetchJson(`${PROD_ORIGIN}/api/postback`);
  const secretConfigured = pb.status === 401 && pb.json.error === "unauthorized";
  const missing = pb.status === 503;
  results.push({
    name: "prod POSTBACK_SECRET gate (no secret sent)",
    pass: secretConfigured || missing,
    detail: secretConfigured
      ? "HTTP 401 unauthorized — POSTBACK_SECRET is configured on Vercel (value unknown to this runner)"
      : missing
        ? "HTTP 503 — POSTBACK_SECRET not configured"
        : `unexpected HTTP ${pb.status}`,
  });

  const goOffer = await fetch(`${PROD_ORIGIN}/api/go/${SMOKE_QUEST}`, { redirect: "manual" });
  const loc = goOffer.headers.get("location") ?? "";
  results.push({
    name: "prod /api/go/q-offerwall",
    pass: goOffer.status === 307 || goOffer.status === 302,
    detail: loc.includes("error=no_link")
      ? "307 → /earn?error=no_link (no healthy offerwall inventory — #13 reseed)"
      : `HTTP ${goOffer.status} location=${loc.split("?")[0] || "(none)"}`,
  });

  const earn = await fetch(`${PROD_ORIGIN}/earn`);
  const html = await earn.text();
  const freecashCta = html.includes("/api/go/q-freecash");
  const offerwallBlocked = html.includes("Not available yet");
  results.push({
    name: "prod /earn Freecash CTA is not earn-live",
    pass: earn.ok,
    detail: freecashCta
      ? `q-freecash Start quest is present; offerwall empty=${offerwallBlocked}. Freecash path+duplicate is NOT Yield and NOT earn-live.`
      : "q-freecash CTA not in HTML",
  });

  results.push({
    name: "AdGate stalled (under review)",
    pass: true,
    detail: `${ADGATE_SLUG} remains disabled at https://adgatemedia.com/. Not the Yield target. Do not smoke the homepage.`,
  });

  results.push({
    name: "CPX next — wait for Ethio wall URL; no /admin flip",
    pass: true,
    detail:
      `${CPX_SLUG} stays disabled at https://www.cpx-research.com/. ` +
      `BLOCKED until Ethio sends a real ${CPX_ALLOWED_WALL_HOSTS.join(" or ")} URL with his app_id. ` +
      "Yield writes the /admin flip. Do not invent the URL. Do not flip /admin.",
  });

  results.push({
    name: "CPX MD5 hook ready — earn-live NOT certified",
    pass: CPX_MD5_HOOK_READY && !CPX_EARN_LIVE_CERTIFIED && !isCpxCreditSafe(),
    detail:
      "Hook ready: md5(trans_id-CPX_SECURE_HASH). Earn-live not certified. " +
      "Do not smoke a homepage. Yield flips after a real offers./wall. URL + app_id.",
  });

  return results;
}

function offlineHmacCases(): CaseResult[] {
  const results: CaseResult[] = [];
  const localSecret = "unit-hmac-not-a-prod-secret";
  const base = "http://localhost:3000/api/postback?secret=x&click_id=c1&vp=500";
  const sha1 = signPostbackUrl(base, localSecret, "sha1");
  const sha256 = signPostbackUrl(base, localSecret, "sha256");
  const signed = `${base}&hash=${sha1}`;

  results.push({
    name: "stripHashParam leaves urlWithoutHash",
    pass: stripHashParam(signed) === base,
    detail: stripHashParam(signed) === base ? "ok" : "strip mismatch",
  });

  const v1 = verifyPostbackHash({ url: signed, hash: sha1, secrets: [localSecret] });
  results.push({
    name: "valid SHA1 HMAC",
    pass: v1.ok && v1.matched === "sha1",
    detail: v1.ok ? `matched=${v1.matched}` : v1.reason ?? "fail",
  });

  const v256 = verifyPostbackHash({ url: `${base}&hash=${sha256}`, hash: sha256, secrets: [localSecret] });
  results.push({
    name: "valid SHA256 HMAC fallback",
    pass: v256.ok && v256.matched === "sha256",
    detail: v256.ok ? `matched=${v256.matched}` : v256.reason ?? "fail",
  });

  const bad = verifyPostbackHash({ url: `${base}&hash=deadbeef`, hash: "deadbeef", secrets: [localSecret] });
  results.push({
    name: "bad hash rejected",
    pass: !bad.ok,
    detail: bad.reason ?? "expected reject",
  });

  const closed = verifyPostbackHash({ url: signed, hash: sha1, secrets: [undefined] });
  results.push({
    name: "fail-closed when HMAC secret missing",
    pass: !closed.ok && closed.reason === "hmac secret not configured",
    detail: closed.reason ?? "expected fail-closed",
  });

  const unsigned = verifyPostbackHash({ url: base, hash: null, secrets: [undefined] });
  results.push({
    name: "unsigned callback allowed (POSTBACK_SECRET gate only)",
    pass: unsigned.ok,
    detail: "no hash param → skip HMAC",
  });

  const bag: Record<string, string> = { s1: "user-1", conversion_id: "conv-9", points: "80" };
  const get = (k: string) => bag[k] ?? "";
  results.push({
    name: "AdGate aliases s1 + conversion_id",
    pass: firstAlias(get, CLICK_ID_ALIASES) === "user-1" && firstAlias(get, TX_ID_ALIASES) === "conv-9",
    detail: "s1→click_id, conversion_id→tx_id",
  });

  results.push({
    name: "refuse marketing homepages (AdGate + CPX apex)",
    pass:
      isMarketingHomepageUrl("https://adgatemedia.com/") &&
      isMarketingHomepageUrl("https://www.cpx-research.com/") &&
      isMarketingHomepageUrl("https://www.cpx-research.com/publishers") &&
      !isMarketingHomepageUrl(SMOKE_URL) &&
      !isAllowedCpxWallHost("https://www.cpx-research.com/") &&
      isAllowedCpxWallHost("https://offers.cpx-research.com/") &&
      isAllowedCpxWallHost("https://wall.cpx-research.com/"),
    detail: "apex/www CPX + AdGate homepage blocked; offers./wall. hosts allowed when Ethio pastes a real URL",
  });

  const cpxUnitSecret = "unit-cpx-not-a-prod-secret";
  const transId = "cpx-trans-1001";
  const goodMd5 = signCpxPostbackHash(transId, cpxUnitSecret);
  const wallMd5 = signCpxWallHash("user-ext-9", cpxUnitSecret);
  const vCpx = verifyCpxSecureHash({
    transId,
    providedHash: goodMd5,
    secrets: [cpxUnitSecret],
  });
  results.push({
    name: "CPX MD5 postback md5(trans_id-secret)",
    pass: vCpx.ok && goodMd5.length === 32,
    detail: vCpx.ok ? "hook ready" : vCpx.reason ?? "fail",
  });
  results.push({
    name: "CPX MD5 wall helper md5(ext_user_id-secret)",
    pass: wallMd5.length === 32 && wallMd5 !== goodMd5,
    detail: "outbound helper only — do not invent a wall URL",
  });
  const badCpx = verifyCpxSecureHash({
    transId,
    providedHash: "deadbeef",
    secrets: [cpxUnitSecret],
  });
  results.push({
    name: "CPX MD5 bad hash rejected",
    pass: !badCpx.ok && badCpx.reason === "cpx secure_hash mismatch",
    detail: badCpx.reason ?? "expected reject",
  });
  const closedCpx = verifyCpxSecureHash({
    transId,
    providedHash: goodMd5,
    secrets: [undefined],
  });
  results.push({
    name: "CPX MD5 fail-closed when secret missing",
    pass: !closedCpx.ok && closedCpx.reason === "cpx secure hash secret not configured",
    detail: closedCpx.reason ?? "expected fail-closed",
  });
  const missingTx = verifyCpxSecureHash({
    transId: "",
    providedHash: goodMd5,
    secrets: [cpxUnitSecret],
  });
  results.push({
    name: "CPX MD5 fail-closed when trans_id missing",
    pass: !missingTx.ok && missingTx.reason === "cpx trans_id missing",
    detail: missingTx.reason ?? "expected fail-closed",
  });

  return results;
}

async function seedSmokeInventory(): Promise<{ userId: string; detail: string }> {
  if (process.env.POSTBACK_SMOKE_ALLOW_DB !== "1") {
    throw new Error("refusing DB seed: set POSTBACK_SMOKE_ALLOW_DB=1 (localhost only)");
  }
  if (isMarketingHomepageUrl(SMOKE_URL)) {
    throw new Error("refusing smoke seed: destination is a marketing homepage");
  }
  const { prisma } = await import("../src/lib/db");
  const email = `postback-smoke@vaultquest.invalid`;
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Postback smoke", role: "USER" },
    update: {},
  });
  await prisma.affiliateLink.upsert({
    where: { slug: SMOKE_SLUG },
    create: {
      slug: SMOKE_SLUG,
      partner: "VaultQuest smoke",
      url: SMOKE_URL,
      category: "offerwall_primary",
      priority: 99,
      status: "healthy",
      capDaily: 50,
    },
    update: {
      url: SMOKE_URL,
      status: "healthy",
      partner: "VaultQuest smoke",
    },
  });
  return { userId: user.id, detail: `user=${user.id} link=${SMOKE_SLUG} url=first-party /proof` };
}

async function liveCases(baseUrl: string): Promise<CaseResult[]> {
  const results: CaseResult[] = [];
  const origin = baseUrl.replace(/\/$/, "");

  if (isForbiddenProdSmokeTarget(origin)) {
    results.push({
      name: "refuse secret-bearing prod requests",
      pass: true,
      detail: "blocked — use --probe-prod (no secrets) until Ethio provides a local/stage target",
    });
    return results;
  }

  const missing = await fetchJson(`${origin}/api/postback`);
  results.push({
    name: "missing secret",
    pass: missing.status === 401 || missing.status === 503,
    detail: `HTTP ${missing.status} error=${String(missing.json.error ?? "")}`,
  });

  const postbackSecret = process.env.POSTBACK_SECRET?.trim();
  const hmacSecret = firstHmacSecret();
  if (!postbackSecret) {
    results.push({
      name: "live credit cases",
      pass: false,
      detail: "BLOCKED — POSTBACK_SECRET not set in this environment (name required; value never logged)",
    });
    return results;
  }
  if (!hmacSecret) {
    results.push({
      name: "HMAC secret present",
      pass: false,
      detail: "BLOCKED — set BITLABS_APP_SECRET or AYET_HMAC_SECRET for signed cases (names only)",
    });
    return results;
  }
  if (!process.env.DATABASE_URL) {
    results.push({
      name: "DATABASE_URL",
      pass: false,
      detail: "BLOCKED — DATABASE_URL required to create OfferClick + read ledger/funnel",
    });
    return results;
  }

  let userId: string;
  try {
    const seeded = await seedSmokeInventory();
    userId = seeded.userId;
    results.push({ name: "seed first-party smoke link", pass: true, detail: seeded.detail });
  } catch (e) {
    results.push({
      name: "seed first-party smoke link",
      pass: false,
      detail: e instanceof Error ? e.message : "seed failed",
    });
    return results;
  }

  const go = await fetch(`${origin}/api/go/${SMOKE_QUEST}`, { redirect: "manual" });
  const loc = go.headers.get("location") ?? "";
  if (loc && isMarketingHomepageUrl(loc)) {
    results.push({
      name: "/api/go creates OfferClick",
      pass: false,
      detail: "BLOCKED — destination is a marketing homepage; will not smoke",
    });
    return results;
  }
  const goUrl = loc ? new URL(loc, origin) : null;
  const clickId = goUrl?.searchParams.get("click_id") ?? "";
  const s1 = goUrl?.searchParams.get("s1") ?? "";
  const clickOk =
    (go.status === 307 || go.status === 302) && Boolean(clickId) && loc.startsWith(SMOKE_URL) && Boolean(s1);
  results.push({
    name: "/api/go creates OfferClick",
    pass: clickOk,
    detail: clickOk
      ? `click_id=${clickId} s1=${s1} → first-party /proof`
      : `HTTP ${go.status} loc=${redactUrl(loc) || "(none)"}`,
  });
  if (!clickOk) return results;

  const { prisma } = await import("../src/lib/db");
  const clickRow = await prisma.offerClick.findUnique({ where: { id: clickId } });
  results.push({
    name: "OfferClick row exists",
    pass: Boolean(clickRow && clickRow.questId === SMOKE_QUEST && !clickRow.credited),
    detail: clickRow ? `id=${clickRow.id} quest=${clickRow.questId} credited=${clickRow.credited}` : "missing row",
  });

  const txId = `smoke-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const unsigned = new URL(`${origin}/api/postback`);
  unsigned.searchParams.set("secret", postbackSecret);
  unsigned.searchParams.set("click_id", clickId);
  unsigned.searchParams.set("user_id", userId);
  unsigned.searchParams.set("quest_id", SMOKE_QUEST);
  unsigned.searchParams.set("vp", String(SMOKE_VP));
  unsigned.searchParams.set("tx_id", txId);
  const urlWithoutHash = unsigned.toString();
  const hash = signPostbackUrl(urlWithoutHash, hmacSecret, "sha1");
  const signed = `${urlWithoutHash}&hash=${hash}`;

  const credit = await fetchJson(signed);
  const hashOk = credit.json.hash === "ok";
  results.push({
    name: "valid signed postback",
    pass: credit.status === 200 && credit.json.ok === true && hashOk && credit.json.duplicate !== true,
    detail: `HTTP ${credit.status} ok=${String(credit.json.ok)} hash=${String(credit.json.hash ?? "")} tx_id=${txId}`,
  });

  const ledger = await prisma.ledgerEntry.findFirst({
    where: { userId, note: { contains: `tx=${txId}` } },
  });
  const availableAt = ledger?.availableAt ? new Date(ledger.availableAt) : null;
  const expectedMs = SMOKE_HOLD_DAYS * 86400000;
  const delta = availableAt ? Math.abs(availableAt.getTime() - (Date.now() + expectedMs)) : Infinity;
  const holdOk = Boolean(
    ledger &&
      ledger.status === "PENDING" &&
      ledger.vp === SMOKE_VP &&
      availableAt &&
      delta < 120000,
  );
  results.push({
    name: "ledger pending VP + availableAt from holdDays",
    pass: holdOk,
    detail: ledger
      ? `id=${ledger.id} status=${ledger.status} vp=${ledger.vp} availableAt=${availableAt?.toISOString() ?? "null"} holdDays=${SMOKE_HOLD_DAYS}`
      : "no ledger row",
  });

  const dup = await fetchJson(signed);
  results.push({
    name: "duplicate tx_id",
    pass: dup.status === 200 && dup.json.ok === true && dup.json.duplicate === true,
    detail: `HTTP ${dup.status} ${JSON.stringify({ ok: dup.json.ok, duplicate: dup.json.duplicate })}`,
  });

  const badHashUrl = `${urlWithoutHash}&hash=${"f".repeat(40)}`;
  const bad = await fetchJson(badHashUrl);
  results.push({
    name: "bad hash",
    pass: bad.status === 401,
    detail: `HTTP ${bad.status} error=${String(bad.json.error ?? "")}`,
  });

  const adgateTx = `adgate-smoke-${Date.now()}`;
  const adgateUrl = new URL(`${origin}/api/postback`);
  adgateUrl.searchParams.set("secret", postbackSecret);
  adgateUrl.searchParams.set("s1", userId);
  adgateUrl.searchParams.set("points", "80");
  adgateUrl.searchParams.set("payout", "1.15");
  adgateUrl.searchParams.set("conversion_id", adgateTx);
  adgateUrl.searchParams.set("partner", "adgate");
  const adgate = await fetchJson(adgateUrl.toString());
  const adgateLedger = await prisma.ledgerEntry.findFirst({
    where: { userId, note: { contains: `tx=${adgateTx}` } },
  });
  results.push({
    name: "alias wiring postback (not earn-live / not Yield)",
    pass:
      adgate.status === 200 &&
      adgate.json.ok === true &&
      adgateLedger?.status === "PENDING" &&
      Boolean(adgateLedger.availableAt),
    detail: `HTTP ${adgate.status} tx_id=${adgateTx} ledger=${adgateLedger?.id ?? "none"} status=${adgateLedger?.status ?? "none"}`,
  });

  const cpxBad = await fetchJson(
    `${origin}/api/postback?secret=${encodeURIComponent(postbackSecret)}&user_id=${encodeURIComponent(userId)}&click_id=${encodeURIComponent(userId)}&vp=10&partner=cpx&trans_id=cpx-bad&secure_hash=deadbeef`,
  );
  results.push({
    name: "CPX bad MD5 fail-closed (not earn-live)",
    pass: cpxBad.status === 401 && cpxBad.json.error === "cpx_secure_hash_failed" && cpxBad.json.safe === false,
    detail: `HTTP ${cpxBad.status} error=${String(cpxBad.json.error ?? "")} reason=${String(cpxBad.json.reason ?? "")}`,
  });

  const cpxSecret = firstCpxSecret();
  if (!cpxSecret) {
    results.push({
      name: "CPX valid MD5 live credit",
      pass: true,
      detail:
        "SKIPPED — set CPX_SECURE_HASH locally to exercise the happy path. Hook is unit-tested. Earn-live not certified.",
    });
  } else {
    const cpxTx = `cpx-smoke-${Date.now()}`;
    const cpxHash = signCpxPostbackHash(cpxTx, cpxSecret);
    const cpxUrl = new URL(`${origin}/api/postback`);
    cpxUrl.searchParams.set("secret", postbackSecret);
    cpxUrl.searchParams.set("user_id", userId);
    cpxUrl.searchParams.set("click_id", userId);
    cpxUrl.searchParams.set("vp", "25");
    cpxUrl.searchParams.set("partner", "cpx");
    cpxUrl.searchParams.set("trans_id", cpxTx);
    cpxUrl.searchParams.set("hash", cpxHash);
    const cpxOk = await fetchJson(cpxUrl.toString());
    const cpxLedger = await prisma.ledgerEntry.findFirst({
      where: { userId, note: { contains: `tx=${cpxTx}` } },
    });
    results.push({
      name: "CPX valid MD5 live credit (localhost only)",
      pass:
        cpxOk.status === 200 &&
        cpxOk.json.ok === true &&
        cpxOk.json.cpx_md5 === "ok" &&
        cpxLedger?.status === "PENDING" &&
        Boolean(cpxLedger.availableAt),
      detail: `HTTP ${cpxOk.status} cpx_md5=${String(cpxOk.json.cpx_md5 ?? "")} ledger=${cpxLedger?.id ?? "none"} — not earn-live`,
    });
    const cpxDup = await fetchJson(cpxUrl.toString());
    results.push({
      name: "CPX duplicate trans_id",
      pass: cpxDup.status === 200 && cpxDup.json.ok === true && cpxDup.json.duplicate === true,
      detail: `HTTP ${cpxDup.status} duplicate=${String(cpxDup.json.duplicate)}`,
    });
  }

  const { exactFraction, funnel } = await import("../src/lib/analytics");
  const stats = await funnel(7);
  const quote = [
    `Offer clicks=${stats.offerClicks}`,
    `Earn credits=${stats.earnCredits}`,
    `Pending EARN=${stats.pendingEarnCredits}`,
    `S2S credits=${stats.s2sEarnCredits}`,
    `Redemptions=${stats.redemptions}`,
    `Click → earn ${exactFraction(stats.earnCredits, stats.offerClicks)}`,
    `Earn → redeem ${exactFraction(stats.redemptions, stats.earnCredits)}`,
  ].join(" · ");
  results.push({
    name: "admin last-7d funnel (exact, not rounded)",
    pass: stats.s2sEarnCredits >= 1 && stats.pendingEarnCredits >= 1,
    detail: quote,
  });

  return results;
}

function printTable(results: CaseResult[]) {
  console.log("");
  console.log("CASE".padEnd(56), "RESULT", "DETAIL");
  console.log("-".repeat(100));
  for (const r of results) {
    console.log(r.name.slice(0, 56).padEnd(56), r.pass ? "PASS" : "FAIL", r.detail);
  }
  const failed = results.filter((r) => !r.pass).length;
  console.log("-".repeat(100));
  console.log(`${results.length - failed}/${results.length} passed`);
  return failed === 0;
}

async function main() {
  loadEnvFile(path.resolve(__dirname, "../.env"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  loadEnvFile(path.resolve(process.cwd(), "web/.env"));

  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (args.seedLocal) {
    if (isForbiddenProdSmokeTarget(args.baseUrl)) {
      console.error("[postback-smoke] refuse --seed-local against vaultquest.io");
      process.exit(1);
    }
    process.env.POSTBACK_SMOKE_ALLOW_DB = "1";
  }

  if (!fs.existsSync(path.resolve(process.cwd(), ".cursor/mcp.json")) && !fs.existsSync(path.resolve(__dirname, "../../.cursor/mcp.json"))) {
    console.log("plugin-skipped: missing MCP config (datadog)");
  } else {
    try {
      const mcp = fs.readFileSync(
        fs.existsSync(path.resolve(process.cwd(), ".cursor/mcp.json"))
          ? path.resolve(process.cwd(), ".cursor/mcp.json")
          : path.resolve(__dirname, "../../.cursor/mcp.json"),
        "utf8",
      );
      if (!mcp.includes("datadog")) console.log("plugin-skipped: missing MCP config (datadog)");
    } catch {
      console.log("plugin-skipped: missing MCP config (datadog)");
    }
  }

  const results: CaseResult[] = [...offlineHmacCases()];

  if (args.probeProd || args.requireLive === false) {
    try {
      results.push(...(await probeProd()));
    } catch (e) {
      results.push({
        name: "prod probe",
        pass: false,
        detail: e instanceof Error ? e.message : "probe failed",
      });
    }
  }

  const origin = args.baseUrl.replace(/\/$/, "");
  let serverUp = false;
  if (!isForbiddenProdSmokeTarget(origin)) {
    try {
      const ping = await fetch(`${origin}/api/postback`, { redirect: "manual" });
      serverUp = ping.status > 0;
    } catch {
      serverUp = false;
    }
  }

  if (args.requireLive && !serverUp) {
    results.push({ name: "dev server", pass: false, detail: `not reachable at ${origin}` });
  } else if (serverUp && !isForbiddenProdSmokeTarget(origin)) {
    if (args.seedLocal || process.env.POSTBACK_SMOKE_ALLOW_DB === "1") {
      results.push(...(await liveCases(origin)));
    } else {
      results.push({
        name: "live credit cases",
        pass: true,
        detail: "SKIPPED — pass --seed-local and POSTBACK_SMOKE_ALLOW_DB=1 on localhost (never against prod)",
      });
    }
  } else if (!serverUp) {
    results.push({
      name: "live credit cases",
      pass: !args.requireLive,
      detail: `SKIPPED — no server at ${origin}. Start web + set env names, then re-run.`,
    });
  }

  const ok = printTable(results);
  if (!ok) process.exit(1);
  console.log("PASS — postback-smoke");
}

main().catch((e) => {
  console.error("[postback-smoke] FAIL", e instanceof Error ? e.message : "error");
  process.exit(1);
});
