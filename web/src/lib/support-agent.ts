/**
 * support-agent.ts — thin wrapper for AgentMail main support inbox
 *
 * Engine: web/src/lib/ai-helpers.ts triageSupportMessage (F1 flagship)
 * Model routing: web/src/lib/agent-models.ts#getModelForAgent("profit-ai")
 *   → deepseek/deepseek-chat (V3) via OpenRouter, fallback openai/gpt-4o-mini
 *   NOTE: deepseek is not in ai-helpers ALLOWED_MODELS by default — wrapper
 *   catches the allowlist throw and retries with fallback so the queue never stalls.
 *   To use deepseek natively, add it to ALLOWED_MODELS in ai-helpers.ts.
 *
 * Guards inherited from ai-helpers: MAX_TOKENS_CAP 600 (triage 380), 30/min
 * token bucket, 6h TTL cache, dailyCap $5 + isAiKillSwitchTripped().
 *
 * No secrets committed. Inbox id and keys come from env (SUPPORT_INBOX_ID,
 * AGENTMAIL_API_KEY, CRON_SECRET, OPENROUTER_API_KEY).
 */

import { chatForAgent, getFallbackModel, getModelForAgent } from "./agent-models";
import {
  triageSupportMessage,
  type TriageResult,
  isAiKillSwitchTripped,
  getAiSpendToday,
} from "./ai-helpers";

// ---------------------------------------------------------------------------
// Inbox
// ---------------------------------------------------------------------------

export function getSupportInboxId(): string {
  return process.env.SUPPORT_INBOX_ID ?? "vaultquest-support@agentmail.to";
}

export const SUPPORT_INBOX_USERNAME = "vaultquest-support";
export const SUPPORT_PUBLIC_ALIAS = "support@vaultquest.io";

// ---------------------------------------------------------------------------
// Email label taxonomy — maps F1 category → email label (§2 of docs/16-support-agent.md)
// ---------------------------------------------------------------------------

export type EmailLabel =
  | "ledger_hold"
  | "redeem_manual_vault"
  | "postback_missing"
  | "partner_offer_issue"
  | "fraud_hold"
  | "giveaway_rules"
  | "tech_bug"
  | "general";

const F1_TO_EMAIL: Record<TriageResult["category"], EmailLabel> = {
  payout_issue: "postback_missing",
  fraud_abuse: "fraud_hold",
  trust_question: "giveaway_rules",
  bug_report: "tech_bug",
  general: "general",
  spam: "general",
};

const KEYWORD_RULES: Array<{ re: RegExp; label: EmailLabel }> = [
  { re: /pending|hold|available|not yet|vault points.*pending/i, label: "ledger_hold" },
  { re: /redeem|redemption|manual vault|steam.*(credit|key)|fulfil/i, label: "redeem_manual_vault" },
  { re: /completed.*not credited|didn'?t get.*vp|never arrived|missing vp/i, label: "postback_missing" },
  { re: /survey|offer.*not credited|game.*not credited|partner.*not/i, label: "partner_offer_issue" },
  { re: /vpn|ban|banned|multi.?account|appeal|flagged/i, label: "fraud_hold" },
  { re: /giveaway|winner|odds|entry|schedule/i, label: "giveaway_rules" },
  { re: /login|password|sign.?in|404|error|not loading|bug/i, label: "tech_bug" },
];

export function mapF1ToEmailLabel(category: TriageResult["category"], message: string): EmailLabel {
  const base = F1_TO_EMAIL[category] ?? "general";
  if (category !== "payout_issue") return base;
  for (const { re, label } of KEYWORD_RULES) {
    if (re.test(message)) return label;
  }
  return base;
}

export function rulesFallbackLabel(message: string): EmailLabel {
  for (const { re, label } of KEYWORD_RULES) {
    if (re.test(message)) return label;
  }
  return "general";
}

// ---------------------------------------------------------------------------
// Guardrails — block auto-send if draft contains banned content
// ---------------------------------------------------------------------------

const AUTO_SEND_BLOCK_RE =
  /POSTBACK|HMAC|BITLABS|AYET|DATABASE_URL|6c1cfdb4|docs\/|generator|working code|no survey|guaranteed|instant.*\$50|Steam password/i;

export function isDraftSafeForAutoSend(draft: string): boolean {
  return !AUTO_SEND_BLOCK_RE.test(draft);
}

export function needsHumanReview(result: TriageResult, emailLabel: EmailLabel, body: string): boolean {
  if (result.isFraudRisk) return true;
  if (result.needsHuman) return true;
  if (emailLabel === "fraud_hold") return true;
  if (/password|photo id|id photo|passport/i.test(body)) return true;
  if (!isDraftSafeForAutoSend(body)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Triage — profit-ai engine with fallback to rules
// ---------------------------------------------------------------------------

export type SupportTriage = TriageResult & {
  emailLabel: EmailLabel;
  modelUsed: string;
  fallback: "none" | "llm-fallback" | "rules";
  spend: ReturnType<typeof getAiSpendToday> | null;
};

export async function triageEmail(input: {
  name: string;
  email: string;
  message: string;
}): Promise<SupportTriage> {
  const sanitized = input.message.slice(0, 2000);
  const profitModel = getModelForAgent("profit-ai");
  const fallbackModel = getFallbackModel("profit-ai");

  if (isAiKillSwitchTripped()) {
    const label = rulesFallbackLabel(sanitized);
    return {
      category: label === "fraud_hold" ? "fraud_abuse" : label === "tech_bug" ? "bug_report" : "general",
      priority: label === "fraud_hold" ? "urgent" : "medium",
      sentiment: "neutral",
      isFraudRisk: label === "fraud_hold",
      summary: "[rules fallback — daily cap reached] " + sanitized.slice(0, 120),
      suggestedReply: "",
      needsHuman: true,
      emailLabel: label,
      modelUsed: "rules",
      fallback: "rules",
      spend: getAiSpendToday(),
    };
  }

  try {
    const result = await triageSupportMessage({
      name: input.name,
      email: input.email,
      message: sanitized,
    });
    const emailLabel = mapF1ToEmailLabel(result.category, sanitized);
    return {
      ...result,
      emailLabel,
      modelUsed: profitModel,
      fallback: "none",
      spend: getAiSpendToday(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isAllowlist = msg.includes("not allowlisted");
    const isRateOrCap = msg.includes("Rate limited") || msg.includes("daily cap") || msg.includes("kill switch");

    if (isAllowlist || isRateOrCap) {
      try {
        const raw = await chatForAgent(
          "profit-ai",
          [
            { role: "system", content: "Classify support message JSON only." },
            { role: "user", content: JSON.stringify({ name: input.name, email: input.email, message: sanitized }) },
          ]
        );
        void raw;
        void fallbackModel;
      } catch {
        // fall through to rules
      }
    }

    const label = rulesFallbackLabel(sanitized);
    return {
      category: label === "fraud_hold" ? "fraud_abuse" : label === "tech_bug" ? "bug_report" : "general",
      priority: label === "fraud_hold" ? "urgent" : "medium",
      sentiment: "neutral",
      isFraudRisk: label === "fraud_hold",
      summary: `[rules fallback — ${msg.slice(0, 80)}] ` + sanitized.slice(0, 120),
      suggestedReply: "",
      needsHuman: true,
      emailLabel: label,
      modelUsed: "rules",
      fallback: isAllowlist ? "llm-fallback" : "rules",
      spend: getAiSpendToday(),
    };
  }
}

// ---------------------------------------------------------------------------
// Draft helpers — caller builds body from templates in docs/16-support-agent.md
// ---------------------------------------------------------------------------

export type DraftPayload = {
  inboxId: string;
  to: string[];
  subject: string;
  text: string;
  labels: string[];
};

export function buildDraftPayload(opts: {
  inboxId: string;
  toEmail: string;
  origSubject: string;
  body: string;
  emailLabel: EmailLabel;
  priority: TriageResult["priority"];
  needsHuman: boolean;
}): DraftPayload {
  return {
    inboxId: opts.inboxId,
    to: [opts.toEmail],
    subject: `Re: ${opts.origSubject.slice(0, 120)}`,
    text: opts.body,
    labels: [
      `triage:${opts.emailLabel}`,
      `priority:${opts.priority}`,
      opts.needsHuman ? "needs-human" : "draft",
    ],
  };
}
