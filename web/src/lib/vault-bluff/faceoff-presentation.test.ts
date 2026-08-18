import assert from "node:assert/strict";
import test from "node:test";
import {
  isVaultBluffFaceoffEnabled,
  revealSequence,
  roundProgressLabel,
} from "./faceoff-presentation";
import type { SafeRoundDto } from "./types";

test("Faceoff UI flag fails closed unless the server value is exactly true", () => {
  assert.equal(isVaultBluffFaceoffEnabled(undefined), false);
  assert.equal(isVaultBluffFaceoffEnabled("false"), false);
  assert.equal(isVaultBluffFaceoffEnabled("TRUE"), false);
  assert.equal(isVaultBluffFaceoffEnabled("true"), true);
});

test("round progress uses the authoritative session round", () => {
  assert.equal(roundProgressLabel(1), "Round 1 of 4");
  assert.equal(roundProgressLabel(4), "Round 4 of 4");
});

test("reveal presentation keeps BOT signal, read, and outcome in order", () => {
  const round: SafeRoundDto = {
    number: 2,
    humanRole: "CHOOSER",
    humanCase: "CASE_A",
    botCase: "CASE_B",
    phase: "ROUND_REVEAL",
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
    choice: "TAKE",
    winner: "HUMAN",
    startedAt: "2026-08-18T00:00:00.000Z",
    deadlineAt: "2026-08-18T00:01:00.000Z",
    resolvedAt: "2026-08-18T00:00:10.000Z",
    keyCase: "CASE_B",
  };

  assert.deepEqual(
    revealSequence(round).map((step) => step.label),
    ["BOT signal", "Your read", "Outcome"],
  );
  assert.equal(revealSequence(round)[1].body, "Take");
  assert.equal(revealSequence(round)[2].body, "You win this round.");
});
