import assert from "node:assert/strict";
import test from "node:test";
import { GameRewardStatus } from "@prisma/client";
import {
  activeSessionToResume,
  isVaultBluffSchemaErrorCode,
  rewardResultFromGrant,
} from "./service";

test("missing Bluff tables and columns are classified as safe setup failures", () => {
  assert.equal(isVaultBluffSchemaErrorCode("P2021"), true);
  assert.equal(isVaultBluffSchemaErrorCode("P2022"), true);
  assert.equal(isVaultBluffSchemaErrorCode("P2002"), false);
});

test("navigation and rematch startup always resume the active session", () => {
  assert.equal(activeSessionToResume(["parked-session"]), "parked-session");
  assert.equal(activeSessionToResume(["replacement-session"]), "replacement-session");
  assert.equal(activeSessionToResume([]), null);
});

test("persisted completing reward converts to the same replay payload", () => {
  const availableAt = new Date("2026-08-17T12:00:00.000Z");
  const persisted = {
    status: GameRewardStatus.PENDING,
    vp: 1,
    availableAt,
    blockReason: null,
  };
  const first = rewardResultFromGrant(persisted);
  const replay = rewardResultFromGrant(persisted);
  assert.deepEqual(replay, first);
  assert.deepEqual(replay, { kind: "granted", vp: 1, availableAt });
});

test("persisted blocked reason survives completing-action replay", () => {
  const persisted = {
    status: GameRewardStatus.BLOCKED,
    vp: 0,
    availableAt: null,
    blockReason: "feature_disabled",
  };
  assert.deepEqual(rewardResultFromGrant(persisted), {
    kind: "blocked",
    reason: "feature_disabled",
  });
});
