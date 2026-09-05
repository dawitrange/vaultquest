import assert from "node:assert/strict";
import test from "node:test";
import { GameSessionStatus, type Prisma } from "@prisma/client";
import { renderToStaticMarkup } from "react-dom/server";
import VaultBluffReplayPage from "@/app/play/vault-bluff/r/[id]/page";
import { prisma } from "@/lib/db";
import type { VaultBluffState } from "./types";

function storedCompletedState(): VaultBluffState {
  return {
    engineVersion: "vault-bluff-engine-v1",
    policyVersion: "vault-bluff-policy-v1",
    seed: "server-only-seed",
    rngCursor: 19,
    persona: "ANALYST",
    humanScore: 2,
    botScore: 2,
    completed: true,
    forfeited: false,
    xpAwarded: 120,
    rounds: [1, 2, 3, 4].map((number) => ({
      number,
      humanRole: number % 2 === 1 ? "KEEPER" : "CHOOSER",
      humanCase: "CASE_A",
      botCase: "CASE_B",
      keyCase: number % 2 === 1 ? "CASE_A" : "CASE_B",
      phase: number === 4 ? "MATCH_COMPLETE" : "ROUND_REVEAL",
      questions: ["KEY_INSIDE_YOUR_CASE", "HOW_CONFIDENT_ARE_YOU"],
      responses: [
        {
          question: "KEY_INSIDE_YOUR_CASE",
          answer: "YES",
          confidence: "CERTAIN",
          recommendation: "KEEP",
          durationMs: 850,
        },
        {
          question: "HOW_CONFIDENT_ARE_YOU",
          answer: "UNSURE",
          confidence: "UNSURE",
          recommendation: "TAKE",
          durationMs: 2_400,
        },
      ],
      choice: "KEEP",
      winner: number <= 2 ? "HUMAN" : "BOT",
      startedAt: `2026-09-05T12:0${number}:00.000Z`,
      deadlineAt: `2026-09-12T12:0${number}:00.000Z`,
      resolvedAt: `2026-09-05T12:0${number}:10.000Z`,
    })),
  };
}

test("public replay page loads without a user filter and renders the safe projection", async () => {
  type PublicFindFirst = (args: unknown) => Promise<{
    state: Prisma.JsonValue;
  } | null>;
  const gameSession = prisma.gameSession as unknown as {
    findFirst: PublicFindFirst;
  };
  const originalFindFirst = gameSession.findFirst;
  let capturedQuery: unknown;
  gameSession.findFirst = async (args) => {
    capturedQuery = args;
    return {
      state: storedCompletedState() as unknown as Prisma.JsonValue,
    };
  };

  try {
    const page = await VaultBluffReplayPage({
      params: Promise.resolve({ id: "opaque-public-id" }),
    });
    const html = renderToStaticMarkup(page);

    assert.deepEqual(capturedQuery, {
      where: {
        id: "opaque-public-id",
        status: GameSessionStatus.COMPLETED,
      },
      select: { state: true },
    });
    assert.match(html, />Public replay · finished match</);
    assert.match(html, />Analyst <span[^>]*>\(bot\)<\/span>/);
    assert.match(html, /href="\/play\/vault-bluff\/r\/opaque-public-id"/);
    assert.doesNotMatch(html, /server-only-seed|rngCursor|durationMs|keyCase/);
  } finally {
    gameSession.findFirst = originalFindFirst;
  }
});
