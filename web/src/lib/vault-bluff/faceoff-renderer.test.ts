import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  faceoffTableCommand,
  VaultBluffFaceoff,
} from "@/components/play/VaultBluffFaceoff";
import type {
  ApiResult,
  ClientCommand,
} from "@/components/play/VaultBluffGame";
import {
  applyCommand,
  startMatch,
  toSafeSessionDto,
} from "./engine";
import type {
  RoundPhase,
  SafeRoundDto,
  VaultBluffCommand,
} from "./types";

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
      onTableChoice: () => undefined,
      onRetry: () => undefined,
      onRematch: () => undefined,
      onNewBot: () => undefined,
      onContinue: () => undefined,
      onContinuePointerDown: () => undefined,
      onContinuePointerReset: () => undefined,
    }),
  );
}

test("Faceoff decision renders the ask-once table", () => {
  const html = renderPhase("CHOOSER_DECISION");

  assert.equal(html.match(/\(bot\)/gi)?.length, 1);
  assert.match(html, />Showboat <small>\(bot\)<\/small>/);
  assert.match(html, /aria-label="Case A, yours, sealed"/);
  assert.match(html, /aria-label="Case B, Showboat, sealed"/);
  assert.equal(html.match(/class="sr-only">Sealed</g)?.length, 2);
  assert.match(html, />Ask one\.</);
  assert.match(html, />Heavy\?</);
  assert.match(html, />Both sealed\?</);
  assert.match(html, />Would you keep\?</);
  assert.doesNotMatch(html, />Keep</);
  assert.doesNotMatch(html, />Take</);
  assert.doesNotMatch(html, /Take the shiny case|Skip/);
  assert.match(html, /aria-label="How to play"/);
  assert.match(html, /aria-label="Settings are not part of this QA cycle"/);
  assert.match(html, /aria-label="Round 2 of 4"/);
  assert.match(html, />2\/4</);
  assert.match(html, />1 - 1</);
  assert.doesNotMatch(html, /Signal|Outcome|Rematch|Explore|Done/);
});

test("Faceoff table replaces every pre-reveal V1 question wall with three chips", () => {
  for (const phase of [
    "KEEPER_INSPECTION",
    "KEEPER_RESPONSE",
    "CHOOSER_QUESTIONING",
  ] as const) {
    const html = renderPhase(phase);
    assert.match(html, />Heavy\?</);
    assert.match(html, />Both sealed\?</);
    assert.match(html, />Would you keep\?</);
    assert.doesNotMatch(html, />Keep</);
    assert.doesNotMatch(html, />Take</);
    assert.doesNotMatch(html, /0 of 2|Lock response|Approved answer/);
  }
});

test("Faceoff table verbs dispatch legal commands for each V1 phase", () => {
  const inspection = gameFor("KEEPER_INSPECTION").session.currentRound;
  assert.deepEqual(faceoffTableCommand(inspection, "KEEP"), {
    kind: "ACK_INSPECTION",
  });

  const keeperResponse = {
    ...gameFor("KEEPER_RESPONSE").session.currentRound,
    responses: [],
  };
  assert.equal(
    faceoffTableCommand(keeperResponse, "TAKE")?.kind,
    "ANSWER_QUESTION",
  );

  const questioning = {
    ...gameFor("CHOOSER_QUESTIONING").session.currentRound,
    questions: [],
    responses: [],
  };
  assert.equal(
    faceoffTableCommand(questioning, "KEEP")?.kind,
    "ASK_QUESTION",
  );

  const decision = gameFor("CHOOSER_DECISION").session.currentRound;
  assert.deepEqual(faceoffTableCommand(decision, "TAKE"), {
    kind: "CHOOSE_CASE",
    choice: "TAKE",
  });
});

test("one Keep or Take click can run legal commands through round resolution", () => {
  for (const choice of ["KEEP", "TAKE"] as const) {
    let state = startMatch({
      seed: `faceoff-one-click-${choice.toLowerCase()}`,
      persona: "SHOWBOAT",
      now: "2026-08-18T00:00:00.000Z",
    });
    let commandCount = 0;

    while (state.rounds.at(-1)?.phase !== "ROUND_REVEAL") {
      const command = faceoffTableCommand(
        toSafeSessionDto(state).currentRound,
        choice,
      );
      assert.ok(command);
      commandCount += 1;
      state = applyCommand(
        state,
        withNow(command, `2026-08-18T00:00:0${commandCount}.000Z`),
      );
      assert.ok(commandCount <= 4);
    }

    assert.equal(state.rounds.at(-1)?.phase, "ROUND_REVEAL");
    assert.equal(commandCount, 3);
  }
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
  assert.doesNotMatch(html, /href="\/earn"/);
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

function withNow(
  command: ClientCommand,
  now: string,
): VaultBluffCommand {
  return { ...command, now };
}
