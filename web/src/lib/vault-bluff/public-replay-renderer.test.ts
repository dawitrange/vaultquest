import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VaultBluffReplay } from "@/components/play/VaultBluffReplay";
import type { PublicVaultBluffReplay } from "./public-replay";

const replay: PublicVaultBluffReplay = [
  {
    personaId: "SHOWBOAT",
    personaCueCode: "BOLD_READ",
    confidence: "CERTAIN",
    recommendation: "TAKE",
    responseDurationBucket: "BRIEF",
    roundPhase: "ROUND_REVEAL",
    publicContradictionCount: 1,
    revealedOutcome: "BOT_TAKE_LOSS",
    botScore: 0,
    rematchState: "NEW_SESSION_REQUIRED",
  },
  {
    personaId: "SHOWBOAT",
    personaCueCode: "BOLD_READ",
    confidence: "UNSURE",
    recommendation: "KEEP",
    responseDurationBucket: "STEADY",
    roundPhase: "ROUND_REVEAL",
    publicContradictionCount: 0,
    revealedOutcome: "PLAYER_KEEP_LOSS",
    botScore: 1,
    rematchState: "NEW_SESSION_REQUIRED",
  },
  {
    personaId: "SHOWBOAT",
    personaCueCode: "BOLD_READ",
    confidence: "GUESSING",
    recommendation: "TAKE",
    responseDurationBucket: "DELIBERATE",
    roundPhase: "ROUND_REVEAL",
    publicContradictionCount: 1,
    revealedOutcome: "BOT_KEEP_WIN",
    botScore: 2,
    rematchState: "NEW_SESSION_REQUIRED",
  },
  {
    personaId: "SHOWBOAT",
    personaCueCode: "BOLD_READ",
    confidence: "CERTAIN",
    recommendation: "KEEP",
    responseDurationBucket: "STEADY",
    roundPhase: "MATCH_COMPLETE",
    publicContradictionCount: 0,
    revealedOutcome: "PLAYER_TAKE_WIN",
    botScore: 2,
    rematchState: "NEW_SESSION_REQUIRED",
  },
];

function renderReplay() {
  return renderToStaticMarkup(
    createElement(VaultBluffReplay, {
      replay,
      sessionId: "opaque-session-id",
    }),
  );
}

test("public replay route view is stable, BOT-labeled, and actionable", () => {
  const first = renderReplay();
  const second = renderReplay();

  assert.equal(second, first);
  assert.equal(first.match(/\(bot\)/gi)?.length, 1);
  assert.match(first, />Public replay · finished match</);
  assert.match(first, /Final score, player 2, bot 2/i);
  assert.equal(first.match(/Round [1-4] ·/g)?.length, 4);
  assert.match(first, />Bold read</);
  assert.match(first, />Share replay</);
  assert.match(first, /href="\/play\/vault-bluff\/r\/opaque-session-id"/);
  assert.match(first, /href="\/play\/vault-bluff"/);
  assert.match(first, /href="\/earn"/);
  assert.match(first, /href="\/play"/);
  assert.match(first, />Rematch</);
  assert.match(first, />Explore</);
  assert.match(first, />Done</);
  assert.match(first, /adds no VP or rewards/);

  for (const forbidden of [
    "private@example.com",
    "durationMs",
    "rngCursor",
    "keyCase",
    "keeperHasKey",
  ]) {
    assert.doesNotMatch(first, new RegExp(forbidden, "i"));
  }
});
