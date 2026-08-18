import assert from "node:assert/strict";
import test from "node:test";
import {
  isVaultBluffFaceoffEnabled,
  roundProgressLabel,
  shouldRenderVaultBluffFaceoff,
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

test("Faceoff is limited to the QA decision table", () => {
  assert.equal(shouldRenderVaultBluffFaceoff(true, "CHOOSER_DECISION"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(false, "CHOOSER_DECISION"), false);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "ROUND_REVEAL"), false);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "MATCH_COMPLETE"), false);
});
