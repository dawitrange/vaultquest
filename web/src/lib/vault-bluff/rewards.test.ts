import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { grantGamePromoInTransaction } from "./rewards";

const NOW = new Date("2026-08-16T12:00:00.000Z");

function fakeTransaction(args?: {
  existing?: { id: string };
  userRollingVp?: number;
  fundedVp?: number;
}) {
  const grants: Array<Record<string, unknown>> = [];
  const ledgers: Array<Record<string, unknown>> = [];
  let aggregates = 0;
  const tx = {
    gameRewardGrant: {
      findUnique: async () => args?.existing ?? null,
      aggregate: async () => {
        aggregates += 1;
        return {
          _sum: {
            vp: aggregates === 1 ? (args?.userRollingVp ?? 0) : (args?.fundedVp ?? 0),
          },
        };
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        grants.push(data);
        return { id: "grant-1", ...data };
      },
    },
    ledgerEntry: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        ledgers.push(data);
        return { id: "ledger-1", ...data };
      },
    },
  };
  return {
    tx: tx as unknown as Prisma.TransactionClient,
    grants,
    ledgers,
  };
}

function withRewardEnvironment(
  values: Record<string, string | undefined>,
  run: () => Promise<void>,
) {
  const previous = {
    enabled: process.env.VAULT_BLUFF_REWARDS_ENABLED,
    campaign: process.env.VAULT_BLUFF_FUNDING_CAMPAIGN,
    reserve: process.env.VAULT_BLUFF_RESERVE_VP,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    if (previous.enabled == null) delete process.env.VAULT_BLUFF_REWARDS_ENABLED;
    else process.env.VAULT_BLUFF_REWARDS_ENABLED = previous.enabled;
    if (previous.campaign == null) delete process.env.VAULT_BLUFF_FUNDING_CAMPAIGN;
    else process.env.VAULT_BLUFF_FUNDING_CAMPAIGN = previous.campaign;
    if (previous.reserve == null) delete process.env.VAULT_BLUFF_RESERVE_VP;
    else process.env.VAULT_BLUFF_RESERVE_VP = previous.reserve;
  });
}

test("promotional VP is disabled by default and writes no ledger entry", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: undefined,
      VAULT_BLUFF_FUNDING_CAMPAIGN: undefined,
      VAULT_BLUFF_RESERVE_VP: undefined,
    },
    async () => {
      const fake = fakeTransaction();
      const result = await grantGamePromoInTransaction({
        tx: fake.tx,
        userId: "user-1",
        sessionId: "session-1",
        now: NOW,
      });
      assert.deepEqual(result, { kind: "blocked", reason: "feature_disabled" });
      assert.equal(fake.grants.length, 1);
      assert.equal(fake.ledgers.length, 0);
    },
  );
});

test("configured grant creates reward and pending ledger in one transaction client", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: "true",
      VAULT_BLUFF_FUNDING_CAMPAIGN: "funded-test-campaign",
      VAULT_BLUFF_RESERVE_VP: "10",
    },
    async () => {
      const fake = fakeTransaction();
      const result = await grantGamePromoInTransaction({
        tx: fake.tx,
        userId: "user-1",
        sessionId: "session-1",
        now: NOW,
      });
      assert.equal(result.kind, "granted");
      assert.equal(fake.ledgers.length, 1);
      assert.equal(fake.grants.length, 1);
      assert.equal(fake.ledgers[0]?.vp, 1);
      assert.equal(fake.grants[0]?.ledgerEntryId, "ledger-1");
    },
  );
});

test("rolling cap and funded reserve prevent additional liability", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: "true",
      VAULT_BLUFF_FUNDING_CAMPAIGN: "funded-test-campaign",
      VAULT_BLUFF_RESERVE_VP: "30",
    },
    async () => {
      const rolling = fakeTransaction({ userRollingVp: 30 });
      const rollingResult = await grantGamePromoInTransaction({
        tx: rolling.tx,
        userId: "user-1",
        sessionId: "session-1",
        now: NOW,
      });
      assert.deepEqual(rollingResult, {
        kind: "blocked",
        reason: "rolling_cap_reached",
      });
      assert.equal(rolling.ledgers.length, 0);

      const funded = fakeTransaction({ fundedVp: 30 });
      const fundedResult = await grantGamePromoInTransaction({
        tx: funded.tx,
        userId: "user-2",
        sessionId: "session-2",
        now: NOW,
      });
      assert.deepEqual(fundedResult, {
        kind: "blocked",
        reason: "funding_cap_reached",
      });
      assert.equal(funded.ledgers.length, 0);
    },
  );
});

test("existing UTC-day reward is idempotent", async () => {
  const fake = fakeTransaction({ existing: { id: "existing" } });
  const result = await grantGamePromoInTransaction({
    tx: fake.tx,
    userId: "user-1",
    sessionId: "session-duplicate",
    now: NOW,
  });
  assert.deepEqual(result, { kind: "blocked", reason: "daily_grant_exists" });
  assert.equal(fake.grants.length, 0);
  assert.equal(fake.ledgers.length, 0);
});
