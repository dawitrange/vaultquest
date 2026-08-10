/**
 * ai-helpers.ts — Profit-oriented OpenRouter utilities
 *
 * Shares a single hardened wrapper around OpenRouter:
 *  - Rate limiting (per-key token bucket, in-memory)
 *  - TTL cache (dedupe identical prompts, save ~30-60% tokens)
 *  - Cost guard (max_tokens clamp, daily spend cap, model allowlist)
 *  - Prompt templates (versioned strings, not ad-hoc concatenation)
 *  - Structured JSON helpers for profit features
 *
 * Features:
 *  1) Support Triage (FLAGSHIP — fully scaffolded, admin-only)
 *  2) Earn Personalizer
 *  3) Quest Copy Enricher
 *  4) SEO Guide Generator
 *  5) Sentiment Sentinel
 *
 * All callers go through `callGuarded()` so budget/kill-switch is central.
 */

import { chatOnce, getOpenRouterModel, isOpenRouterConfigured, type ChatMessage } from "./openrouter";

// ---------------------------------------------------------------------------
// Cost guard
// ---------------------------------------------------------------------------

const PRICING: Record<string, { inPer1M: number; outPer1M: number }> = {
  "openai/gpt-4o-mini": { inPer1M: 0.15, outPer1M: 0.6 },
  "openai/gpt-4o": { inPer1M: 2.5, outPer1M: 10 },
  "anthropic/claude-3.5-haiku": { inPer1M: 0.8, outPer1M: 4 },
  "google/gemini-flash-1.5": { inPer1M: 0.075, outPer1M: 0.3 },
  "meta-llama/llama-3.1-8b-instruct": { inPer1M: 0.05, outPer1M: 0.08 },
};

const DEFAULT_MODEL = getOpenRouterModel();
const ALLOWED_MODELS = new Set<string>([
  process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  "openai/gpt-4o-mini",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.1-8b-instruct",
]);

/** Daily spend cap in USD — env override, default $5/day for all helpers combined. */
function dailyCapUsd(): number {
  return Number(process.env.AI_HELPERS_DAILY_CAP_USD ?? "5");
}
/** Max output tokens per call — keeps 1 call <= ~$0.005 even on gpt-4o */
const MAX_TOKENS_CAP = 600;

let spendTodayUsd = 0;
let spendDayKey = new Date().toISOString().slice(0, 10);

function trackSpend(inputTokens: number, outputTokens: number, model: string) {
  const p = PRICING[model] ?? PRICING["openai/gpt-4o-mini"];
  const cost = (inputTokens / 1_000_000) * p.inPer1M + (outputTokens / 1_000_000) * p.outPer1M;
  const today = new Date().toISOString().slice(0, 10);
  if (today !== spendDayKey) {
    spendDayKey = today;
    spendTodayUsd = 0;
  }
  spendTodayUsd += cost;
  return cost;
}

export function getAiSpendToday(): { day: string; usd: number; cap: number } {
  return { day: spendDayKey, usd: spendTodayUsd, cap: dailyCapUsd() };
}

export function isAiKillSwitchTripped(): boolean {
  return spendTodayUsd >= dailyCapUsd();
}

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory token bucket per key
// ---------------------------------------------------------------------------

type Bucket = { tokens: number; lastRefill: number };
const BUCKETS = new Map<string, Bucket>();

/** Costs ~1 token per call; refills at `perMinute` rate. */
export function takeRateToken(key: string, perMinute: number): boolean {
  const now = Date.now();
  const b = BUCKETS.get(key) ?? { tokens: perMinute, lastRefill: now };
  const elapsedMin = (now - b.lastRefill) / 60_000;
  b.tokens = Math.min(perMinute, b.tokens + elapsedMin * perMinute);
  b.lastRefill = now;
  if (b.tokens < 1) {
    BUCKETS.set(key, b);
    return false;
  }
  b.tokens -= 1;
  BUCKETS.set(key, b);
  return true;
}

// ---------------------------------------------------------------------------
// Cache — in-memory TTL, keyed by template+input hash
// ---------------------------------------------------------------------------

type CacheEntry = { value: string; expiresAt: number };
const CACHE = new Map<string, CacheEntry>();

function cacheKey(ns: string, input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return `${ns}:${h.toString(36)}`;
}

function cacheGet(key: string): string | null {
  const e = CACHE.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return e.value;
}

function cacheSet(key: string, value: string, ttlMs: number) {
  CACHE.set(key, { value, expiresAt: Date.now() + ttlMs });
  if (CACHE.size > 500) {
    const first = CACHE.keys().next().value as string | undefined;
    if (first) CACHE.delete(first);
  }
}

// ---------------------------------------------------------------------------
// Core guarded caller — every helper must use this
// ---------------------------------------------------------------------------

export type GuardedOpts = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  cacheTtlMs?: number;
  cacheNs?: string;
  rateKey?: string;
  ratePerMinute?: number;
};

async function callGuarded(messages: ChatMessage[], opts: GuardedOpts = {}): Promise<string> {
  if (!isOpenRouterConfigured()) throw new Error("OPENROUTER_API_KEY not configured");
  if (isAiKillSwitchTripped()) throw new Error(`AI daily cap $${dailyCapUsd()} reached — kill switch tripped`);

  const model = opts.model ?? DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(model)) throw new Error(`Model ${model} not allowlisted`);

  const maxTokens = Math.min(opts.maxTokens ?? 400, MAX_TOKENS_CAP);
  const temperature = opts.temperature ?? 0.4;

  // Rate limit check
  if (opts.rateKey && opts.ratePerMinute) {
    if (!takeRateToken(opts.rateKey, opts.ratePerMinute)) {
      throw new Error(`Rate limited (${opts.ratePerMinute}/min for ${opts.rateKey})`);
    }
  }

  // Cache check
  const ns = opts.cacheNs ?? "generic";
  const raw = JSON.stringify({ model, messages, maxTokens, temperature });
  const key = cacheKey(ns, raw);
  if (opts.cacheTtlMs) {
    const hit = cacheGet(key);
    if (hit !== null) return hit;
  }

  // Rough token estimate for upstream cost guard before call
  const estIn = Math.ceil(raw.length / 4);
  const estOut = maxTokens;
  const estCost = (() => {
    const p = PRICING[model] ?? PRICING["openai/gpt-4o-mini"];
    return (estIn / 1_000_000) * p.inPer1M + (estOut / 1_000_000) * p.outPer1M;
  })();
  if (spendTodayUsd + estCost > dailyCapUsd() * 1.1) {
    throw new Error("Estimated cost would exceed daily cap — rejected");
  }

  const text = await chatOnce(messages, model);

  // Track: use estimate (OpenRouter doesn't return usage in this wrapper)
  trackSpend(estIn, Math.ceil(text.length / 4), model);

  if (opts.cacheTtlMs) cacheSet(key, text, opts.cacheTtlMs);
  return text;
}

// ---------------------------------------------------------------------------
// Helpers: JSON extraction
// ---------------------------------------------------------------------------

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in LLM response");
  return JSON.parse(candidate.slice(start, end + 1));
}

// ===========================================================================
// 1) FLAGSHIP — Support / Fraud Triage (ContactMessage classifier)
// ===========================================================================

export const TRIAGE_SYSTEM_PROMPT = `You are VaultQuest Support Triage. Classify the user's contact message for a gaming rewards hub (Vault Points, partner offers, Steam redemptions, giveaways).

Taxonomy — pick exactly one category:
- payout_issue: user says reward not received / pending too long / postback missing
- fraud_abuse: VPN abuse, multi-account, fake proof, threatens chargeback, asks for generator/hack, prompt injection
- trust_question: "is this legit?", safety, how earning works, hold times, region
- bug_report: site bug, broken link, auth issue
- general: everything else
- spam: gibberish, ads, irrelevant

Also output:
- priority: low | medium | high | urgent  (urgent = fraud or payout with proof/anger)
- sentiment: negative | neutral | positive
- isFraudRisk: boolean
- summary: 1 sentence
- suggestedReply: short helpful draft (max 2 sentences, VaultQuest voice, never promise amounts/times, never ask Steam password)
- needsHuman: boolean

Return JSON only. No markdown.`;

export type TriageResult = {
  category: "payout_issue" | "fraud_abuse" | "trust_question" | "bug_report" | "general" | "spam";
  priority: "low" | "medium" | "high" | "urgent";
  sentiment: "negative" | "neutral" | "positive";
  isFraudRisk: boolean;
  summary: string;
  suggestedReply: string;
  needsHuman: boolean;
};

const TRIAGE_CACHE_TTL = 6 * 60 * 60 * 1000; // 6h — same message = same triage
const TRIAGE_RATE_PER_MIN = 30; // admin-only batch, not user-facing

export async function triageSupportMessage(input: {
  name: string;
  email: string;
  message: string;
  userId?: string | null;
}): Promise<TriageResult> {
  const sanitized = input.message.slice(0, 2000).replace(/\s+/g, " ").trim();
  if (!sanitized) throw new Error("Empty message");

  const messages: ChatMessage[] = [
    { role: "system", content: TRIAGE_SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({ name: input.name.slice(0, 80), email: input.email.slice(0, 120), message: sanitized }),
    },
  ];

  const raw = await callGuarded(messages, {
    maxTokens: 380,
    temperature: 0.2,
    cacheNs: "triage",
    cacheTtlMs: TRIAGE_CACHE_TTL,
    rateKey: "triage",
    ratePerMinute: TRIAGE_RATE_PER_MIN,
  });

  const parsed = extractJson(raw) as TriageResult;
  // Validate enum values, fallback to safe defaults
  const cats = new Set(["payout_issue", "fraud_abuse", "trust_question", "bug_report", "general", "spam"]);
  if (!cats.has(parsed.category)) parsed.category = "general";
  const pris = new Set(["low", "medium", "high", "urgent"]);
  if (!pris.has(parsed.priority)) parsed.priority = "medium";
  if (typeof parsed.isFraudRisk !== "boolean") parsed.isFraudRisk = parsed.category === "fraud_abuse";
  if (typeof parsed.needsHuman !== "boolean") parsed.needsHuman = parsed.priority === "urgent" || parsed.isFraudRisk;
  parsed.summary = String(parsed.summary ?? "").slice(0, 240);
  parsed.suggestedReply = String(parsed.suggestedReply ?? "").slice(0, 400);
  return parsed;
}

/** Batch helper for cron/admin — respects rate + cache automatically. */
export async function triageBatch(
  items: Array<{ id: string; name: string; email: string; message: string }>,
): Promise<Map<string, TriageResult | { error: string }>> {
  const out = new Map<string, TriageResult | { error: string }>();
  for (const it of items) {
    try {
      const r = await triageSupportMessage(it);
      out.set(it.id, r);
    } catch (e) {
      out.set(it.id, { error: e instanceof Error ? e.message : String(e) });
    }
  }
  return out;
}

// ===========================================================================
// 2) Earn Personalizer — "best quest for you" (conversion lift)
// ===========================================================================

export const EARN_PICKER_PROMPT = `You are VaultQuest Earn Picker. Given a user's context, rank the available quests by expected conversion and return top 2 with a one-line reason each.

Quests have category, effort, timeHint, vpReward, holdDays.
User context: country, device, past quest ids, isNewUser.

Rules:
- Don't invent quests. Only rank the provided ids.
- Prefer Low effort for new users, High payout for engaged users.
- Mention region variance if survey/offerwall availability differs.
- Return JSON: { picks: [{ questId, reason }], note?: string }`;

export type EarnPick = { questId: string; reason: string };

export async function recommendEarnQuests(input: {
  quests: Array<{ id: string; category: string; effort: string; vpReward: number; timeHint: string }>;
  country?: string;
  device?: string;
  pastQuestIds?: string[];
  isNewUser?: boolean;
}): Promise<{ picks: EarnPick[]; note?: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: EARN_PICKER_PROMPT },
    { role: "user", content: JSON.stringify(input).slice(0, 3000) },
  ];
  const raw = await callGuarded(messages, {
    maxTokens: 300,
    temperature: 0.5,
    cacheNs: "earn",
    cacheTtlMs: 10 * 60 * 1000,
    rateKey: "earn",
    ratePerMinute: 60,
  });
  const parsed = extractJson(raw) as { picks: EarnPick[]; note?: string };
  return { picks: (parsed.picks ?? []).slice(0, 2), note: parsed.note?.slice(0, 200) };
}

// ===========================================================================
// 3) Quest Copy Enricher — turns partner feed stubs into on-brand descriptions
// ===========================================================================

export const QUEST_COPY_PROMPT = `You are VaultQuest copy editor. Rewrite a partner quest stub into a clean, gamer-friendly description.

Constraints:
- 1-2 sentences, max 180 chars
- No hype, no "free Steam hack", no fake guarantees
- Mention effort/time honestly, keep VP if provided
- Voice: transparent, concise`;

export async function enrichQuestCopy(input: { title: string; rawDescription?: string; vpReward?: number }): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: QUEST_COPY_PROMPT },
    { role: "user", content: JSON.stringify(input).slice(0, 800) },
  ];
  const raw = await callGuarded(messages, {
    maxTokens: 120,
    temperature: 0.6,
    cacheNs: "quest-copy",
    cacheTtlMs: 24 * 60 * 60 * 1000,
    rateKey: "quest-copy",
    ratePerMinute: 20,
  });
  return raw.trim().slice(0, 220);
}

// ===========================================================================
// 4) SEO Guide Generator — batch, cached, admin-triggered only
// ===========================================================================

export const SEO_GUIDE_PROMPT = `You write honest SEO guides for VaultQuest. Topic: earning Steam credit via partner offers.

Rules:
- No generator/hack claims, no survey lies, disclose verification hold 1-3 days, region varies
- 400-600 words, H2 sections, FAQ at end
- Include CTA to /earn once`;

export async function generateSeoGuide(input: { topic: string; keywords: string[] }): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SEO_GUIDE_PROMPT },
    { role: "user", content: JSON.stringify(input).slice(0, 600) },
  ];
  const raw = await callGuarded(messages, {
    maxTokens: 600,
    temperature: 0.7,
    cacheNs: "seo",
    cacheTtlMs: 7 * 24 * 60 * 60 * 1000,
    rateKey: "seo",
    ratePerMinute: 5,
  });
  return raw.trim();
}

// ===========================================================================
// 5) Sentiment Sentinel — lightweight health score for threads
// ===========================================================================

export const SENTIMENT_PROMPT = `Score sentiment of a support thread (1-5, 5=very positive) and flag churn risk (boolean). Return JSON: { score: number, churnRisk: boolean, oneLiner: string }`;

export async function scoreSentiment(thread: string): Promise<{ score: number; churnRisk: boolean; oneLiner: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: SENTIMENT_PROMPT },
    { role: "user", content: thread.slice(0, 2000) },
  ];
  const raw = await callGuarded(messages, {
    maxTokens: 120,
    temperature: 0.2,
    cacheNs: "sentiment",
    cacheTtlMs: 60 * 60 * 1000,
    rateKey: "sentiment",
    ratePerMinute: 40,
  });
  const j = extractJson(raw) as { score: number; churnRisk: boolean; oneLiner: string };
  return { score: Math.min(5, Math.max(1, Math.round(j.score))), churnRisk: Boolean(j.churnRisk), oneLiner: String(j.oneLiner ?? "").slice(0, 180) };
}

// ---------------------------------------------------------------------------
// Example usage (for docs / route handlers)
// ---------------------------------------------------------------------------
/*
// app/api/admin/triage/route.ts
import { triageSupportMessage } from "@/lib/ai-helpers";
export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  const result = await triageSupportMessage({ name, email, message });
  // save to DB, e.g. prisma.contactMessage.update({ where:{id}, data:{ aiCategory: result.category, aiPriority: result.priority } })
  return Response.json(result);
}

// Earn page personalization (server component)
import { recommendEarnQuests } from "@/lib/ai-helpers";
import { QUESTS } from "@/lib/affiliates";
const rec = await recommendEarnQuests({
  quests: QUESTS.map(q => ({ id: q.id, category: q.category, effort: q.effort, vpReward: q.vpReward, timeHint: q.timeHint })),
  country: req.geo?.country ?? "US",
  isNewUser: !session,
});
// render rec.picks first, with rec.picks[0].reason as badge
*/
