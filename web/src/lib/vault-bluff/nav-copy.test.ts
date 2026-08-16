import assert from "node:assert/strict";
import test from "node:test";
import { NAV, PLAY_REWARDS_OFF_COPY, SITE } from "../site";

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

test("Play reward card stays on the frozen rewards-off wording", () => {
  assert.equal(
    PLAY_REWARDS_OFF_COPY,
    "Rewards are off. Play and XP stay available.",
  );
  assert.doesNotMatch(PLAY_REWARDS_OFF_COPY, /coming soon|easy VP/i);
});
