import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VaultBluffFaceoff } from "@/components/play/VaultBluffFaceoff";
import type { ApiResult } from "@/components/play/VaultBluffGame";
import type { SafeRoundDto } from "./types";

function decisionGame(): ApiResult {
  const currentRound: SafeRoundDto = {
    number: 2,
    humanRole: "CHOOSER",
    humanCase: "CASE_A",
    botCase: "CASE_B",
    phase: "CHOOSER_DECISION",
    questions: ["KEY_INSIDE_YOUR_CASE", "HOW_CONFIDENT_ARE_YOU"],
    responses: [
      {
        question: "KEY_INSIDE_YOUR_CASE",
        answer: "NO",
        confidence: "CERTAIN",
        recommendation: "TAKE",
      },
      {
        question: "HOW_CONFIDENT_ARE_YOU",
        answer: "CERTAIN",
        confidence: "CERTAIN",
        recommendation: "TAKE",
      },
    ],
    choice: null,
    winner: null,
    startedAt: "2026-08-18T00:00:00.000Z",
    deadlineAt: "2026-08-18T00:01:00.000Z",
    resolvedAt: null,
  };

  return {
    id: "safe-session-id",
    version: 7,
    reward: null,
    session: {
      engineVersion: "vault-bluff-engine-v1",
      policyVersion: "vault-bluff-policy-v1",
      persona: "SHOWBOAT",
      rounds: [currentRound],
      currentRound,
      humanScore: 1,
      botScore: 1,
      completed: false,
      forfeited: false,
      xpAwarded: 0,
    },
  };
}

test("Faceoff renders only the quiet play-immediately table", () => {
  const html = renderToStaticMarkup(
    createElement(VaultBluffFaceoff, {
      game: decisionGame(),
      pending: false,
      error: null,
      retryAvailable: false,
      onAction: () => undefined,
      onRetry: () => undefined,
    }),
  );

  assert.equal(html.match(/\(bot\)/gi)?.length, 1);
  assert.match(html, />Showboat</);
  assert.match(html, />Yours</);
  assert.equal(html.match(/>Sealed</g)?.length, 2);
  assert.match(html, />Keep</);
  assert.match(html, />Take</);
  assert.match(html, />Keep or take\.</);
  assert.match(html, />Skip</);
  assert.match(html, /aria-label="How to play"/);
  assert.match(html, /aria-label="Round 2 of 4"/);
  assert.match(html, />1 - 1</);

  assert.doesNotMatch(
    html,
    /Tell strength|Match settings|BOT signal|Outcome|Rematch|New BOT|Explore|Done/,
  );
  assert.doesNotMatch(html, /href="\/earn"|\/api\/go\/|\bVP\b/);
});
