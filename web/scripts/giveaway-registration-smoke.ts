import assert from "node:assert/strict";
import { compare } from "bcryptjs";
import { ROBLOX_GIVEAWAY_SLUG } from "../src/lib/giveaway";
import {
  submitSignedOutGiveaway,
  type GiveawayRegistrationStore,
} from "../src/lib/giveaway-registration";
import { hashResetToken, RESET_TOKEN_TTL_MS } from "../src/lib/password-reset";

type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

type StoredEntry = {
  campaignSlug: string;
  userId: string;
  email: string;
  name: string;
  reason: string;
};

const users = new Map<string, StoredUser>();
const entries: StoredEntry[] = [];
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

const store: GiveawayRegistrationStore = {
  async findUserIdByEmail(email) {
    return users.get(email)?.id ?? null;
  },
  async createUserWithEntry(args) {
    assert.equal(users.has(args.email), false, "must not create a duplicate user");
    const userId = `user-${users.size + 1}`;
    users.set(args.email, {
      id: userId,
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
    });
    entries.push({
      campaignSlug: args.campaignSlug,
      userId,
      email: args.email,
      name: args.name,
      reason: args.reason,
    });
    resetTokens.set(args.resetTokenHash, {
      userId,
      expiresAt: args.resetTokenExpiresAt,
    });
    return { userId };
  },
};

async function main() {
  const now = Date.UTC(2026, 7, 17, 20, 0, 0);
  const formData = new FormData();
  formData.set("name", "First Visitor");
  formData.set("email", "FIRST@example.com");
  formData.set("reason", "I would use the prize for a game.");
  formData.set("ageConfirmed", "on");
  const submission = {
    store,
    campaignSlug: ROBLOX_GIVEAWAY_SLUG,
    formData,
    now,
  };

  assert.equal(formData.has("password"), false, "signed-out submission must not contain a password field");
  const created = await submitSignedOutGiveaway(submission);
  assert.equal(created.kind, "created");
  if (created.kind !== "created") throw new Error("expected a created registration");

  assert.equal(users.size, 1, "signed-out submission must create one user");
  assert.equal(entries.length, 1, "signed-out submission must create one giveaway entry");
  assert.deepEqual(entries[0], {
    campaignSlug: ROBLOX_GIVEAWAY_SLUG,
    userId: created.userId,
    email: "first@example.com",
    name: "First Visitor",
    reason: "I would use the prize for a game.",
  });

  const user = users.get(created.email);
  assert.ok(user, "created user must be stored");
  assert.equal(
    await compare(created.temporaryPassword, user.passwordHash),
    true,
    "temporary credential must authenticate through the credentials provider",
  );

  const storedReset = resetTokens.get(hashResetToken(created.resetToken));
  assert.ok(storedReset, "set-password token must be stored as a hash");
  assert.equal(storedReset.userId, created.userId);
  assert.equal(storedReset.expiresAt.getTime(), now + RESET_TOKEN_TTL_MS);

  const existing = await submitSignedOutGiveaway(submission);
  assert.deepEqual(existing, { kind: "existing" });
  assert.equal(users.size, 1, "existing email must not create another user");
  assert.equal(entries.length, 1, "existing email must not create another entry");

  console.log("[giveaway-registration-smoke] PASS no-password submit created user, entry, and set-password token");
}

void main();
