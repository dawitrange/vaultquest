/**
 * Blast-radius proof for /api/go sign-in redirect.
 * Imports the same helpers the route uses. No HTTP, no /api/go, no postbacks.
 *
 *   npx tsx scripts/go-redirect-blast.ts
 */
import {
  CPX_APP_ID,
  CPX_SLUG,
  GO_SIGN_IN_PATH,
  buildGoRedirect,
  goFailurePath,
  isVaultUserId,
} from "../src/lib/postback";

const wall = `https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}`;
const link = { slug: CPX_SLUG, url: wall };
const user = "clxyz0123456789abcdefghij";

const signed = buildGoRedirect({
  destinationUrl: wall,
  clickId: "click-signed",
  userId: user,
  link,
});
const anon = buildGoRedirect({
  destinationUrl: wall,
  clickId: "click-anon",
  userId: null,
  link,
});
const zero = buildGoRedirect({
  destinationUrl: wall,
  clickId: "click-zero",
  userId: "0",
  link,
});

const signedUrl = signed.ok ? new URL(signed.location) : null;
const checks = [
  ["signed-in sets ext_user_id to session cuid", signed.ok && signedUrl?.searchParams.get("ext_user_id") === user],
  ["signed-in keeps user_id, subid, click_id, s1", Boolean(
    signedUrl &&
      signedUrl.searchParams.get("user_id") === user &&
      signedUrl.searchParams.get("subid") === "click-signed" &&
      signedUrl.searchParams.get("click_id") === "click-signed" &&
      signedUrl.searchParams.get("s1") === user,
  )],
  ["signed-in ext_user_id is not 0", signedUrl?.searchParams.get("ext_user_id") !== "0"],
  ["signed-out has no Location", !anon.ok && anon.reason === "sign_in"],
  ["userId 0 has no Location", !zero.ok && zero.reason === "sign_in"],
  ["failure path is login, not error=", goFailurePath("sign_in") === GO_SIGN_IN_PATH && !GO_SIGN_IN_PATH.includes("error=")],
  ["isVaultUserId rejects 0 and blank", !isVaultUserId("0") && !isVaultUserId("") && isVaultUserId(user)],
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
console.log(`PASS — ${checks.length}/${checks.length} go-redirect blast`);
