import assert from "node:assert/strict";
import test from "node:test";
import {
  isVaultBluffFaceoffEnabled,
  roundProgressLabel,
  shouldRenderVaultBluffFaceoff,
  shouldShowFaceoffQuests,
} from "./faceoff-presentation";

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

test("Faceoff is limited to the QA decision, reveal, and result states", () => {
  assert.equal(shouldRenderVaultBluffFaceoff(true, "CHOOSER_DECISION"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(false, "CHOOSER_DECISION"), false);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "ROUND_REVEAL"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "MATCH_COMPLETE"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "CHOOSER_QUESTIONING"), false);
});

test("Quests tab requires both Faceoff and a servable CPX wall", () => {
  assert.equal(shouldShowFaceoffQuests(true, true), true);
  assert.equal(shouldShowFaceoffQuests(true, false), false);
  assert.equal(shouldShowFaceoffQuests(false, true), false);
});
