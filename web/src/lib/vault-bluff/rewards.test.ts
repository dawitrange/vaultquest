import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import {
  canFulfillVaultBluffPromo,
  grantGamePromoInTransaction,
} from "./rewards";

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
  const keys = [
    "VAULT_BLUFF_REWARDS_ENABLED",
    "VAULT_BLUFF_VP_KILL_SWITCH",
    "VAULT_BLUFF_ANTI_FARM_READY",
    "VAULT_BLUFF_FUNDING_CAMPAIGN",
    "VAULT_BLUFF_RESERVE_VP",
  ] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    for (const key of keys) {
      const value = previous[key];
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("promotional VP is disabled by default and writes no ledger entry", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: undefined,
      VAULT_BLUFF_VP_KILL_SWITCH: undefined,
      VAULT_BLUFF_ANTI_FARM_READY: undefined,
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

test("runtime kill switch blocks mint and fulfillment without stopping play", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: "true",
      VAULT_BLUFF_VP_KILL_SWITCH: "stop",
      VAULT_BLUFF_ANTI_FARM_READY: "true",
      VAULT_BLUFF_FUNDING_CAMPAIGN: "vault-bluff-funded-test",
      VAULT_BLUFF_RESERVE_VP: "100",
    },
    async () => {
      const fake = fakeTransaction();
      const result = await grantGamePromoInTransaction({
        tx: fake.tx,
        userId: "user-1",
        sessionId: "session-1",
        now: NOW,
      });
      assert.deepEqual(result, { kind: "blocked", reason: "kill_switch_stopped" });
      assert.equal(canFulfillVaultBluffPromo(), false);
      assert.equal(fake.ledgers.length, 0);
    },
  );
});

test("anti-farm readiness, campaign isolation, and $500 ceiling fail closed", async () => {
  const base = {
    VAULT_BLUFF_REWARDS_ENABLED: "true",
    VAULT_BLUFF_VP_KILL_SWITCH: "allow",
    VAULT_BLUFF_ANTI_FARM_READY: "true",
    VAULT_BLUFF_FUNDING_CAMPAIGN: "vault-bluff-funded-test",
    VAULT_BLUFF_RESERVE_VP: "50000",
  };
  const cases = [
    {
      environment: { ...base, VAULT_BLUFF_ANTI_FARM_READY: "false" },
      reason: "anti_farm_not_ready",
    },
    {
      environment: {
        ...base,
        VAULT_BLUFF_FUNDING_CAMPAIGN: "vault-bluff-roblox-giveaway",
      },
      reason: "funding_campaign_not_isolated",
    },
    {
      environment: { ...base, VAULT_BLUFF_RESERVE_VP: "50001" },
      reason: "bluff_program_ceiling_exceeded",
    },
  ];
  for (const testCase of cases) {
    await withRewardEnvironment(testCase.environment, async () => {
      const fake = fakeTransaction();
      const result = await grantGamePromoInTransaction({
        tx: fake.tx,
        userId: "user-1",
        sessionId: `session-${testCase.reason}`,
        now: NOW,
      });
      assert.deepEqual(result, { kind: "blocked", reason: testCase.reason });
      assert.equal(canFulfillVaultBluffPromo(), false);
      assert.equal(fake.ledgers.length, 0);
    });
  }
});

test("configured grant creates reward and pending ledger in one transaction client", async () => {
  await withRewardEnvironment(
    {
      VAULT_BLUFF_REWARDS_ENABLED: "true",
      VAULT_BLUFF_VP_KILL_SWITCH: "allow",
      VAULT_BLUFF_ANTI_FARM_READY: "true",
      VAULT_BLUFF_FUNDING_CAMPAIGN: "vault-bluff-funded-test",
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
      assert.equal(canFulfillVaultBluffPromo(), true);
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
      VAULT_BLUFF_VP_KILL_SWITCH: "allow",
      VAULT_BLUFF_ANTI_FARM_READY: "true",
      VAULT_BLUFF_FUNDING_CAMPAIGN: "vault-bluff-funded-test",
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
