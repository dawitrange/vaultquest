/**
 * Blast-radius proof: CPX credit helpers are unchanged.
 * Calls the same functions /api/postback imports. No HTTP. No production postback.
 *
 *   npx tsx scripts/cpx-credit-blast.ts
 */
import {
  CLICK_ID_ALIASES,
  USER_ID_ALIASES,
  firstAlias,
  isCpxReversalStatus,
  shouldSkipHmacForCpx,
  signCpxPostbackHash,
  verifyCpxSecureHash,
} from "../src/lib/postback";

const secret = "unit-cpx-not-a-prod-secret";
const transId = "cpx-trans-1001";
const good = signCpxPostbackHash(transId, secret);
const bag: Record<string, string> = {
  ext_user_id: "clxyz0123456789abcdefghij",
  user_id: "clxyz0123456789abcdefghij",
  click_id: "click-cpx-1",
};
const get = (k: string) => bag[k] ?? "";

const checks = [
  [
    "CLICK_ID_ALIASES still includes ext_user_id",
    (CLICK_ID_ALIASES as readonly string[]).includes("ext_user_id"),
  ],
  [
    "USER_ID_ALIASES still user_id then s1",
    USER_ID_ALIASES[0] === "user_id" && USER_ID_ALIASES.includes("s1"),
  ],
  [
    "firstAlias prefers click_id then ext_user_id",
    firstAlias(get, CLICK_ID_ALIASES) === "click-cpx-1",
  ],
  [
    "wall echo ext_user_id resolves when click_id absent",
    firstAlias((k) => (k === "ext_user_id" ? bag.ext_user_id : ""), CLICK_ID_ALIASES) ===
      bag.ext_user_id,
  ],
  [
    "verifyCpxSecureHash accepts md5(trans_id-secret)",
    verifyCpxSecureHash({ transId, providedHash: good, secrets: [secret] }).ok,
  ],
  [
    "verifyCpxSecureHash rejects bad hash",
    !verifyCpxSecureHash({ transId, providedHash: "deadbeef", secrets: [secret] }).ok,
  ],
  [
    "partner=cpx skips HMAC when secure_hash empty",
    shouldSkipHmacForCpx("cpx", ""),
  ],
  ["status=2 is reversal", isCpxReversalStatus("2")],
  ["status=1 is not reversal", !isCpxReversalStatus("1")],
] as const;

let failed = 0;
for (const [name, pass] of checks) {
  console.log(pass ? "PASS" : "FAIL", name);
  if (!pass) failed += 1;
}
if (failed) {
  console.error(`${failed}/${checks.length} failed`);
  process.exit(1);
}
console.log(`PASS — ${checks.length}/${checks.length} cpx-credit blast`);
