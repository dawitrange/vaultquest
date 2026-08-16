import assert from "node:assert/strict";
import test from "node:test";
import {
  authHintFromFormData,
  authHintFromValue,
  pathFromAuthHint,
} from "../auth-redirect";

test("play auth hint survives login and signup filtering", () => {
  assert.equal(authHintFromValue("play"), "play");
  assert.equal(pathFromAuthHint(authHintFromValue("play")), "/play/vault-bluff");

  const formData = new FormData();
  formData.set("from", "play");
  assert.equal(authHintFromFormData(formData), "play");
});

test("unknown auth hints still fail closed to account", () => {
  assert.equal(authHintFromValue("https://example.com"), undefined);
  assert.equal(pathFromAuthHint(authHintFromValue("https://example.com")), "/account");
});
