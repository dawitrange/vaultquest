/**
 * VaultQuest — Heterogeneous model smoke test
 * Hits OpenRouter once per agent with that agent's assigned model.
 *
 * Usage (PowerShell):
 *   $env:OPENROUTER_API_KEY="sk-or-v1-..."; npx tsx web/scripts/test-agent-models.ts
 * Usage (bash):
 *   OPENROUTER_API_KEY=sk-or-v1-... npx tsx web/scripts/test-agent-models.ts
 *   # Or rely on web/.env — dotenv will load it
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load web/.env if not already env-provided
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "web/.env") });

import { chatForAgent, getFallbackModel, AGENT_MODELS, type AgentId } from "../src/lib/agent-models";

const PROMPTS: Record<AgentId, string> = {
  "vault-planner": "In one sentence, what is VaultQuest's VP economy (100 VP = $1)?",
  "competitor-researcher": "Summarize in 10 words: what makes a rewards site look transparent?",
  "partner-researcher": "Extract as JSON: offer pays $1.20, cap 50/day, vertical: gaming. Return {payout, cap, vertical}.",
  "trust-designer": "Write a 6-word transparent tagline for a gaming rewards hub (no 'honest' word).",
  "profit-ai": "If payout is $1.20 and we award 100 VP ($1.00), what is margin %? One number.",
  "eng-qa": "Return a one-line TypeScript type for a ledger entry: id, userId, vp, status.",
  "db-guardian": "In 10 words, what is the Neon branching backup cadence for VaultQuest?",
  "end-user-auditor": "List 3 checks an anon user would use to spot a scam rewards site.",
};

async function testOne(agentId: AgentId): Promise<void> {
  const cfg = AGENT_MODELS[agentId];
  process.stdout.write(`\n[${agentId}] model=${cfg.model} — `);
  try {
    const text = await chatForAgent(agentId, [{ role: "user", content: PROMPTS[agentId] }]);
    const preview = text.replace(/\s+/g, " ").slice(0, 160);
    console.log(`OK (${text.length} chars): "${preview}${text.length > 160 ? "…" : ""}"`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRetryable = /429|503|404|model/i.test(msg);
    if (isRetryable) {
      const fallback = getFallbackModel(agentId);
      process.stdout.write(`retry fallback ${fallback} — `);
      try {
        const { chatOnce } = await import("../src/lib/openrouter");
        const text = await chatOnce([{ role: "user", content: PROMPTS[agentId] }], fallback);
        const preview = text.replace(/\s+/g, " ").slice(0, 160);
        console.log(`OK via fallback (${text.length} chars): "${preview}${text.length > 160 ? "…" : ""}"`);
        return;
      } catch (e2: unknown) {
        console.log(`FAIL fallback: ${e2 instanceof Error ? e2.message.slice(0, 300) : String(e2).slice(0, 300)}`);
        return;
      }
    }
    console.log(`FAIL: ${msg.slice(0, 400)}`);
  }
}

async function main(): Promise<void> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY not set. Set it in env or web/.env");
    process.exit(1);
  }
  console.log("VaultQuest agent model smoke test — OpenRouter");
  console.log(`Base: ${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}`);
  const agents = Object.keys(AGENT_MODELS) as AgentId[];
  for (const id of agents) {
    await testOne(id);
  }
  console.log("\nDone. All 6 agents attempted. Check failures above; 429/404 will auto-retry fallback.");
  console.log("One-liner (PowerShell):  $env:OPENROUTER_API_KEY=\"sk-or-v1-...\"; npx tsx web/scripts/test-agent-models.ts");
  console.log("One-liner (bash):        OPENROUTER_API_KEY=sk-or-v1-... npx tsx web/scripts/test-agent-models.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
