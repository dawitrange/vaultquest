import { LedgerKind, LedgerStatus } from "@prisma/client";

/** Keep in sync with affiliates.ts GAMEHAG_QUEST_ID / GAMEHAG_SLUG. */
const GAMEHAG_QUEST_ID = "q-gamehag";
const GAMEHAG_SLUG = "gamehag-cpa";

/** Traffic URL. One campaign row per signed-in user. Extra entries are a LedgerEntry count. */
export const ROBLOX_GIVEAWAY_SLUG = "roblox-2026-08";

export const ROBLOX_GIVEAWAY_TIMEZONE = "America/New_York";

/**
 * Window is America/New_York. August/September 2026 is EDT (UTC-4).
 * Open: 2026-08-17 00:00 ET. Close: end of 2026-09-01 23:59 ET (exclusive midnight Sep 2 ET).
 */
export const ROBLOX_GIVEAWAY_OPENS_AT = new Date("2026-08-17T04:00:00.000Z");
export const ROBLOX_GIVEAWAY_CLOSES_AT = new Date("2026-09-02T04:00:00.000Z");

export const ROBLOX_GIVEAWAY_WINDOW_LABEL =
  "August 17, 2026 12:00 AM to September 1, 2026 11:59 PM, America/New_York";

export const ROBLOX_GIVEAWAY_PRIZE = "five $25 Roblox gift cards";
export const ROBLOX_GIVEAWAY_WINNER_COUNT = 5;
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/Freesteamcodes21";

export type GiveawayPhase = "upcoming" | "open" | "closed";

export function giveawayPhase(now: Date = new Date()): GiveawayPhase {
  if (now.getTime() < ROBLOX_GIVEAWAY_OPENS_AT.getTime()) return "upcoming";
  if (now.getTime() >= ROBLOX_GIVEAWAY_CLOSES_AT.getTime()) return "closed";
  return "open";
}

export function isGiveawayOpen(now: Date = new Date()): boolean {
  return giveawayPhase(now) === "open";
}

/** Gamehag is a third-party hop and does not pay VP. Clicks are not completions. */
export function isExcludedGiveawayQuest(questId: string | null | undefined): boolean {
  if (!questId) return false;
  const q = questId.toLowerCase();
  return q === GAMEHAG_QUEST_ID || q === GAMEHAG_SLUG || q.includes("gamehag");
}

export type LedgerEarnRow = {
  kind: LedgerKind;
  status: LedgerStatus;
  createdAt: Date;
  questId: string | null;
};

export function countsAsGiveawayExtraEntry(row: LedgerEarnRow): boolean {
  if (row.kind !== LedgerKind.EARN) return false;
  if (row.status === LedgerStatus.VOID) return false;
  if (row.status !== LedgerStatus.PENDING && row.status !== LedgerStatus.POSTED) return false;
  if (row.createdAt.getTime() < ROBLOX_GIVEAWAY_OPENS_AT.getTime()) return false;
  if (row.createdAt.getTime() >= ROBLOX_GIVEAWAY_CLOSES_AT.getTime()) return false;
  if (isExcludedGiveawayQuest(row.questId)) return false;
  return true;
}

export function countExtraEntriesFromRows(rows: LedgerEarnRow[]): number {
  return rows.filter((row) => countsAsGiveawayExtraEntry(row)).length;
}

export type GiveawayTally = {
  entered: boolean;
  baseEntries: 0 | 1;
  extraEntries: number;
  totalEntries: number;
};

export function tallyFromParts(entered: boolean, extraEntries: number): GiveawayTally {
  const baseEntries = entered ? 1 : 0;
  return {
    entered,
    baseEntries,
    extraEntries,
    totalEntries: baseEntries + extraEntries,
  };
}
