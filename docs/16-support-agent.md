# 16 — Support Agent (AgentMail + F1 Triage)

**Owner:** Support agent strategist · **Date:** 2026-08-10
**Status:** Stage-only — inbox recommendation + runbook + templates for Ethio review. No deploy/push this turn.
**Depends on:** `docs/14-mcp-setup.md` (AgentMail MCP green `plugin-agentmail-agentmail ready`), `web/src/lib/ai-helpers.ts` F1 `triageSupportMessage` (737 lines, `callGuarded`, `MAX_TOKENS_CAP 600`, 6h cache, kill switch `AI_HELPERS_DAILY_CAP_USD=5`), `web/src/lib/agent-models.ts` + `.cursor/agent-models.json` (profit-ai = `deepseek/deepseek-chat`), `docs/00-master-brief.md` margin rule, `docs/01-brand.md` voice, `docs/05-platform-vision.md` ledger, `docs/08-budget.md` cost/lift/kill, `docs/10-legitimacy-application-pack.md` §1/5, `docs/agents/compliance.md`, `web/prisma/schema.prisma` `ContactMessage`, `web/src/lib/email.ts`.

## 1 — Inbox choice (discovered via MCP)

**Live discovery (2026-08-10 22:45 UTC — updated):**

```
list_inboxes (before) → 1 inbox: dawit-5378@agentmail.to (org_3HhjpRbyaffeAnSB0ySmjfcTkcO)
create_inbox username="vaultquest-support" displayName="VaultQuest Support" → 201
  vaultquest-support@agentmail.to (inboxId same, createdAt 2026-08-10T02:45:52.055Z)
list_inboxes (after) → 2 inboxes: dawit-5378@agentmail.to + vaultquest-support@agentmail.to
```

**Forwarding note (manual DNS step — not automatable via AgentMail MCP):** `support@vaultquest.io` is a public alias. It must forward to `vaultquest-support@agentmail.to` via either (a) your domain registrar's email forward, (b) Resend inbound route, or (c) Cloudflare Email Routing — document which you chose before announcing. `SUPPORT_INBOX_ID=vaultquest-support@agentmail.to` already set in `web/.env.example`. `web/src/app/contact/page.tsx` + `web/src/components/SiteFooter.tsx` now link `support@vaultquest.io`.

**Recommendation — one main support inbox first:**


| Inbox                | Username                                                 | Purpose                                                                                                                                                                            | When                                                                             |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Primary (create)** | `vaultquest-support` → `vaultquest-support@agentmail.to` | Main support account where the agent runs. Public-facing `support@vaultquest.io` forwards to this inbox (via AgentMail forwarding or Vercel). All triage + drafts live here.       | Create now (see snippet). Use as the single source until volume justifies split. |
| Optional later       | `vault-ops` → `vault@agentmail.to`                       | Ledger / manual vault ops — only if redemption volume makes the main inbox noisy. Starts as a **label** inside primary, not a second inbox, until you hit ~50 redeem threads/week. | Defer. Add label `vault-ops` inside primary first.                               |
| Keep                 | `dawit-5378@agentmail.to`                                | Fallback / owner DM channel. Do not publish.                                                                                                                                       | Leave as-is.                                                                     |


**Why one inbox first:** One queue keeps SLA honest (24–48h per vault manual), avoids missed threads across two inboxes, and keeps the agent's `list_threads` poll cheap (one cron). Split only when label volume proves it.

**Create call (paste in Cursor when ready — idempotent via clientId):**

```ts

```

If AgentMail blocks the username (taken), fallback `vaultquest-help` then `support-vaultquest`. Never create `support@vaultquest.io` directly on AgentMail if that domain is claimed elsewhere — use `vaultquest-support@agentmail.to` internally and forward `support@vaultquest.io` (Resend/forward rule) to it so the public address stays clean.

**Contact path after wiring:**

```
/contact (Next.js form → ContactMessage + Resend)  ─┐
vaultquest-support@agentmail.to (direct email) ──────┼─→ same triage queue (see §5)
Vault Assistant chat (/api/chat) ────────────────────┘   chat stays separate; email is main support account
```

Add `support@vaultquest.io` to `SiteFooter` + `/contact` subcopy + `/proof` §9 once the forward is live. Keep `CONTACT_TO_EMAIL` (Resend) for the form path — agent inbox is additive, not replacement, for 1–2 weeks until the poll proves reliable.

## 2 — Triage taxonomy (maps to F1 `TRIAGE_SYSTEM_PROMPT`)

F1 currently emits 6 categories (`payout_issue | fraud_abuse | trust_question | bug_report | general | spam`). Email needs finer ops labels. Extend with 8 email labels that **map 1:1** to an F1 category so `triageSupportMessage` stays the engine and the wrapper only adds routing.


| #   | Email label           | F1 category                           | What it is                                                                  | Priority default     | SLA                                        | Action                                                                                                              |
| --- | --------------------- | ------------------------------------- | --------------------------------------------------------------------------- | -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `ledger_hold`         | `payout_issue`                        | VP shows pending / not yet available; user asks when it clears              | medium               | 24h (holds are 3–14d, manual vault 24–48h) | **Draft** via template 2 — cite `/account` + `availableAt`, never promise early release                             |
| 2   | `redeem_manual_vault` | `payout_issue`                        | Redemption requested / timing / vault queue                                 | medium→high if >48h  | 24h                                        | **Draft** via template 3 — acknowledge, state 24–48h window, link `/rewards`                                        |
| 3   | `postback_missing`    | `payout_issue`                        | Quest completed but VP never arrived                                        | high                 | 24h                                        | **Draft** then human-verify `OfferClick` + `LedgerEntry` before send; template 1/7                                  |
| 4   | `partner_offer_issue` | `payout_issue`                        | Survey/game partner says completed but not credited; or partner link broken | high                 | 24h                                        | **Draft** via template 7 — explain partner verification, ask for partner tx/screenshot, no yield promise            |
| 5   | `fraud_hold`          | `fraud_abuse`                         | VPN / multi-account / ban / appeal                                          | urgent               | 24h, human within 12h                      | **Never auto-send.** Create draft flagged `needsHuman:true`, escalate to human review. Template 5 only after review |
| 6   | `giveaway_rules`      | `trust_question`                      | Eligibility, odds, schedule, winner proof                                   | low→medium           | 48h                                        | **Auto-send eligible** if confidence high and no PII; template 4. Otherwise draft                                   |
| 7   | `tech_bug`            | `bug_report`                          | Login, auth, 404, balance not loading                                       | medium→high          | 24h                                        | **Draft** + open task; template 6                                                                                   |
| 8   | `general`             | `general` / `trust_question` / `spam` | Trust "is this legit?", region, age, everything else                        | low (spam: no reply) | 48h                                        | Auto-send for trust FAQ if clean; draft otherwise                                                                   |


**Priority slicing on top of F1:** triage returns `priority` (low/medium/high/urgent) + `isFraudRisk` + `needsHuman`. Email wrapper upgrades:

- Any `isFraudRisk:true` or `fraud_hold` → `needsHuman:true`, urgent, never auto-send.
- Any PII (Steam password, reset link, photo ID) in body → force `needsHuman:true`.
- Any amount/time promise in draft → block auto-send (guardrail regex, see §4).
- `general` + spam → label `spam`, no draft, close after 7d.

**Output stored per thread (no schema migration yet):** thread labels `triage:<label>`, `priority:<p|h|u>`, `vp:<holdDays>` via `update_thread`; draft body carries `aiCategory/aiPriority` in first line comment for admin search. When eval passes (≥80% accuracy on 50 labeled, see §6), migrate `ContactMessage` to add `aiCategory aiPriority aiSummary aiAt` per `docs/11-swarm-backlog-profit.md` §5.

## 3 — Plan → email workflow

```
Inbound email (vaultquest-support@agentmail.to)
  ↓  list_threads labels:inbox:unread (cron every 15m) or search_messages
  ↓  get_thread → extract sender, subject, body (slice 2000 chars, JSON-stringified)
  ↓
  ┌─ call triageSupportMessage({name,email,message}) ──────────────────────┐
  │ Engine: web/src/lib/ai-helpers.ts:callGuarded                           │
  │  • via web/src/lib/support-agent.ts → chatForAgent('profit-ai') wrapper  │
  │  • profit-ai model deepseek/deepseek-chat (agent-models.ts) with fallback │
  │    openai/gpt-4o-mini; must be added to ALLOWED_MODELS or fallback wins  │
  │  • Guards: ALLOWED_MODELS allowlist, MAX_TOKENS_CAP 600 (triage 380),   │
  │    30/min bucket, 6h cache, dailyCap $5 pre-estimate + isAiKillSwitch   │
  │  • Sanitized: slice 2000, \s→" ", JSON.stringify                         │
  └─────────────────────────────────────────────────────────────────────────┘
  ↓  TriageResult {category, priority, sentiment, isFraudRisk, summary, suggestedReply, needsHuman}
  ↓
  Map category → email label (table §2) + pick template (§4)
  ↓
  Guardrail pass (see §4): block auto-send if draft contains
     banned phrases, amount guarantee, internal paths (docs/, POSTBACK, HMAC, env),
     winner hallucination, or PII request
  ↓
  Decision:

  A) needsHuman / isFraudRisk / fraud_hold / PII  → create_draft (labels: triage:fraud_hold, priority:urgent, needs-human) + update_thread addLabels [needs-human, fraud-review] → notify owner (no send_draft)

  B) payout-adjacent (ledger_hold / postback_missing / redeem_manual_vault / partner_offer_issue) but not fraud
     → create_draft with template + variables (labels: triage:<label>, priority:<p>, draft) → leave for human approval (send_draft after 1-click review). Never call send_message directly.

  C) Clean low-risk (giveaway_rules / general trust / tech_bug with known answer, no ledger mutation)
     → create_draft + (optionally) send_draft after second guardrail pass and only if confidence = high (see below). Default still draft-first for first 2 weeks; flip to auto-send only after eval passes.

  ↓  Logging: append docs/task_logs.md-style line + /api route log; admin can list_drafts with labels triage:* to review.
```

**Confidence for auto-send (week 1–2: always draft):** After eval, auto-send only when `priority ∈ {low,medium}`, `isFraudRisk=false`, `needsHuman=false`, template is 4 or 6 (general/tech without ledger), and guardrail scan passes. Everything else stays draft → `send_draft` is a human button in admin (or AgentMail UI).

**Escalation matrix:**


| Signal                                              | Route to                                | How                                                                                                                                                           |
| --------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yield / VP rate / hold length / giveaway COGS math  | `@profit-ai` (`deepseek/deepseek-chat`) | Already the triage engine; for policy questions add `scoreSentiment` on thread and ask profit-ai math block before changing `site.ts` `vpPerUsd/minRedeemUsd` |
| Copy / trust voice / banner / footer disclosure     | `@trust-designer` (`claude-3.5-sonnet`) | Paste draft → request 60-second proof pass per `docs/10-legitimacy-application-pack.md` §5 before publishing footer change                                    |
| Fraud pattern (repeated, ring)                      | human + `docs/agents/compliance.md` §3  | Never auto-resolve; hold → void → restrict → ban ladder, log who/what/why                                                                                     |
| DB / ledger anomaly (balance drift, orphan clickId) | `@db-guardian` (Neon/Prisma)            | Run `npm run backup:verify` before mutating `LedgerEntry`                                                                                                     |
| Build / postback HMAC break                         | `@eng-qa`                               | `vault-build-check` + `postback-tester` on next capable host                                                                                                  |


**Fallback when profit-ai down:** `support-agent.ts` catches triage throw (rate limit / daily cap / 5xx) → retries once with `getFallbackModel('profit-ai')` (`openai/gpt-4o-mini`), else falls back to **rules classifier** (keyword → label table above) and still creates a draft with `[rules fallback]` prefix so the queue never stalls. Logs `plugin-skipped: triage fallback — rules used`.

## 4 — Guardrails (never violate)

All drafts — even auto-send candidates — must pass before `send_draft`:

1. **Margin rule** (`docs/00-master-brief.md`): Never promise redemption > expected partner yield. Giveaways are COGS from surplus — never uncapped. In email: never state `$` beyond `VP/100 × 0.70` ceiling; never guarantee $5 in N quests. If pressed, quote ranges: "quests vary by partner and region; check each quest's VP and hold."
2. **No generator / no-survey lies** (`compliance.md` §1): Ban: `no survey`, `working codes`, `generator`, `hack`, `guaranteed $`, `instant free $50`, `no download` when offers exist, `your Steam password`. Scan draft with `/no\s*survey|working code|generator|hack|guaranteed.*\$/i`.
3. **No internal leakage** (`end-user-auditor`): Never emit `docs/`, `POSTBACK_SECRET`, `BITLABS_APP_SECRET`, `AYET_HMAC_SECRET`, `HMAC`, `click_id` raw, `DATABASE_URL`, `Impact 6c1cfdb4` in body, or `/api/postback` raw URL. Body links only: `/proof`, `/how-it-works`, `/account`, `/rewards`, `/giveaways`, `/contact`.
4. **Time ranges only** (`platform-vision.md` + `site-audit`): Holds `3–14 days` (quest-dependent), manual vault `24–48 hours`. Never `instant` if hold applies. Cite `availableAt` when known: "pending until {{holdDate}}".
5. **Winner proof** (`proof` §10): Never hallucinate a winner name/date. If no winners yet, use honest empty state: "First winners publish after [date] — see /giveaways."
6. **PII handling:** Never ask for Steam password, full card, or ID photo. If user sends one, redact, label `pii-detected`, and reply asking to remove it.
7. **Disclosure footer:** Every reply ends with footer (see templates).

**Auto-send block list (regex, run in** `support-agent.ts` **before** `send_draft`**):**
`/POSTBACK|HMAC|BITLABS|AYET|DATABASE_URL|6c1cfdb4|docs\/|generator|working code|no survey|guaranteed|instant.*\$50|Steam password/i` → force `needsHuman`.

## 5 — Templates (paste-ready, variables in {{}})

All use transparent voice per `docs/01-brand.md` (direct, gamer-native, calm). No "honest" overuse — say `transparent` / `verified` / `disclosed` where needed. Footer on every reply.

**Footer (append verbatim):**

```
—
VaultQuest — transparent gaming rewards.
How it works: https://vaultquest.io/how-it-works · Proof & rules: https://vaultquest.io/proof · Your vault: https://vaultquest.io/rewards · Contact: https://vaultquest.io/contact
We fund rewards from partner commissions (disclosed on /proof). Giveaways follow published rules on /giveaways.
```



### T1 — Missing VP after quest

> Subject: Re: Missing Vault Points — checking your quest

Hi {{name}},

Thanks for flagging that {{questName}} hasn't credited. Most quests credit after partner verification — if the partner confirmed the completion, points post to your vault after the hold window.

Could you share: the quest name, roughly when you finished it, and any confirmation from the partner (screenshot or completion ID helps — no passwords needed)? I'll check your clicks and `OfferClick`/`LedgerEntry` on our side and update you within 24 hours.

In the meantime, you can track pending vs available at [https://vaultquest.io/rewards](https://vaultquest.io/rewards) and how earning works at [https://vaultquest.io/how-it-works](https://vaultquest.io/how-it-works).

{{footer}}

Labels: `triage:postback_missing` `priority:high` `needs-human` until verified. Action: look up `OfferClick` by `userId`/`questId` recent 7d, check `LedgerEntry note contains tx=` for duplicate — only credit via `/api/postback` HMAC path, never manual VP without proof.

### T2 — Hold / pending not yet available

> Subject: Re: Pending balance — when it becomes available

Hi {{name}},

Your {{vp}} VP is pending until {{holdDate}} — that's the verification hold for that quest (`{{holdDays}} days` for this type, typically 3–14 days depending on partner). At launch we also process redemptions from the manual vault within 24–48 hours after points become available.

Nothing else needed from you. Track it at [https://vaultquest.io/rewards](https://vaultquest.io/rewards) → pending vs available. Details at [https://vaultquest.io/how-it-works](https://vaultquest.io/how-it-works) and [https://vaultquest.io/proof#earnings](https://vaultquest.io/proof#earnings).

{{footer}}

Variables: `{{vp}}`, `{{holdDays}}`, `{{holdDate}}` = `availableAt` formatted. Never promise early release.

### T3 — Redeem / manual vault timing

> Subject: Re: Redemption — manual vault queue

Hi {{name}},

Your redemption for "{{label}}" ({{costVp}} VP) is in the manual vault queue. We fulfill from a small Steam vault within **24–48 hours** after points are available (holds clear first per /how-it-works).

Status is visible at [https://vaultquest.io/rewards](https://vaultquest.io/rewards). If it passes 48 hours after the hold cleared, reply here and we'll prioritize it.

{{footer}}

If `LedgerEntry status=PENDING` still, explain hold first (merge T2).

### T4 — Giveaway eligibility

> Subject: Re: Giveaway — rules and entry

Hi {{name}},

Giveaways are scheduled with published rules at [https://vaultquest.io/giveaways](https://vaultquest.io/giveaways) and [https://vaultquest.io/proof#giveaways](https://vaultquest.io/proof#giveaways) — eligibility, entry methods, schedule, winner selection, and announcement channel are all there.

{{#winnersExist}}Latest winners: [https://vaultquest.io/giveaways#winners{{/winnersExist}}{{^winnersExist}}First](https://vaultquest.io/giveaways#winners{{/winnersExist}}{{^winnersExist}}First) winners publish after the date on /giveaways (no winners invented before then).{{/winnersExist}}

Let me know which giveaway you mean and I'll confirm your entry.

{{footer}}

Auto-send eligible only if no PII and no ledger ask.

### T5 — Suspected fraud hold / VPN appeal

> Subject: Re: Account hold — review in progress

Hi {{name}},

Your account is on hold while we review activity flagged by our anti-fraud checks (see [https://vaultquest.io/proof#anti-fraud](https://vaultquest.io/proof#anti-fraud) — one account, no VPN/proxy for restricted offers, no multi-accounting).

Next step: I've queued your case for human review within 12–24 hours. Please don't create another account while we review — it slows the appeal. If the hold was for travel or a shared household, mention that and we'll factor it in (we don't auto-ban for a single VPN on non-restricted content).

{{footer}}

**Never auto-send.** Create draft with `priority:urgent` `needs-human`, owner reviews before sending. Do not coach bypass.

### T6 — Tech / login issue

> Subject: Re: Login / site help

Hi {{name}},

Thanks for reporting that — let's get you back in. Could you share: device/browser, whether you signed in with email or OAuth (Google/Discord), and what you see (error text or screenshot, no passwords)?

Quick checks: try [https://vaultquest.io/contact](https://vaultquest.io/contact) in a fresh tab, clear cache, or sign in with the other method if you linked both. I'll keep this thread open and follow up within 24 hours.

{{footer}}

For auth bug, create internal task and label `triage:tech_bug`.

### T7 — Partner offer not credited (survey / game)

> Subject: Re: Partner offer — verification check

Hi {{name}},

Partner offers (surveys, games) credit only when the partner confirms completion via our S2S postback — that verification can take hours and some completions are screened out or clawed back by the partner (see [https://vaultquest.io/proof#earnings](https://vaultquest.io/proof#earnings) — we disclose that we earn commission when you qualify).

If the partner's own history shows it completed, share that confirmation (offer name, time, and any tx/confirmation ID — no passwords). I'll trace your click and check our postback log, then reply within 24 hours. Holds for these types are typically {{holdDays}} days when they do credit.

Related: [https://vaultquest.io/how-it-works](https://vaultquest.io/how-it-works) and your vault [https://vaultquest.io/rewards](https://vaultquest.io/rewards).

{{footer}}

Same verification path as T1 but names the partner layer explicitly; never blame the partner or promise yield×0.70+.

## 6 — Runbook (polling loop + AgentMail tool calls)



### Architecture

```
Vercel Cron (every 15 min) ──→ POST /api/cron/support-triage  (CRON_SECRET gate)
        │
        ├─ list_threads(inboxId=vaultquest-support@agentmail.to, labels=["UNREAD"], limit=20)
        │    or search_messages(q:"is:unread", limit=20) — prefer threads to keep context
        ├─ for each thread: get_thread → extract latest inbound message {name,email,body}
        ├─ call web/src/lib/support-agent.ts: triageEmail({name,email,body})
        │    └─ triageSupportMessage via support-agent wrapper (profit-ai model, §3 guards)
        ├─ pick template for mapped label → interpolate {{vars}} (holdDays/availableAt from ledger if userId matched by email)
        ├─ create_draft({inboxId, to:[sender], subject:"Re: "+origSubject, text:body+footer, labels:[triage:*, priority:*]})
        ├─ update_thread({inboxId, threadId, addLabels:[triage:*, priority:*], removeLabels:[UNREAD]}) — or label UNREAD→triaged
        ├─ conditionally send_draft (only §3 case C after eval; week 1–2 never)
        └─ append log line to task_logs style (see below) + increment ai spend monitor
```

**Why Vercel cron + AgentMail tools (not webhook yet):** AgentMail webhook is ideal when available, but polling via `list_threads` is documented and works today with zero infra; swap to webhook by adding `POST /api/agentmail/webhook` → same handler later.

### Cron wiring

`web/vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/support-triage", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/backup", "schedule": "0 2 * * *" }
  ]
}
```

`web/src/app/api/cron/support-triage/route.ts` (scaffold — stage-only, add when env ready):

```ts
import { triageEmail, getSupportInboxId } from "@/lib/support-agent";
// gate: header x-cron-secret === process.env.CRON_SECRET
export async function POST(req: Request) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) return new Response("forbidden", { status: 403 });
  const inboxId = getSupportInboxId(); // env SUPPORT_INBOX_ID or vaultquest-support@agentmail.to
  // call AgentMail list_threads via server-side fetch to https://api.agentmail.to (AGENTMAIL_API_KEY)
  // or keep this as Cursor-local poll until Vercel env has the key — see docs/14-mcp-setup.md §Env hygiene
  return Response.json({ inboxId, note: "stage stub — wire AGENTMAIL_API_KEY + profit-ai triage when green" });
}
```

Cursor-local alternative until Vercel has `AGENTMAIL_API_KEY`: run the poll as a local task (`pwsh .cursor/skills/...`) every 15 min while MCP is green — Ethio can trigger `list_threads` manually in chat on day 1.

### Tool call sequence per email (exact tool names from MCP catalog)

1. `list_threads` `{ inboxId: "<vaultquest-support id>", labels: ["UNREAD"], limit: 20 }` — find new inbound.
2. `get_thread` `{ inboxId, threadId }` — pull sender/subject/body; slice body to 2000 chars.
3. `triageSupportMessage` (via `support-agent.ts` → `profit-ai`) — no MCP call, local `ai-helpers.ts`.
4. (optional ledger lookup) `prisma.user.findUnique({where:{email}})` → `ledgerEntries` `availableAt` for T2 personalization — server-only, never in draft.
5. `create_draft` `{ inboxId, to:[senderEmail], subject:"Re: "+origSubject.slice(0,120), text: templateBody, labels:["triage:"+label,"priority:"+priority] }` — draft reply.
6. `update_thread` `{ inboxId, threadId, addLabels:["triaged","triage:"+label], removeLabels:["UNREAD"] }` — mark seen.
7. `send_draft` `{ inboxId, draftId }` — **only** after human approval (or §3 case C post-eval). Never call `send_message` directly for replies — drafts preserve `In-Reply-To`.
8. If human edits draft: `update_draft` then `send_draft`.

**Label discipline:** `UNREAD` → `triaged` → `needs-human` / `auto-draft` / `sent` / `spam`. Admin view can `list_drafts` filtered by `labels:["needs-human"]` to clear the human queue first.

### Human approval step

- Admin inbox (`list_drafts` for vaultquest-support) shows drafts sorted `priority:urgent` first.
- Owner clicks `send_draft` in AgentMail UI or via a minimal `/admin/support` page that calls `support-agent.ts`'s `sendDraft`.
- Any edit in AgentMail UI before sending is the ground truth — agent never re-sends after human edit.
- Log rewrites: count `humanRewrite` when sent body differs >20% from draft (for kill metric).



### Logging (task_logs style)

Append to `docs/task_logs.md` or server log one line per batch:

```
[Triage 2026-08-10 02:15Z] inbox=vaultquest-support n=3 draft=3 auto=0 human=1 fraud=1 spend=$0.002 day=$0.012/5.00 kill=false — labels: ledger_hold, fraud_hold(needs-human), giveaway_rules
```

Plus per-thread: `threadId category priority sentiment isFraudRisk needsHuman templateId`.

### Kill switch & daily cap

- `AI_HELPERS_DAILY_CAP_USD=5` default. `isAiKillSwitchTripped()` fast-fails all helpers; `support-agent.ts` falls back to rules classifier and labels `fallback:rules`.
- If spend hits $5, polling continues but creates rule-based drafts only until 00:00 UTC reset.
- Admin monitors `getAiSpendToday()` at `/api/cron/support-triage` response or via `ai-helpers` log. Owner can lower cap to $1–2 during testing.



### Fallback when profit-ai down

`support-agent.ts` catch → `chatForAgent('profit-ai')` threw → retry once with `getFallbackModel('profit-ai')` (`openai/gpt-4o-mini`). If that fails, keyword rules: `VP|pending|hold → ledger_hold`, `redeem|vault → redeem_manual_vault`, `completed.*not credited|offer.*not → partner_offer_issue`, `VPN|ban|appeal|multi → fraud_hold`, `giveaway|winner|odds → giveaway_rules`, `login|password|error|404 → tech_bug`. Still respects guardrails + never auto-sends.

## 7 — Cost / lift / kill (per docs/08-budget.md)


| Item                                                                                   | Cost                                                                                                  | Lift                                                                                                       | Kill criteria                                                                                                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1 triage via profit-ai** (`triageSupportMessage`, 380 tok, T=0.2, 6h cache, 30/min) | $0.35–0.45 / 1k classifications. At 200 emails/day ≈ $0.08/day. Cache saves ~30% on re-triage         | Saves 5–10h/week ops; faster payout replies → retention; early fraud flag → fewer clawbacks / network bans | **Kill triage** (revert to rules only) if accuracy <80% on 50 labeled eval within 2 weeks, OR <30% time-to-action win in 2 weeks, OR >40% human rewrites sustained 2 weeks |
| **AgentMail inbox**                                                                    | $0 (AgentMail free tier per workspace). Forward of `support@vaultquest.io` $0 via Resend/forward rule | Single main account, 24h SLA visible to reviewers                                                          | Kill second inbox proposal if `vault-ops` label stays <10% of volume at 30d                                                                                                |
| **Vercel cron** (15m poll)                                                             | $0 on Hobby (cron included). ~2,880 invocations/mo, negligible compute                                | 15m responsiveness without webhook infra                                                                   | Kill if error rate >5% for 3d → fall back to manual Cursor poll                                                                                                            |
| **Forwarding + Resend for /contact**                                                   | $0 (Resend free)                                                                                      | Keeps /contact and email in one queue via same triage                                                      | —                                                                                                                                                                          |
| **Human review time**                                                                  | ~5 min per draft, ~1h/day at 12 drafts                                                                | Trust surface / proof alignment (trust-designer)                                                           | If human rewrite rate <10% after eval, propose auto-send for giveaway_rules/general to cut review time — requires trust-designer copy sign-off                             |
| **Global AI cap**                                                                      | `AI_HELPERS_DAILY_CAP_USD=5` (lower to $1–2 in testing)                                               | Hard spend ceiling, kill switch tripped → rules fallback                                                   | If spend hits $5 >3d in first 2 weeks without meeting lift metrics, lower cap and re-propose                                                                               |


**Kill = disable triage auto-path, not delete drafts.** Queue keeps working on rules + human until prompt/labeling improves.

## 8 — Policy & references

- Margin rule: `docs/00-master-brief.md` — *Never promise redemption that exceeds expected partner yield for that action. Giveaways are trust COGS from surplus margin — not uncapped free codes.*
- Voice: `docs/01-brand.md` — transparent, never `honest` overuse; footer cites `/proof`.
- Ledger: `docs/05-platform-vision.md` — `PENDING→POSTED`, holds 3–14d, manual vault 24–48h.
- Budget guard: `docs/08-budget.md` — propose with cost/lift/kill + owner approval before spend.
- Rebrand narrative + trust fixes: `docs/10-legitimacy-application-pack.md` §1/5.
- Compliance: `docs/agents/compliance.md` §1–3 — banned claims, fraud holds, disclosure.
- DB: `docs/13-db-backup.md` — verify before ledger mutation; `web/prisma/schema.prisma` models.
- Profit: `docs/11-swarm-backlog-profit.md` — F1 flagship cost/accuracy gates; `web/src/lib/ai-helpers.ts` hard guards.
- MCP: `docs/14-mcp-setup.md`, `.cursor/mcp.json` — AgentMail/Apify wiring, no secrets committed.



## 9 — Handoff

After owner approves this doc:

1. **Create inbox** via `create_inbox` (username `vaultquest-support`) → set `SUPPORT_INBOX_ID` + `AGENTMAIL_API_KEY` (if not already) + `CRON_SECRET` on Vercel + local User env → restart Cursor to confirm tools still green.
2. **Scaffold code** `web/src/lib/support-agent.ts` (thin wrapper, §6) — already staged as stub; wire to real AgentMail API fetch when env is set.
3. **Forward** `support@vaultquest.io → vaultquest-support@agentmail.to` (Resend rule or DNS forward) → update `SiteFooter` + `/contact` copy to list `support@vaultquest.io` as main.
4. **Label 50 threads** (spread across 8 labels) → run eval → tune `TRIAGE_SYSTEM_PROMPT` to ≥80% before auto-send.
5. `@trust-designer` **copy review** on 7 templates + footer (60-second proof pass).
6. `@profit-ai` **margin review** on hold/redeem language (yield ×0.70 ceiling).
7. `@eng-qa` to run `vault-build-check` + `postback-tester` on next capable host before any cron deploy; verify `update_thread`/`send_draft` never leaks `POSTBACK_SECRET/HMAC`.

`plugin-skipped: none this turn — agentmail green, used list_inboxes/list_organizations. If Vercel cron not yet wired, logged as stage-only.`

---

*Next vault-planner turn: consume §2 taxonomy + §6 runbook into* `docs/vault_plan.md` *§Trust/Build and* `docs/task_logs.md` *handoff.*