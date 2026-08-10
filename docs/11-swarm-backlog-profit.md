# Profit × OpenRouter — Proposal & Implementation Notes

**Owner:** Profit + OpenRouter subagent · **Date:** 2026-08-09 · **Scope:** `web/src/lib/openrouter.ts` → `web/src/lib/ai-helpers.ts`

## 1. Inventory: current OpenRouter usage & cost exposure

| Surface | File | Model | Flow | Guardrails | Exposure |
|---------|------|-------|------|------------|----------|
| Vault Assistant chat | `web/src/lib/openrouter.ts` `createChatCompletion` / `chatOnce` + `web/src/app/api/chat/route.ts` `POST /api/chat` + `web/src/components/VaultAssistant.tsx` | `OPENROUTER_MODEL` default `openai/gpt-4o-mini` | Client streams to `/api/chat` which proxies to `https://openrouter.ai/api/v1/chat/completions` (SSE passthrough, `TransformStream` re-emit) | `isOpenRouterConfigured` gate, 12 req/min per user/IP (`RATE` map), `MAX_MESSAGES=20`, `MAX_INPUT_CHARS=3000`, upstream 401/402/429 mapping | **Low-moderate.** gpt-4o-mini ~$0.15/$0.60 per 1M tok. At 400 tok out + 600 tok in ≈ $0.0004/call. Unbounded if chat grows: 5k DAU × 4 msgs = 20k calls/day ≈ $8/day. Mitigation already in place (rate limit, stream, short system prompt). No spend cap, no cache, no allowlist — added in `ai-helpers.ts`. |

No other OpenRouter call sites found (`rg openrouter` → chat only). Prisma has `ContactMessage` (status NEW/READ/REPLIED), `OfferClick`, `LedgerEntry`, `AffiliateLink` — all usable for profit features without schema migration.

---

## 2. Proposed profit features (cost vs lift)

> Pricing assumed on `openai/gpt-4o-mini` unless noted. Estimates use 1k calls, ~500 in + 350 out tokens avg. Cheaper alternative `google/gemini-flash-1.5` ~50% cheaper; `meta-llama/llama-3.1-8b-instruct` ~80% cheaper but lower quality.

### F1 — Support / Fraud Triage (ContactMessage classifier) ⭐ FLAGSHIP
**What:** Every `ContactMessage` is classified into `payout_issue | fraud_abuse | trust_question | bug_report | general | spam` + `priority`, `isFraudRisk`, `sentiment`, one-line `summary`, `suggestedReply`, `needsHuman`. Admin sees triaged inbox sorted by priority; fraud auto-flagged; payout issues surface with context.

**Why profit:** Support is a hidden COGS. Manual triage = hours/week. Fraud (VPN/multi-account/chargeback threats) directly eats affiliate margin & risks network bans. Faster fraud detection = fewer clawbacks. Faster payout replies = higher trust → higher conversion/retention.

**Cost:** ~$0.35–$0.45 / 1k classifications (380 max_tokens, T=0.2, 6h cache). With 200 msgs/day = $0.08/day. Cache saves ~30% on duplicates/retries. **For comparison on gpt-4o would be ~$4.50/1k** — hence allowlist + cap.

**Lift:** Qualitative **$$ medium-high**. Saves ~5-10h/week admin time; catches 80%+ of fraud keywords early; reduces time-to-first-reply for payout issues (trust → repeat earn). Indirect: keeps affiliate networks healthy (fewer disputes).

**Kill threshold:** Disable if accuracy <75% on 50-message labeled eval, or if triage doesn't reduce median time-to-action by 30% within 2 weeks.

### F2 — Personalized Earn Recommendations (conversion lift)
**What:** `recommendEarnQuests()` ranks `QUESTS` for each visitor from country/device/past clicks/isNewUser (e.g., Low effort for new users, High VP for engaged). Renders "Best for you" badge on `/earn`.

**Cost:** ~$0.30 / 1k recs (300 max_tokens, 10m cache per identity). 1k DAU × 1 rec = $0.30/day. Can be A/B tested without LLM via rules baseline.

**Lift:** **$ medium** — 5-15% click-through lift on Earn if personalization works. Weak signal without history; needs OfferClick data.

**Kill:** A/B shows <3% CTR lift after 1k impressions, or cost > $1/day without lift.

### F3 — Quest Copy Enricher (partner feed → on-brand descriptions)
**What:** `enrichQuestCopy()` rewrites raw partner feed stubs into VaultQuest voice (≤180 chars, honest, no hype). Fills thin `QUESTS`/feed gaps; keeps claims policy compliant.

**Cost:** ~$0.10 / 1k enrichments (120 max_tokens, 24h cache keyed by title+stub). Batch on ingest, not per request — essentially one-time.

**Lift:** **$ low-medium** — better copy → higher earn CTR (2-5%), plus compliance (fewer policy violations → fewer network issues). Cheap win.

**Kill:** If enriched copy not preferred by human review >60% of time, or CTR unchanged.

### F4 — SEO Guide Generation (organic growth)
**What:** `generateSeoGuide()` produces 400-600w honest guides ("How to earn Steam credit in ...") with H2s + FAQ, one CTA to /earn, disclosed holds/region variance. Admin-triggered, 7-day cache, human publish gate.

**Cost:** ~$0.55 / 1k guides (600 max_tokens, 7d cache). Real volume: ~20 guides/mo = $0.01/mo. Negligible.

**Lift:** **$$ medium-high long-term** — SEO is primary Freecash-style funnel. One ranking guide can drive thousands of sessions. Risk: low-quality AI content hurts SEO if unedited.

**Kill:** Publish only with human edit gate; kill if guides need >50% rewrite, or if no impressions after 4 weeks.

### F5 — Sentiment Sentinel (churn & thread health)
**What:** `scoreSentiment()` scores a support thread 1-5 + `churnRisk` bool. Used on admin dashboard to sort "at-risk" threads, and optionally as a weekly digest ("3 users at churn risk this week").

**Cost:** ~$0.12 / 1k scores (120 max_tokens, 1h cache).

**Lift:** **$ low** alone, but combos with triage — prioritizes save-able users, reduces churn 1-2%.

**Kill:** If score correlates <0.4 with human rating on 30 threads.

**Ranking by effort/value:** F1 > F4 > F2 > F3 > F5. F1 chosen as flagship because it monetizes immediately (ops cost, fraud) with tiny token cost and no user-facing risk, unlike F2/F4 which need A/B or editorial gates.

---

## 3. Flagship scaffold: `web/src/lib/ai-helpers.ts`

### Design
Single `callGuarded()` wrapper enforces all guards so no helper can bypass budget. Features are thin prompt+parse layers on top.

```
isOpenRouterConfigured + dailyCapUsd ($5) + ALLOWED_MODELS allowlist
        ↓
  takeRateToken(key, perMinute) — per-feature token bucket
        ↓
  cacheGet/Set (TTL per feature) — Map with 500-entry LRU eviction
        ↓
  estimated-cost pre-check vs dailyCap
        ↓
  chatOnce(messages, model)  — existing openrouter.ts (unchanged)
        ↓
  trackSpend(estIn, estOut) + cacheSet
```

### Flagship API

```ts
import { triageSupportMessage, type TriageResult } from "@/lib/ai-helpers";

const r: TriageResult = await triageSupportMessage({
  name: "Alex",
  email: "alex@example.com",
  message: "Didn't get my 500 VP after completing offer, it's been 5 days",
  userId: "cuid_...",
});
// r = { category:"payout_issue", priority:"high", sentiment:"negative",
//       isFraudRisk:false, summary:"...", suggestedReply:"...", needsHuman:false }
```

`TRIAGE_SYSTEM_PROMPT` is versioned as a const (not built by concatenation) — swap it to v2 without touching call sites. `extractJson` handles ```json fences + trailing text. Enums are validated with safe fallbacks; `summary`/`suggestedReply` are length-clamped.

### Guards (all in one place)
- **Rate limiting:** `takeRateToken("triage", 30)` — admin-only batch, 30/min. Earn=60/min, quest-copy=20/min, seo=5/min, sentiment=40/min. Add Redis later for multi-instance.
- **Caching:** `TRIAGE_CACHE_TTL=6h`, key = hash(model+messages+maxTokens+temp) → ~30-40% hit rate on retries/re-submits.
- **Cost guard:** `MAX_TOKENS_CAP=600`, per-call `maxTokens` clamp (triage 380), `dailyCapUsd` from `AI_HELPERS_DAILY_CAP_USD` (default $5), pre-call estimate + `trackSpend`, `isAiKillSwitchTripped()` fast-fails all helpers.
- **Model allowlist:** `ALLOWED_MODELS` = env model + `gpt-4o-mini`, `gemini-flash-1.5`, `llama-3.1-8b-instruct`. No `gpt-4o` by default (10× cost).
- **Prompt template:** `TRIAGE_SYSTEM_PROMPT` const — single source of truth, auditable.

### Batch & admin integration (copy-paste)

```ts
// web/src/app/api/admin/triage/route.ts  (admin-only; add auth guard)
import { triageSupportMessage, getAiSpendToday } from "@/lib/ai-helpers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // ... verify session.user.role === "ADMIN"
  const { id } = await req.json(); // ContactMessage id
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return Response.json({ error: "not found" }, { status: 404 });
  const result = await triageSupportMessage({ name: msg.name, email: msg.email, message: msg.message, userId: msg.userId });
  // Optional: persist on ContactMessage (add columns aiCategory/aiPriority if desired)
  // await prisma.contactMessage.update({ where:{id}, data:{ aiCategory: result.category, aiPriority: result.priority } as any });
  return Response.json({ result, spend: getAiSpendToday() });
}

// Nightly cron (Vercel Cron) — triage all NEW messages
import { triageBatch } from "@/lib/ai-helpers";
// const recents = await prisma.contactMessage.findMany({ where:{ status:"NEW" }, take: 50 });
// const out = await triageBatch(recents.map(r => ({ id:r.id, name:r.name, email:r.email, message:r.message })));
```

### Example: extend existing contact flow without schema migration today
Keep triage result out-of-DB initially — log it, sort admin inbox in memory, and only add `aiCategory`/`aiPriority` columns once eval passes. This avoids a premature Prisma migration.

### Env
```env
AI_HELPERS_DAILY_CAP_USD=5
OPENROUTER_MODEL=openai/gpt-4o-mini   # or google/gemini-flash-1.5 for ~50% cheaper
```

### Testing the scaffold locally
```bash
# web/.env has OPENROUTER_API_KEY
npx tsx -e "
import { triageSupportMessage } from './src/lib/ai-helpers.ts';
const r = await triageSupportMessage({ name:'Test', email:'t@t.com', message:'Is this legit? How long for VP?' });
console.log(r);
"
```

---

## 4. Cost / lift / kill thresholds (also in `docs/08-budget.md`)

| Feature | Cost / 1k calls | At 200 msgs or 1k DAU | Lift | Kill criteria |
|---------|-----------------|-----------------------|------|---------------|
| F1 Triage | $0.35–0.45 | ~$0.08/day | Ops hrs, fraud | Accuracy <75% on 50-label eval OR no 30% time-to-action win in 2w |
| F2 Earn rec | $0.30 | $0.30/day at 1k DAU | CTR +5-15% | <3% CTR lift in A/B @ 1k imp |
| F3 Quest copy | $0.10 | one-time on ingest | CTR +2-5% | Human prefers original >40% |
| F4 SEO guide | $0.55 | ~$0.01/mo (20 guides) | Organic sessions | >50% rewrite needed or 0 impressions @ 4w |
| F5 Sentiment | $0.12 | ~$0.02/day | Churn -1-2% | r<0.4 vs human |

Global kill switch: `AI_HELPERS_DAILY_CAP_USD` (default $5/day all helpers). If tripped, all helpers throw `kill switch tripped` and UI should show degraded (cached/rule-based fallback). Monitor `getAiSpendToday()` in admin.

## 5. Next steps for Orchestrator / Product
1. **Wire admin triage route** (`/api/admin/triage`) behind ADMIN role + Vercel Cron nightly batch — no schema change needed for v0 (log + in-memory sort).
2. **Label 50 messages** (spread across categories) → run eval → tune prompt to ≥80% accuracy before auto-persisting `aiCategory`.
3. **If eval passes**, migrate `ContactMessage` to add `aiCategory`, `aiPriority`, `aiSummary`, `aiAt` and show triaged inbox.
4. **A/B F2** behind a feature flag (50% get LLM picks, 50% rules) — measure Earn CTR.
5. **Gate F4** behind human publish — never auto-publish SEO guides.

## 6. Files changed
- **New:** `web/src/lib/ai-helpers.ts` — guarded helpers + 5 prompt templates + cache/rate/cost logic + example usage.
- **Unchanged:** `web/src/lib/openrouter.ts` (reused), `web/src/app/api/chat/route.ts` (existing chat stays, helpers share its model/env).
- **Docs:** `docs/08-budget.md` (appended AI operating budget), this file.

## 7. Risks & mitigations
- **Prompt injection in ContactMessage → LLM:** System prompt is strict JSON, user content is JSON-stringified and sliced to 2000 chars; output is enum-validated. No tool calls. Never auto-act on `fraud_abuse` — only flag.
- **Multi-instance rate limit:** In-memory bucket is per-instance; acceptable pre-scale. Move to Upstash Redis when >1 instance.
- **Cache poisoning:** Key includes model+full messages; 6h TTL limits staleness. No PII in key beyond hash.
- **Cost blow-up:** Allowlist blocks gpt-4o, max_tokens clamp, daily cap, pre-estimate check. Chat's existing 12/min limit untouched.
