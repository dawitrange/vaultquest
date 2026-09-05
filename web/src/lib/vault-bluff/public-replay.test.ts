import assert from "node:assert/strict";
import test from "node:test";
import {
  applyCommand,
  startMatch,
} from "./engine";
import {
  PUBLIC_REPLAY_FIELDS,
  toPublicVaultBluffReplay,
} from "./public-replay";
import { vaultBluffReplayPath } from "./public-replay-path";
import {
  APPROVED_ANSWERS,
  type VaultBluffState,
} from "./types";

const START = "2026-09-05T12:00:00.000Z";

function completedMatch(): VaultBluffState {
  let state = startMatch({
    seed: "public-replay-private-seed",
    persona: "SHOWBOAT",
    now: START,
  });
  let tick = 1;

  while (!state.completed) {
    const round = state.rounds.at(-1)!;
    const now = new Date(Date.parse(START) + tick * 1_000).toISOString();
    tick += 1;

    if (round.phase === "KEEPER_INSPECTION") {
      state = applyCommand(state, { kind: "ACK_INSPECTION", now });
    } else if (round.phase === "KEEPER_RESPONSE") {
      const question = round.questions[round.responses.length]!;
      state = applyCommand(state, {
        kind: "ANSWER_QUESTION",
        answer: APPROVED_ANSWERS[question][0]!,
        confidence: round.responses.length === 0 ? "CERTAIN" : "UNSURE",
        recommendation: round.responses.length === 0 ? "KEEP" : "TAKE",
        now,
      });
    } else if (round.phase === "CHOOSER_QUESTIONING") {
      state = applyCommand(state, {
        kind: "ASK_QUESTION",
        question:
          round.questions.length === 0
            ? "KEY_INSIDE_YOUR_CASE"
            : "HOW_CONFIDENT_ARE_YOU",
        now,
      });
    } else if (round.phase === "CHOOSER_DECISION") {
      state = applyCommand(state, { kind: "CHOOSE_CASE", choice: "KEEP", now });
    } else if (round.phase === "ROUND_REVEAL") {
      state = applyCommand(state, { kind: "NEXT_ROUND", now });
    }
  }

  return state;
}

test("public replay is deterministic and exposes only the projection allowlist", () => {
  const state = completedMatch();
  const polluted = {
    ...state,
    email: "private@example.com",
    userId: "private-user-id",
    accountSecret: "never-public",
    rounds: state.rounds.map((round) => ({
      ...round,
      privateInspection: round.keyCase,
      responses: round.responses.map((response) => ({
        ...response,
        email: "round-private@example.com",
        durationMs: 23_456,
      })),
    })),
  };

  const first = toPublicVaultBluffReplay(polluted);
  const second = toPublicVaultBluffReplay(polluted);

  assert.ok(first);
  assert.deepEqual(second, first);
  assert.equal(first.length, 4);
  for (const frame of first) {
    assert.deepEqual(Object.keys(frame), [...PUBLIC_REPLAY_FIELDS]);
  }

  const serialized = JSON.stringify(first);
  for (const forbidden of [
    "private@example.com",
    "round-private@example.com",
    "private-user-id",
    "never-public",
    "public-replay-private-seed",
    "seed",
    "rngCursor",
    "keyCase",
    "privateInspection",
    "durationMs",
    "23456",
    "answer",
    "choice",
    "winner",
    "humanRole",
    "xpAwarded",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
});

test("public replay rejects active, forfeited, and inconsistent sessions", () => {
  const active = startMatch({
    seed: "active",
    persona: "ANALYST",
    now: START,
  });
  assert.equal(toPublicVaultBluffReplay(active), null);

  const forfeited = applyCommand(active, {
    kind: "FORFEIT",
    now: "2026-09-05T12:00:01.000Z",
  });
  assert.equal(toPublicVaultBluffReplay(forfeited), null);

  const completed = completedMatch();
  assert.equal(
    toPublicVaultBluffReplay({ ...completed, botScore: completed.botScore + 1 }),
    null,
  );
  assert.equal(
    toPublicVaultBluffReplay({
      ...completed,
      rounds: completed.rounds.map((round, index) =>
        index === 0 ? { ...round, humanRole: "CHOOSER" as const } : round,
      ),
    }),
    null,
  );
});

test("replay path treats the opaque session id as one URL segment", () => {
  assert.equal(
    vaultBluffReplayPath("opaque/id with spaces"),
    "/play/vault-bluff/r/opaque%2Fid%20with%20spaces",
  );
});
