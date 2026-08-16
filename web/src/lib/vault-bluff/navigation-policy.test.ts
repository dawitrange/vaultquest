import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_ROUTE,
  needsGameExitConfirmation,
} from "./navigation-policy";

test("game header exits require explicit player confirmation", () => {
  assert.equal(
    needsGameExitConfirmation({
      currentPath: GAME_ROUTE,
      destination: "/play",
    }),
    true,
  );
  assert.equal(
    needsGameExitConfirmation({
      currentPath: "/play",
      destination: "/earn",
    }),
    false,
  );
});
