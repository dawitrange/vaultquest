# Budget framework

## Initial investment

Willing to spend **$1,000+** across website build and/or marketing to launch.

## Allocation guide (flexible)

| Bucket | Suggested slice | Examples |
|--------|-----------------|----------|
| Foundation | ~$50–150 | Domain, DNS, hosting (Vercel/Cloudflare), transactional email, analytics |
| Product / fulfillment float | ~$100–400 | First Steam GC/key vault for redemptions + giveaways; optional paid APIs |
| Build | ~$0–300 | Prefer agent-built; pay for UI kits / tools only if they clearly speed launch |
| Marketing tests | ~$300–600 | YouTube/Meta/TikTok tests **after** landing + honest claims policy |
| Expansion reserve | remainder | Spend when ROI is clear |

## Expansion rule

Whenever a paid tool, service, inventory float, or ad test can **clearly expand** the business (higher conversion, more inventory, better trust, lower ops cost), **propose it** with:

1. Cost  
2. Expected lift  
3. Kill criteria if it fails  

Owner approves before spend. Prefer free/cheap until ROI is clear.

## Hybrid-specific spend priorities

1. Domain `vaultquest.*` + hosting + email  
2. Small Steam vault for first redemptions/giveaways (trust)  
3. Creator/organic content tooling if needed  
4. Paid traffic: claims policy on the live landing is required. **Owner override 2026-08-16:** weekly ad tests and aggressive spend for quick gains toward the $40k car are allowed. Earn-live work runs **in parallel** (do not scale into a dead `/earn` catalog). Caps, UTM, and kill rules: `docs/ops/ads-weekly-protocol.md`. Overnight Manager paste: `docs/20-overnight-manager.md`.  

## AI operating budget — OpenRouter (added 2026-08-09)

All helpers run through `web/src/lib/ai-helpers.ts` → `callGuarded()` (rate limit + TTL cache + cost guard + model allowlist). Env: `OPENROUTER_MODEL` (default `openai/gpt-4o-mini`), `AI_HELPERS_DAILY_CAP_USD` (default `5`). Existing Vault Assistant chat (`/api/chat`, 12/min, streaming) is separate and unchanged.

| Bucket | What | Cost / 1k calls* | Typical vol | Cost/day or mo | Lift | Kill criteria |
|--------|------|------------------|-------------|----------------|------|---------------|
| **Flagship: Support Triage** (`triageSupportMessage`, 380 tok, T=0.2, 6h cache, 30/min) | Classify `ContactMessage` → category/priority/fraud/sentiment/suggestedReply | $0.35–0.45 on gpt-4o-mini | ~200 msgs/day | ~$0.08/day | Saves 5–10h/week ops; catches fraud early; faster payout replies → trust/retention | Disable if accuracy <75% on 50-label eval OR no 30% time-to-action improvement in 2 weeks |
| Earn Personalizer (`recommendEarnQuests`, 300 tok, 10m cache, 60/min) | Rank `QUESTS` per user (country/device/history) | $0.30 | 1k DAU ×1 | $0.30/day | CTR +5–15% on `/earn` | Kill if A/B <3% CTR lift @ 1k imp or >$1/day without lift |
| Quest Copy Enricher (`enrichQuestCopy`, 120 tok, 24h cache, 20/min) | Rewrite partner stubs → on-brand (≤180 chars) | $0.10 | one-time on ingest | negligible | CTR +2–5%, compliance | Kill if human prefers original >40% |
| SEO Guide Gen (`generateSeoGuide`, 600 tok, 7d cache, 5/min, human publish gate) | 400–600w honest guides + FAQ → `/earn` CTA | $0.55 | ~20/mo | ~$0.01/mo | Organic sessions (long-term) | Kill if >50% rewrite needed or 0 impressions @ 4w |
| Sentiment Sentinel (`scoreSentiment`, 120 tok, 1h cache, 40/min) | Thread score 1–5 + churnRisk | $0.12 | low | ~$0.02/day | Churn −1–2% with triage | Kill if r<0.4 vs human on 30 threads |

\* gpt-4o-mini pricing $0.15/$0.60 per 1M. `google/gemini-flash-1.5` ~50% cheaper, `meta-llama/llama-3.1-8b-instruct` ~80% cheaper (allowlisted). gpt-4o would be ~10× — blocked by allowlist.

**Guardrails:** `MAX_TOKENS_CAP=600` per call; per-feature token-bucket rate limits; TTL caches (6h triage, 24h copy, 7d SEO); `dailyCapUsd` pre-estimate check; `isAiKillSwitchTripped()` fast-fails all helpers when `$AI_HELPERS_DAILY_CAP_USD` reached; admin monitors `getAiSpendToday()`. In-memory rate/cache is per-instance — move to Redis (Upstash) when scaling past one instance. Full proposal: `docs/11-swarm-backlog-profit.md`.

**Global kill switch:** If combined helpers hit `AI_HELPERS_DAILY_CAP_USD` (default $5/day), all helpers error and callers must fall back to rules/cache. Owner can lower cap to $1–2/day during testing. Review weekly: if helpers don't meet lift thresholds above, disable individually before raising cap.  
