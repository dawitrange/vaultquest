import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VaultBluffFaceoff } from "@/components/play/VaultBluffFaceoff";
import type { ApiResult } from "@/components/play/VaultBluffGame";
import type { SafeRoundDto } from "./types";

function gameResult(complete = false): ApiResult {
  const currentRound: SafeRoundDto = {
    number: complete ? 4 : 2,
    humanRole: "CHOOSER",
    humanCase: "CASE_A",
    botCase: "CASE_B",
    phase: complete ? "MATCH_COMPLETE" : "CHOOSER_DECISION",
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
    choice: complete ? "TAKE" : null,
    winner: complete ? "HUMAN" : null,
    startedAt: "2026-08-18T00:00:00.000Z",
    deadlineAt: "2026-08-18T00:01:00.000Z",
    resolvedAt: complete ? "2026-08-18T00:00:10.000Z" : null,
    ...(complete ? { keyCase: "CASE_B" } : {}),
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
      humanScore: complete ? 3 : 1,
      botScore: 1,
      completed: complete,
      forfeited: false,
      xpAwarded: complete ? 40 : 0,
    },
  };
}

function renderFaceoff(game: ApiResult) {
  return renderToStaticMarkup(
    createElement(VaultBluffFaceoff, {
      game,
      completedMatches: 0,
      initialTotalXp: 0,
      earnQuest: null,
      activeQuestion: undefined,
      answer: null,
      confidence: "UNSURE",
      recommendation: "KEEP",
      pending: false,
      pendingAction: null,
      revealReady: true,
      roundControlsReady: true,
      forfeitConfirmOpen: false,
      error: null,
      retryAvailable: false,
      onAnswerChange: () => undefined,
      onConfidenceChange: () => undefined,
      onRecommendationChange: () => undefined,
      onKeeperResponseSubmit: (event) => event.preventDefault(),
      onAction: () => undefined,
      onRematch: () => undefined,
      onNewBot: () => undefined,
      onRetry: () => undefined,
      onForfeitConfirmChange: () => undefined,
      onContinue: () => undefined,
      onContinuePointerDown: () => undefined,
      onContinuePointerReset: () => undefined,
    }),
  );
}

test("Faceoff board keeps one bot mark and truthful finite progress", () => {
  const html = renderFaceoff(gameResult());
  const mainBoard = html.match(/<main[\s\S]*<\/main>/)?.[0];

  assert.equal(html.match(/\(bot\)/gi)?.length, 1);
  assert.match(html, /Round 2 of 4/);
  assert.match(html, /Keep Case A · K/);
  assert.match(html, /Take Case B · T/);
  assert.ok(mainBoard);
  assert.doesNotMatch(mainBoard, /Tell strength/);
  assert.doesNotMatch(mainBoard, /Dramatization|Always a BOT|no live player/i);
});

test("Faceoff match result renders four equal explicit next actions", () => {
  const html = renderFaceoff(gameResult(true));

  for (const label of ["Rematch", "New BOT", "Explore VaultQuest", "Done"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.doesNotMatch(html, /Instant rematch/);
});
