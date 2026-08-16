import assert from "node:assert/strict";
import test from "node:test";
import { GameRewardStatus } from "@prisma/client";
import { rewardResultFromGrant } from "./service";

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
