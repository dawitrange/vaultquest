# Vaultquest — Heterogeneous Model Routing (OpenRouter)

> One OpenRouter key, seven specialist models (6 + fallback DB master). Keeps costs low while matching reasoning power to the task.

## Mapping

| Agent | OpenRouter Model | Cost (in / out per 1M) | Strength | Fallback |
|---|---|---|---|---|
| @vault-planner | `anthropic/claude-sonnet-4` | $3.00 / $15.00 | Long-context planning, arbitration, vault_plan.md synthesis | `anthropic/claude-3.5-sonnet` |
| @competitor-researcher | `google/gemini-2.0-flash-001` | $0.10 / $0.40 | Fast vision + summarization at scale (Apify crawl batches) | `google/gemini-flash-1.5` |
| @partner-researcher | `openai/gpt-4o-mini` | $0.15 / $0.60 | Precise structured extraction, function-calling | `openai/gpt-4o-mini-2024-07-18` |
| @trust-designer | `anthropic/claude-3.5-sonnet` | $3.00 / $15.00 | Creative tone control, transparent design copy | `openai/gpt-4o` |
| @profit-ai | `deepseek/deepseek-chat` | $0.27 / $1.10 | Cost-efficient analytical reasoning (DeepSeek-V3), margin math | `openai/gpt-4o-mini` |
| @eng-qa | `qwen/qwen-2.5-coder-32b-instruct` | $0.17 / $0.70 | Code-specialized TS/Prisma/Next.js | `deepseek/deepseek-coder` |
| @db-guardian | `meta-llama/llama-3.3-70b-instruct` | $0.59 / $0.79 | Fallback + DB master — Neon branching, backup/restore, ledger integrity, DR | `qwen/qwen-2.5-72b-instruct` |

Pricing snapshot 2026-08-09 from https://openrouter.ai/models — check live before budgeting.

### Rationale

- **vault-planner** needs the strongest reasoning model; Sonnet 4 (successor to 3.5 Sonnet) handles long-context trade-off arbitration.
- **competitor-researcher** needs throughput — Gemini 2.0 Flash is ~30× cheaper than Sonnet and handles image + text crawl summarization.
- **partner-researcher** needs extraction accuracy per-offer — GPT-4o-mini is battle-tested for JSON extraction at ~$0.15/1M in.
- **trust-designer** needs tonal nuance — Claude 3.5 Sonnet is best at transparent, gamer-friendly copy without overusing "honest".
- **profit-ai** needs cheap analytical depth — DeepSeek-V3 (deepseek-chat) gives near-GPT-4 reasoning at ~10× lower cost for VP simulations.
- **eng-qa** needs code focus — Qwen 2.5 Coder 32B is specialized for codegen/review and very cheap; DeepSeek-Coder as fallback.
- **db-guardian** needs reliable ops/DB reasoning without paying Sonnet rates — Llama 3.3 70B balances reliability for recovery runbooks + migrations at ~$0.59/$0.79 (5× cheaper than Claude), with Qwen 72B fallback for code-heavy recovery; distinct from Qwen 32B coder and planning Claudes so no collision.

## Source of truth

- `.cursor/agent-models.json` — JSON map consumed by tooling/docs.
- `web/src/lib/agent-models.ts` — TypeScript mirror: `AGENT_MODELS`, `getModelForAgent(agentId)`, `chatForAgent(agentId, messages)`, `getFallbackModel(agentId)`.
- `.cursor/agents/<agent>.md` — per-agent frontmatter `model:` / `openrouter_model:` header.

Keep JSON and TS in sync when changing models.

## Web-side routing (Vaultquest features)

`web/src/lib/openrouter.ts` already accepts `model` param on `createChatCompletion`/`chatOnce`. `agent-models.ts` wraps it:

```ts
import { chatForAgent } from "@/lib/agent-models";
const answer = await chatForAgent("profit-ai", [{ role: "user", content: "Simulate VP margin at $1.20 payout" }]);
// internally calls chatOnce(messages, "deepseek/deepseek-chat")
```

`/api/chat` (Vault Assistant SSE) continues to use `getOpenRouterModel()` default; agent-specific routes call `chatForAgent`.

For streaming per-agent, use `createChatCompletion({ messages, model: getModelForAgent("eng-qa"), stream: true })`.

Fallback: on 429/404 (model overloaded or deprovisioned), retry with `getFallbackModel(agentId)`. See `web/scripts/test-agent-models.ts` for pattern.

## Cursor IDE — pointing the model picker at OpenRouter (optional)

To let Cursor's agent/model picker itself call through OpenRouter rather than just our `web/` runtime:

1. Cursor Settings → Models → **Override OpenAI Base URL** → `https://openrouter.ai/api/v1`
2. Add API Key → `OPENROUTER_API_KEY` (same `sk-or-v1-...` as `web/.env`)
3. Enable **OpenAI** provider (now routed to OpenRouter).
4. In Chat/Agent model dropdown, select `openrouter/<model-id>` (e.g., `openrouter/anthropic/claude-sonnet-4`). If `openrouter/*` entries don't appear, type the full ID as custom model.

> Our `web/` routing simulates heterogeneous agents even if Cursor's picker doesn't natively support per-agent OpenRouter models — each skill/script simply calls `chatForAgent(id, ...)` with its assigned model.

## Test harness

```bash
# PowerShell (from repo root)
$env:OPENROUTER_API_KEY="sk-or-v1-..."; npx tsx web/scripts/test-agent-models.ts

# bash
OPENROUTER_API_KEY=sk-or-v1-... npx tsx web/scripts/test-agent-models.ts

# or rely on web/.env (dotenv loads it) — requires tsx
npx tsx web/scripts/test-agent-models.ts
```

The script hits OpenRouter once per agent with a tiny prompt (<30 tokens), prints `OK (N chars)` per agent, and auto-retries fallback on 429/404. Expect ~$0.01 total for a full run.

Prereq: `npm install -D tsx dotenv` if not already present (check `web/package.json`).

## Coordination with builder subagent (536ee7e9-8f35-4be6-b07a-c7bb3311de2f)

- `.cursor/agents/` did not exist — created fresh; if the builder later creates personas, merge frontmatter `model:` fields rather than overwriting body content.
- Skills in `.cursor/skills/` (if added by builder) should import `getModelForAgent` instead of hardcoding model strings.
- `vault_plan.md` / `task_logs.md` not yet present — append the table above to `vault_plan.md` when the builder creates it, or keep this doc as the canonical reference and link it.

## Change log

- 2026-08-09: Add @db-guardian (meta-llama/llama-3.3-70b-instruct, fallback qwen-72b) — fallback + DB master, backup scaffolding `web/src/lib/backup.ts` + `docs/13-db-backup.md`.
- 2026-08-09: Initial heterogeneous routing — 6 agents, JSON+TS source of truth, test harness.
