import assert from "node:assert/strict";
import test from "node:test";
import { canSubmitRevealContinue } from "./interaction-guards";

test("route-transition pointer click cannot consume a held reveal", () => {
  assert.equal(
    canSubmitRevealContinue({
      revealReady: true,
      pending: false,
      pointerArmed: false,
      clickDetail: 1,
    }),
    false,
  );
});

test("fresh pointer and keyboard activations can continue a ready reveal", () => {
  assert.equal(
    canSubmitRevealContinue({
      revealReady: true,
      pending: false,
      pointerArmed: true,
      clickDetail: 1,
    }),
    true,
  );
  assert.equal(
    canSubmitRevealContinue({
      revealReady: true,
      pending: false,
      pointerArmed: false,
      clickDetail: 0,
    }),
    true,
  );
});
