import assert from "node:assert/strict";
import test from "node:test";
import {
  isVaultBluffFaceoffEnabled,
  roundProgressLabel,
  shouldRenderVaultBluffFaceoff,
} from "./faceoff-presentation";

test("Faceoff enables on preview while production stays fail-closed", () => {
  assert.equal(isVaultBluffFaceoffEnabled(undefined), false);
  assert.equal(isVaultBluffFaceoffEnabled("false", "production"), false);
  assert.equal(isVaultBluffFaceoffEnabled("TRUE"), false);
  assert.equal(isVaultBluffFaceoffEnabled("true"), true);
  assert.equal(isVaultBluffFaceoffEnabled(undefined, "preview"), true);
  assert.equal(isVaultBluffFaceoffEnabled("false", "preview"), true);
});

test("round progress uses the authoritative session round", () => {
  assert.equal(roundProgressLabel(1), "Round 1 of 4");
  assert.equal(roundProgressLabel(4), "Round 4 of 4");
});

test("enabled Faceoff owns every V1 phase", () => {
  assert.equal(shouldRenderVaultBluffFaceoff(true, "CHOOSER_DECISION"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(false, "CHOOSER_DECISION"), false);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "ROUND_REVEAL"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "MATCH_COMPLETE"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "CHOOSER_QUESTIONING"), true);
  assert.equal(shouldRenderVaultBluffFaceoff(true, "KEEPER_RESPONSE"), true);
});
