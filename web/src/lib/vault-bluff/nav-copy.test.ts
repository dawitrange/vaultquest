import assert from "node:assert/strict";
import test from "node:test";
import { NAV, SITE } from "../site";

test("primary navigation stays on the four product destinations", () => {
  assert.deepEqual(NAV, [
    { href: "/play", label: "Play" },
    { href: "/earn", label: "Earn" },
    { href: "/rewards", label: "Rewards" },
    { href: "/giveaway", label: "Giveaway" },
  ]);
});

test("site promise uses unlock language instead of cash-out language", () => {
  assert.match(SITE.promise, /unlock Steam credit/);
  assert.doesNotMatch(SITE.promise, /cash out to Steam/);
});
