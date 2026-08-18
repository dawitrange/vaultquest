import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VaultBluffFaceoff } from "@/components/play/VaultBluffFaceoff";
import type { ApiResult } from "@/components/play/VaultBluffGame";
import type { RoundPhase, SafeRoundDto } from "./types";

function gameFor(phase: RoundPhase): ApiResult {
  const resolved = phase === "ROUND_REVEAL" || phase === "MATCH_COMPLETE";
  const currentRound: SafeRoundDto = {
    number: phase === "MATCH_COMPLETE" ? 4 : 2,
    humanRole: "CHOOSER",
    humanCase: "CASE_A",
    botCase: "CASE_B",
    phase,
    questions: ["KEY_INSIDE_YOUR_CASE", "HOW_CONFIDENT_ARE_YOU"],
    responses: [
      {
        question: "KEY_INSIDE_YOUR_CASE",
        answer: "TAKE_MINE",
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
    choice: resolved ? "TAKE" : null,
    winner: resolved ? "HUMAN" : null,
    startedAt: "2026-08-18T00:00:00.000Z",
    deadlineAt: "2026-08-18T00:01:00.000Z",
    resolvedAt: resolved ? "2026-08-18T00:00:10.000Z" : null,
    ...(resolved ? { keyCase: "CASE_B" } : {}),
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
      humanScore: phase === "MATCH_COMPLETE" ? 3 : resolved ? 2 : 1,
      botScore: 1,
      completed: phase === "MATCH_COMPLETE",
      forfeited: false,
      xpAwarded: phase === "MATCH_COMPLETE" ? 120 : 0,
    },
  };
}

function renderPhase(phase: RoundPhase) {
  return renderToStaticMarkup(
    createElement(VaultBluffFaceoff, {
      game: gameFor(phase),
      pending: false,
      error: null,
      retryAvailable: false,
      revealReady: true,
      onAction: () => undefined,
      onRetry: () => undefined,
      onRematch: () => undefined,
      onNewBot: () => undefined,
      onContinue: () => undefined,
      onContinuePointerDown: () => undefined,
      onContinuePointerReset: () => undefined,
    }),
  );
}

test("Faceoff decision renders the quiet play-immediately table", () => {
  const html = renderPhase("CHOOSER_DECISION");

  assert.equal(html.match(/\(bot\)/gi)?.length, 1);
  assert.match(html, />Showboat</);
  assert.match(html, /aria-label="Case A, yours, sealed"/);
  assert.match(html, /aria-label="Case B, Showboat, sealed"/);
  assert.equal(html.match(/class="sr-only">Sealed</g)?.length, 2);
  assert.match(html, />Keep</);
  assert.match(html, />Take</);
  assert.match(html, />Take the shiny case\.</);
  assert.match(html, />Skip</);
  assert.match(html, /aria-label="How to play"/);
  assert.match(html, /aria-label="Settings are not part of this QA cycle"/);
  assert.match(html, /aria-label="Round 2 of 4"/);
  assert.match(html, />2\/4</);
  assert.match(html, />1 - 1</);
  assert.doesNotMatch(html, /Signal|Outcome|Rematch|Explore|Done/);
});

test("Faceoff reveal contains only signal, read, outcome, and Continue", () => {
  const html = renderPhase("ROUND_REVEAL");

  for (const label of ["Signal", "Read", "Outcome", "Continue"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, />Take the case</);
  assert.match(html, />You took B</);
  assert.match(html, />You win</);
  assert.doesNotMatch(html, /Tell strength|Dramatization|How BOT tells|Rematch|Done/);
});

test("Faceoff result keeps four equal actions and no reward copy", () => {
  const html = renderPhase("MATCH_COMPLETE");

  for (const label of ["Rematch", "New BOT", "Explore", "Done"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /href="\/earn"/);
  assert.match(html, /href="\/play"/);
  assert.doesNotMatch(html, /auto-rematch|countdown|\/api\/go\/|\bVP\b/i);
});
