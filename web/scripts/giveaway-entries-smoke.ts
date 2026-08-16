/**
 * Pure-function proof that extra entries match the honesty copy.
 * No production postbacks. No seed. No VP writes.
 */
import { LedgerKind, LedgerStatus } from "@prisma/client";
import {
  ROBLOX_GIVEAWAY_CLOSES_AT,
  ROBLOX_GIVEAWAY_OPENS_AT,
  countExtraEntriesFromRows,
  countsAsGiveawayExtraEntry,
  giveawayPhase,
  isExcludedGiveawayQuest,
  tallyFromParts,
  type LedgerEarnRow,
} from "../src/lib/giveaway";

function fail(msg: string): never {
  console.error(`[giveaway-entries-smoke] FAIL ${msg}`);
  process.exit(1);
}

function row(partial: Partial<LedgerEarnRow> & { createdAt: Date }): LedgerEarnRow {
  return {
    kind: LedgerKind.EARN,
    status: LedgerStatus.PENDING,
    questId: "q-freecash",
    ...partial,
  };
}

const inWindow = new Date(ROBLOX_GIVEAWAY_OPENS_AT.getTime() + 60_000);
const before = new Date(ROBLOX_GIVEAWAY_OPENS_AT.getTime() - 60_000);
const after = new Date(ROBLOX_GIVEAWAY_CLOSES_AT.getTime() + 60_000);

if (giveawayPhase(before) !== "upcoming") fail("before window should be upcoming");
if (giveawayPhase(inWindow) !== "open") fail("in window should be open");
if (giveawayPhase(after) !== "closed") fail("after window should be closed");

if (!isExcludedGiveawayQuest("q-gamehag")) fail("q-gamehag must be excluded");
if (!isExcludedGiveawayQuest("gamehag-cpa")) fail("gamehag-cpa must be excluded");
if (isExcludedGiveawayQuest("q-freecash")) fail("q-freecash must count");

const rows: LedgerEarnRow[] = [
  row({ createdAt: inWindow, questId: "q-freecash", status: LedgerStatus.PENDING }),
  row({ createdAt: inWindow, questId: "q-offerwall", status: LedgerStatus.POSTED }),
  row({ createdAt: inWindow, questId: "q-gamehag" }),
  row({ createdAt: inWindow, questId: "gamehag-cpa" }),
  row({ createdAt: inWindow, status: LedgerStatus.VOID, questId: "q-surveys" }),
  row({ createdAt: before, questId: "q-play" }),
  row({ kind: LedgerKind.ADJUST, createdAt: inWindow, questId: "q-surveys" }),
];

if (countExtraEntriesFromRows(rows) !== 2) {
  fail(`expected 2 extra entries, got ${countExtraEntriesFromRows(rows)}`);
}
if (countsAsGiveawayExtraEntry(row({ createdAt: inWindow, questId: null })) !== true) {
  fail("EARN with null questId in-window should count");
}

const tally = tallyFromParts(true, 2);
if (tally.totalEntries !== 3 || tally.baseEntries !== 1) fail("tally 1 base + 2 extra");

console.log("[giveaway-entries-smoke] PASS extra=2 (freecash+offerwall) excluded=gamehag/void/click-not-in-rows");
console.log(`opens=${ROBLOX_GIVEAWAY_OPENS_AT.toISOString()} closes=${ROBLOX_GIVEAWAY_CLOSES_AT.toISOString()}`);
