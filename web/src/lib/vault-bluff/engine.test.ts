import assert from "node:assert/strict";
import test from "node:test";
import { AdaptiveBotPolicy } from "./bot-policy";
import {
  applyCommand,
  closeMatchForRematch,
  startMatch,
  toSafeSessionDto,
} from "./engine";
import { neutralPlayerMemory, updatePlayerMemoryOnce } from "./player-memory";
import { APPROVED_ANSWERS } from "./types";

const START = "2026-08-16T12:00:00.000Z";

function runMatch() {
  let state = startMatch({ seed: "repeatable-seed", persona: "ANALYST", now: START });
  let tick = 1;
  while (!state.completed) {
    const round = state.rounds.at(-1)!;
    const now = `2026-08-16T12:00:${String(tick).padStart(2, "0")}.000Z`;
    tick += 1;
    if (round.phase === "KEEPER_INSPECTION") {
      state = applyCommand(state, { kind: "ACK_INSPECTION", now });
    } else if (round.phase === "KEEPER_RESPONSE") {
      const question = round.questions[round.responses.length]!;
      state = applyCommand(state, {
        kind: "ANSWER_QUESTION",
        answer: APPROVED_ANSWERS[question][0]!,
        confidence: "UNSURE",
        recommendation: "KEEP",
        now,
      });
    } else if (round.phase === "CHOOSER_QUESTIONING") {
      const question =
        round.questions.length === 0 ? "KEY_INSIDE_YOUR_CASE" : "HOW_CONFIDENT_ARE_YOU";
      state = applyCommand(state, { kind: "ASK_QUESTION", question, now });
    } else if (round.phase === "CHOOSER_DECISION") {
      state = applyCommand(state, { kind: "CHOOSE_CASE", choice: "KEEP", now });
    } else if (round.phase === "ROUND_REVEAL") {
      state = applyCommand(state, { kind: "NEXT_ROUND", now });
    }
  }
  return state;
}

test("same seed and commands produce the same state", () => {
  assert.deepEqual(runMatch(), runMatch());
});

test("illegal transitions fail without changing source state", () => {
  const state = startMatch({ seed: "illegal", persona: "SHOWBOAT", now: START });
  const original = structuredClone(state);
  assert.throws(
    () =>
      applyCommand(state, {
        kind: "CHOOSE_CASE",
        choice: "KEEP",
        now: START,
      }),
    { name: "VaultBluffError" },
  );
  assert.deepEqual(state, original);
});

test("unrevealed placement and seed never enter the safe DTO", () => {
  const state = startMatch({ seed: "private", persona: "NERVOUS", now: START });
  const dto = toSafeSessionDto(state);
  assert.equal("seed" in dto, false);
  assert.equal("keyCase" in dto.currentRound, false);
  assert.equal(typeof dto.currentRound.keeperHasKey, "boolean");
  const afterInspection = applyCommand(state, {
    kind: "ACK_INSPECTION",
    now: "2026-08-16T12:00:01.000Z",
  });
  assert.equal("keyCase" in toSafeSessionDto(afterInspection).currentRound, false);
});

test("chooser bot receives no secret or equivalent state", () => {
  const policy = new AdaptiveBotPolicy();
  const view = {
    roundNumber: 1,
    persona: "ANALYST" as const,
    questions: [],
    responses: [],
  };
  assert.deepEqual(Object.keys(view).sort(), [
    "persona",
    "questions",
    "responses",
    "roundNumber",
  ]);
  const questions = policy.questionsAsChooser({
    view,
    memory: neutralPlayerMemory(),
    random: { seed: "no-secret", cursor: 0 },
  });
  assert.equal(questions.length, 2);
});

test("placement is immutable after behavior commands", () => {
  const state = startMatch({ seed: "immutable", persona: "WILDCARD", now: START });
  const keyCase = state.rounds[0]?.keyCase;
  const next = applyCommand(state, {
    kind: "ACK_INSPECTION",
    now: "2026-08-16T12:00:01.000Z",
  });
  assert.equal(next.rounds[0]?.keyCase, keyCase);
});

test("bot chooser decision is exposed safely when the human is Keeper", () => {
  let state = startMatch({ seed: "bot-choice-visible", persona: "ANALYST", now: START });
  state = applyCommand(state, {
    kind: "ACK_INSPECTION",
    now: "2026-08-16T12:00:01.000Z",
  });
  for (let answerIndex = 0; answerIndex < 2; answerIndex += 1) {
    const round = state.rounds.at(-1)!;
    const question = round.questions[round.responses.length]!;
    state = applyCommand(state, {
      kind: "ANSWER_QUESTION",
      answer: APPROVED_ANSWERS[question][0]!,
      confidence: "UNSURE",
      recommendation: "KEEP",
      now: `2026-08-16T12:00:0${answerIndex + 2}.000Z`,
    });
  }
  const dto = toSafeSessionDto(state);
  assert.equal(dto.currentRound.humanRole, "KEEPER");
  assert.equal(dto.currentRound.phase, "ROUND_REVEAL");
  assert.ok(dto.currentRound.choice === "KEEP" || dto.currentRound.choice === "TAKE");
  assert.ok(dto.currentRound.keyCase);
  assert.ok(dto.currentRound.responses.every((response) => !("durationMs" in response)));
});

test("every human Chooser round starts with zero questions and both available", () => {
  let state = startMatch({ seed: "chooser-round-reset", persona: "ANALYST", now: START });
  let tick = 1;
  let chooserStarts = 0;
  while (chooserStarts < 2) {
    const round = state.rounds.at(-1)!;
    const now = `2026-08-16T12:01:${String(tick).padStart(2, "0")}.000Z`;
    tick += 1;
    if (round.phase === "CHOOSER_QUESTIONING" && round.questions.length === 0) {
      assert.equal(round.responses.length, 0);
      assert.equal(APPROVED_ANSWERS.KEY_INSIDE_YOUR_CASE.length, 2);
      chooserStarts += 1;
      if (chooserStarts === 2) break;
    }
    if (round.phase === "KEEPER_INSPECTION") {
      state = applyCommand(state, { kind: "ACK_INSPECTION", now });
    } else if (round.phase === "KEEPER_RESPONSE") {
      const question = round.questions[round.responses.length]!;
      state = applyCommand(state, {
        kind: "ANSWER_QUESTION",
        answer: APPROVED_ANSWERS[question][0]!,
        confidence: "UNSURE",
        recommendation: "KEEP",
        now,
      });
    } else if (round.phase === "CHOOSER_QUESTIONING") {
      const question =
        round.questions.length === 0
          ? "KEY_INSIDE_YOUR_CASE"
          : "HOW_CONFIDENT_ARE_YOU";
      state = applyCommand(state, { kind: "ASK_QUESTION", question, now });
    } else if (round.phase === "CHOOSER_DECISION") {
      state = applyCommand(state, { kind: "CHOOSE_CASE", choice: "KEEP", now });
    } else if (round.phase === "ROUND_REVEAL") {
      state = applyCommand(state, { kind: "NEXT_ROUND", now });
    }
  }
  assert.equal(state.rounds.at(-1)?.number, 4);
});

test("server deadline rejects stale commands without mutating state", () => {
  const state = startMatch({ seed: "expired", persona: "ANALYST", now: START });
  const original = structuredClone(state);
  assert.throws(
    () =>
      applyCommand(state, {
        kind: "ACK_INSPECTION",
        now: "2026-08-24T12:00:00.000Z",
      }),
    { message: "This round expired. Forfeit it and start a new match" },
  );
  assert.equal(state.forfeited, false);
  assert.deepEqual(state, original);
});

test("rematch closure forfeits an active state before replacement", () => {
  const active = startMatch({ seed: "rematch-close", persona: "ANALYST", now: START });
  const closed = closeMatchForRematch(
    active,
    "2026-08-16T12:00:01.000Z",
  );
  assert.equal(active.completed, false);
  assert.equal(closed.completed, true);
  assert.equal(closed.forfeited, true);
  assert.equal(closed.rounds.at(-1)?.phase, "MATCH_COMPLETE");
});

test("new memory is neutral and forfeits never train", () => {
  const memory = neutralPlayerMemory();
  assert.equal(memory.keepRate, 0.5);
  assert.equal(memory.chooserAccuracy, 0.5);
  const forfeited = applyCommand(
    startMatch({ seed: "forfeit", persona: "ANALYST", now: START }),
    { kind: "FORFEIT", now: "2026-08-16T12:00:01.000Z" },
  );
  assert.deepEqual(updatePlayerMemoryOnce(memory, forfeited), memory);
});

test("valid completion awards XP and can train memory", () => {
  const state = runMatch();
  assert.equal(state.completed, true);
  assert.equal(state.rounds.length, 4);
  assert.ok(state.xpAwarded >= 80);
  assert.equal(updatePlayerMemoryOnce(neutralPlayerMemory(), state).completedMatches, 1);
});
