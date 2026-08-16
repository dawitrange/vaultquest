import assert from "node:assert/strict";
import test from "node:test";
import {
  authHintFromFormData,
  authHintFromValue,
  loginPathForPage,
  pathFromAuthHint,
  signupPathForPage,
} from "../auth-redirect";

test("play auth hint survives login and signup filtering", () => {
  assert.equal(authHintFromValue("play"), "play");
  assert.equal(pathFromAuthHint(authHintFromValue("play")), "/play/vault-bluff");

  const formData = new FormData();
  formData.set("from", "play");
  assert.equal(authHintFromFormData(formData), "play");
  assert.equal(loginPathForPage("/play"), "/login?from=play");
  assert.equal(loginPathForPage("/earn"), "/login");
  assert.equal(signupPathForPage("/play"), "/signup?from=play");
  assert.equal(signupPathForPage("/earn"), "/signup");
});

test("unknown auth hints still fail closed to account", () => {
  assert.equal(authHintFromValue("https://example.com"), undefined);
  assert.equal(pathFromAuthHint(authHintFromValue("https://example.com")), "/account");
});
