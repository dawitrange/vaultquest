import assert from "node:assert/strict";
import test from "node:test";
import { parseKeeperResponseForm } from "./response-form";

test("Keeper response submits the visible confidence without substitution", () => {
  const formData = new FormData();
  formData.set("answer", "NO");
  formData.set("confidence", "UNSURE");
  formData.set("recommendation", "KEEP");
  assert.deepEqual(parseKeeperResponseForm(formData), {
    answer: "NO",
    confidence: "UNSURE",
    recommendation: "KEEP",
  });
});

test("Keeper response rejects an incomplete draft instead of silently doing nothing", () => {
  const formData = new FormData();
  formData.set("confidence", "CERTAIN");
  formData.set("recommendation", "TAKE");
  assert.equal(parseKeeperResponseForm(formData), null);
});
