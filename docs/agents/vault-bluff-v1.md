# Vault Bluff V1 frozen specification

Status: frozen for implementation  
Owner: product manager  
Integration branch: `cursor/vault-bluff-v1-a418`  
Policy version: `vault-bluff-policy-v1`  
Engine version: `vault-bluff-engine-v1`  
Reward policy version: `vault-bluff-reward-v1`  
Frozen: 2026-08-16

This file is the source of truth for Vault Bluff V1. Implementation and test findings may be appended, but specialists may not change the rules, economy, policy, or architecture below.

## Product and boundaries

Vault Bluff is a polished, bot-first bluff game inside VaultQuest. A new authenticated user can start immediately against a clearly labeled TypeScript bot. The game uses stored aggregate gameplay tendencies to adapt. It does not use a runtime LLM, OpenRouter, unrestricted chat, voice, video, WebSockets, matchmaking, room codes, multiplayer presence, or a game framework.

The game is entertainment and retention, not gambling. The hidden Vault Key determines only the round winner. It never represents cash, VP, a redeemable item, or a random prize. Performance earns XP, ranks, and cosmetics. Verified partner quests remain the main VP source.

All names, copy, visuals, and assets are original VaultQuest work. The UI uses dark navy, teal actions, brass or gold key and case details, Syne and Sora, existing radii, DOM, and CSS. It must not use casino styling, fake people, fake activity, fake counts, easy-money claims, generator claims, or Steam password requests.

## Routes

- `/play` is a public, indexable explanation and an authenticated hub. It shows available and pending VP, a featured Vault Bluff card, daily promotional VP status, XP, rank, cosmetic progress, and an honest note that verified quests remain the main VP source.
- `/play/vault-bluff` requires authentication and is `noindex`. Signed-out users go directly to `/login?from=play`; the game route does not render a signed-out play panel. It supports persona selection or automatic assignment, a new match, active rounds, results, instant rematch, and one optional rotated Earn recommendation after three completed matches.
- Primary header navigation is `Play · Earn · Rewards · Giveaway`; Giveaway links to the live `/giveaway` form and remains in the header through Sep 1 ET. About, How it works, Proof & Rules, and Contact live in the footer. Signed-in users get Account without a duplicate Earn CTA. `/play` remains in public sitemap paths.
- The centralized auth redirect allowlist maps `from=play` to `/play/vault-bluff`. Login, signup, credential forms, and OAuth redirects all preserve the `play` hint so successful authentication completes the round-trip. While the visitor is on `/play`, the signed-out header's desktop and mobile `Sign in` links use `/login?from=play`, and both `Sign up` links use `/signup?from=play`.
- The site-wide Vault Assistant remains inherited chrome with no Play-route suppression. The floating preview control observed during QA is the Vercel toolbar, not game chat.
- Player-facing Play copy never mentions preview databases or migrations. Missing-schema states say the game is temporarily unavailable while technical API errors retain the setup detail for operators.

## Match rules

- One human plays one clearly labeled VaultQuest bot.
- Each round has two cases and one hidden Vault Key.
- The server assigns a Keeper and a Chooser. Roles alternate for four rounds, giving each side two Keeper and two Chooser rounds.
- The Keeper privately inspects the assigned case.
- The Chooser asks exactly two distinct structured questions, then chooses `Keep my case` or `Take their case`.
- The questions are:
  - Is the key inside your case?
  - Which case should I choose?
  - What did you see?
  - Are you telling the truth?
  - Should I keep mine?
  - How confident are you?
- Keeper answers come from approved answer options and include confidence of Certain, Unsure, or Guessing and a Keep or Take recommendation.
- When the human is Keeper, the bot is Chooser. After the second human answer, the UI must show whether the bot kept Case B or took Case A before or alongside the key reveal.
- The UI may use server-measured duration internally for aggregate player memory, but it does not show raw timeout milliseconds as bot response time. It may show confidence, prior answers, contradictions, and recommendation. It has no free text.
- Whoever ends with the key earns one round point.
- Four rounds complete the match. Ties are allowed. A rematch starts immediately on request.
- The server randomly places the key before behavior is evaluated. The bot cannot change placement.

## Fairness and authority

- The server owns placement, legal transitions, bot strategy, answers, confidence, response delay, choice, score, XP, and reward eligibility.
- A Chooser bot receives a public chooser view that omits key location and all equivalent secret data.
- A human Chooser never receives the bot Keeper's private inspection data.
- The client never receives unrevealed placement, RNG state or seed, future bot decisions, private bot observations, or fraud thresholds.
- Placement is immutable after round creation. Difficulty, persona, and adaptation cannot affect placement or reward eligibility.
- The client cannot submit placement, bot strategy, bot answers, bot confidence, bot delay, score, XP, or reward fields.
- The API returns separate public and role-private DTOs. Reveal data appears only after the choice resolves.
- The deterministic engine must produce the same result for the same seed and command sequence. Tests must prove legal transitions, secret redaction, immutable placement, and that Chooser bot input has no secret state.

## Bot policy and memory

One `AdaptiveBotPolicy` has four parameterized personas:

- Analyst: deliberate, evidence-weighted, lower bluff rate.
- Showboat: confident, expressive, higher bluff rate.
- Nervous: less certain, variable timing, moderate bluff rate.
- Wildcard: broad exploration and reverse-psychology bias.

Personality changes behavior parameters only. It cannot change rules, placement, XP, or rewards.

Player memory stores completed match count, Keep and Take rates, Keeper truth and bluff rates, question frequencies, confidence use, average measured duration, Chooser accuracy, Keeper bluff success, persona performance, and last engine and policy versions. New users get neutral defaults. Updates use rolling exponential decay so roughly the last 20 valid completed matches matter most. Strong personalization requires a minimum sample. Exploration is fixed near 20 percent. One valid completed match updates memory once. Forfeits and incomplete matches do not train. No raw conversation is stored. Runtime data never rewrites global policy weights.

## Simulation and frozen policy

Before release, repeatable TypeScript self-play runs at least 10,000 seeded matches and covers every persona against every archetype:

- Truth-biased
- Frequent liar
- Always Keep
- Always Take
- Confidence reader
- Timing reader
- Random beginner
- Pattern exploiter
- Reverse-psychology
- Adaptive exploiter

Parameter search covers bluff frequency, exploration, memory weight, confidence, delay, and reverse psychology. The retained benchmark is machine-readable. Production uses the versioned frozen `vault-bluff-policy-v1` configuration. Simulation cannot mutate it at runtime.

## Persistence and APIs

The implementation uses:

- `GameSession`
- `GameRound`
- `GameAction`
- `BotPlayerProfile`
- `GameRewardGrant`

Enums, foreign keys, indexes, and uniqueness constraints prevent duplicate client actions, round completion, profile updates, daily rewards, and ledger entries. PostgreSQL partial uniqueness permits at most one `ACTIVE` `GameSession` per user. Every session-start request, including rematch and navigation return, resumes the existing active session. A new session is created only when no active session exists.

Endpoints:

- `POST /api/games/vault-bluff/sessions`
- `GET /api/games/vault-bluff/sessions/[sessionId]`
- `POST /api/games/vault-bluff/sessions/[sessionId]/actions`

Commands include an optimistic session version and unique `clientActionId`. Commands are idempotent. Replaying the completing action returns the reward payload persisted for that session, including the same blocked reason or pending amount and availability time. The server rejects stale versions and illegal transitions with structured, safe errors. Actions are append-only. Sessions persist engine and policy versions, timestamps, deadlines, deterministic RNG cursor, and the current authoritative state. A deadline rejection never changes a match to forfeited. Only a player-confirmed `FORFEIT` action can set an active session to `FORFEITED`; navigation, hub visits, refresh, reconnect, and rematch startup cannot. All reads, normal actions, and idempotent replay convert stored state through `toSafeSessionDto`; no API returns raw `GameSession.state`, RNG data, or response-duration milliseconds.

Logs and analytics must never include hidden placement, seed, unrevealed answers, email, raw identity, private state, or fraud thresholds.

If the authenticated preview database lacks a Vault Bluff table or column, `/play` and `/play/vault-bluff` render a safe setup-unavailable state instead of crashing. Game APIs return structured `503 GAME_SCHEMA_UNAVAILABLE` responses. The application must never auto-create or auto-migrate game tables. QA connects an isolated development database and applies the committed migration there; production Neon remains untouched.

## Economy and XP

- 100 VP equals $1.
- Minimum redeem is 500 VP.
- Every valid completed match earns XP. Performance changes XP only.
- Rank and cosmetic progress come from lifetime XP.
- Wins, losses, rounds, starts, refreshes, incomplete matches, forfeits, clicks, duplicates, automation, and farming never earn VP.
- The first eligible completed bot match per UTC day may earn 1 promotional VP.
- The rolling 30-day maximum is 30 promotional VP.
- Promotional VP stays pending for 24 hours.
- At most one minted `PENDING` reward grant exists per user and UTC reward period. `BLOCKED` rows record attempts and do not spend or reserve that daily period.
- A dedicated transaction creates `GameRewardGrant` and `LedgerEntry` atomically. It does not call `creditAvailable()` or `demoCompleteQuestAction()`.
- Ledger metadata records the game promo source, session ID, reward policy version, funding campaign, and availability date.
- `LedgerEntry.gameSessionId` is unique. Combined with unique `GameRewardGrant.sessionId` and `GameRewardGrant.ledgerEntryId`, this prevents a second promo ledger row for the same game session.
- A global funded reserve cap and environment kill switch bound liability. The owner can disable game VP without disabling play.
- The initial reward feature is disabled. It remains disabled until a dedicated reserve and environment kill switch are configured.
- Current maximum promotional VP liability is $0.
- Current budget spent is $0.

## Profit and security freeze

This freeze does not change the game rules. It controls funding, minting, abuse prevention, and fulfillment.

- Spend remains $0 for this integration work.
- The total Vault Bluff program ceiling is $500, equal to 50,000 VP at 100 VP per dollar. Do not raise it.
- The paid advertising cap remains $300. Vault Bluff work cannot raise or spend it.
- Promotional VP is a redemption liability. It is not cash, income, a deposit, or collectible money.
- Pending VP remains a liability during its hold. A pending balance is not collectible cash and cannot be represented as money the user already received.
- The feature remains disabled until a dedicated reserve can cover all minted Vault Bluff promotional VP at 100 VP per dollar.
- `VAULT_BLUFF_REWARDS_ENABLED` must be `true`, but that enable flag cannot override the kill switch, reserve, anti-farm, or program ceiling checks.
- `VAULT_BLUFF_VP_KILL_SWITCH` is a separate fail-closed runtime control. Only the exact value `allow` permits mint or fulfillment. Missing, malformed, or `stop` values block both without stopping gameplay. Operators must be able to flip this environment control without a code deployment.
- Every mint recalculates all unfulfilled Vault Bluff promotional liability. If remaining reserve VP is less than the 1 VP grant liability, the service refuses the mint.
- `VAULT_BLUFF_RESERVE_VP` cannot exceed 50,000 VP. A larger value fails closed instead of raising the $500 ceiling.
- `VAULT_BLUFF_ANTI_FARM_READY=true` is required before minting. This flag may only be set after authenticated unique-user controls, reward-path rate limiting, and multi-account detection or review are operating. A partial unique index enforces one minted pending grant per user and UTC day. Blocked attempts leave the period eligible if rewards are enabled later that day. The maximum remains 30 promotional VP per rolling 30 days.
- Repeated sessions, duplicate commands, automation, incomplete games, forfeits, and linked multi-account farms do not earn promotional VP.
- Vault Bluff funding campaigns must use a dedicated `vault-bluff-` campaign name. Names containing `earn`, `probe`, `roblox`, or `giveaway` fail closed.
- The $20 `/earn` probe, the $50 Roblox giveaway, the $500 Vault Bluff reserve, and the $300 ad cap are separate budgets and ledgers. Funds, liabilities, grants, and fulfillment records must not move between them.
- There is no VP-to-Robux conversion. Roblox is not a Vault Bluff or VP fulfillment option.
- Fulfillment remains official Steam digital gift cards only, and only after VaultQuest has received the cash that backs the redeemable liability. Pending promotional VP cannot trigger fulfillment.
- The kill switch must stop promotional VP mint and fulfillment while gameplay, XP, ranks, cosmetics, and non-reward match completion continue.

## Optional Earn recommendation

After the third valid completed match, the game shows one optional Earn slot. A quest in that slot must come from the existing healthy, under-cap affiliate rotation. It cannot pin or hardcode `q-surveys` or another quest. If rotation returns no quest, the slot remains visible with an honest no-healthy-inventory state. A populated card must show exact VP, effort, and hold time. It never blocks play or the daily bonus. A click earns no VP. Partner VP posts only after a verified partner postback.

## Analytics

`PH_EVENTS` includes:

- `game_hub_viewed`
- `vault_bluff_started`
- `vault_bluff_round_completed`
- `vault_bluff_completed`
- `vault_bluff_rematch_started`
- `vault_bluff_persona_selected`
- `vault_bluff_daily_vp_granted`
- `vault_bluff_reward_blocked`
- `vault_bluff_earn_clicked`
- `vault_bluff_verified_postback`

Safe properties may include engine version, policy version, persona, completion state, round count, XP, reward eligibility, rematch state, and a safe error reason.

## Required UI states

The signed-out state exists on the public `/play` explainer only. Authenticated components under `web/src/components/play/` cover preview-schema unavailable, new match, Keeper inspection, Chooser questioning, bot-answering status, Keeper response, bot-choosing status after the second Keeper answer, human Keep or Take, bot Chooser decision, held reveal with explicit Continue, visually separate round result, match result, reward pending, distinct daily and rolling cap states, populated and empty rotated Earn slots, confirmation-guarded forfeit, and dedicated error recovery with retry. Every human Chooser round first renders at 0 of 2 with no used questions; a short interaction guard prevents the reveal click from landing on a new-round question. Keeper response submission reads the answer, confidence, and recommendation from the submitted form so the visible selection is the sent selection. `/play/vault-bluff` never renders a signed-out game panel. The experience must work on mobile and by keyboard. Interactive targets, including the mobile hub CTA, are at least 44 px; short chips also have a 44 px minimum width. Color cannot be the only case identifier. Brass and gold are reserved for the Vault Key, cases, and unlock moments.

## Motion

Vault Bluff motion uses DOM and CSS only. It adds no Lottie asset, canvas, runtime animation engine, or gameplay transition.

- Bot answering and choosing bars pulse teal only while the request is in flight.
- Keep and Take are large opposite actions with a press-in state. Keep uses teal; Take uses the existing danger red. Neither uses brass chrome.
- The key case performs one short reveal settle and keeps a static brass light afterward.
- A four-dot round rail shows done rounds in ink, the current round in teal, and remaining rounds as outlines alongside `Round N of 4`.
- Instant rematch gets one brass and teal glow on mount, with no loop.
- The signed-in ready-state featured card uses one teal border pulse and shorter copy. The signed-out `/play` explainer copy does not change.
- Under `prefers-reduced-motion`, all new pulse, flip, and glow animations are disabled. The thinking bar remains static, the key case lights without flipping, and action feedback uses no transform.

## Release and deployment gates

No deployment is part of this work. The migration is generated but not applied to production. Promotional VP cannot be enabled until all of these are true:

1. The owner funds and records a dedicated game promotional reserve.
2. `VAULT_BLUFF_REWARDS_ENABLED=true` is set intentionally.
3. `VAULT_BLUFF_VP_KILL_SWITCH=allow` is configured as a runtime control that can be changed without a code deploy.
4. `VAULT_BLUFF_ANTI_FARM_READY=true` is set only after unique-user, rate-limit, and multi-account controls pass review.
5. `VAULT_BLUFF_FUNDING_CAMPAIGN` names an isolated `vault-bluff-` campaign and contains none of the blocked cross-budget labels.
6. `VAULT_BLUFF_RESERVE_VP` is a positive integer no greater than both the funded cash reserve times 100 VP per dollar and the 50,000 VP program ceiling.
7. Official Steam digital gift-card inventory is purchased only after backing cash is received. No VP-to-Robux path exists.
8. The migration is applied first to an isolated non-production Neon branch and API tests pass there.
9. Vercel auth and local verification secrets are available for deployment verification.

CPX and partner Earn integrations are not required to play.

## Verification record

Results recorded 2026-08-16:

- `npm run test:vault-bluff`: pass, 27 tests. Coverage includes the frozen four-link public navigation and unlock-language promise, navigation and rematch resume of the active session, response-duration redaction, Chooser-round question reset, exact Keeper form confidence submission, incomplete response rejection, preview-schema error classification, the `from=play` auth round-trip, path-aware header auth links, unknown-hint fallback, bot Chooser decision exposure, deterministic replay, illegal transitions, secret redaction, Chooser bot input, immutable placement, server deadlines without silent forfeit, neutral memory, confirmed-forfeit exclusion, completion XP, reward default-off behavior, runtime mint and fulfillment stop, gameplay independence, anti-farm readiness, funding isolation, the $500 ceiling, atomic reward and ledger calls, remaining-reserve and rolling caps, blocked-period eligibility, and persisted reward replay.
- `npm run vault-bluff:simulate`: pass, 10,000 seeded matches.
- `npm run vault-bluff:benchmark`: pass, 40 required persona and archetype cells.
- `npm run vault-bluff:tune`: pass, 1,728 parameter candidates across bluff rate, exploration, memory weight, confidence, delay, and reverse psychology. The report retains `vault-bluff-policy-v1`; runtime weights remain frozen.
- Persona results over 2,500 matches each:
  - Analyst bot match win rate 28.92 percent, tie rate 38.80 percent, average bot response 1,700 ms.
  - Showboat bot match win rate 30.44 percent, tie rate 37.96 percent, average bot response 1,026 ms.
  - Nervous bot match win rate 28.52 percent, tie rate 39.24 percent, average bot response 2,300 ms.
  - Wildcard bot match win rate 29.08 percent, tie rate 37.92 percent, average bot response 1,648 ms.
- `npx prisma generate`: pass.
- `DATABASE_URL=postgresql://localhost:5432/vaultquest_schema_only npx prisma validate`: pass. The placeholder URL was not contacted.
- `npx next typegen && npx tsc --noEmit`: pass.
- `npm run lint`: pass with two pre-existing warnings in `scripts/postback-smoke.ts` and `src/lib/postback-handler.ts`.
- `bash .cursor/skills/vault-build-check/scripts/check.sh`: pass. The production build compiled, type-checked, and generated all routes. Existing build-time page collection logged the expected missing local `DATABASE_URL`, and the dynamic Open Graph font downloader logged an existing HTTP 400 fallback. Neither failed the build.
- Local signed-out UI at `http://127.0.0.1:3317/play`: pass on desktop and a 390 px viewport. Primary navigation, disabled reward disclosure, keyboard focus, and responsive layout were verified.
- Signed-out `/play/vault-bluff`: pass, HTTP 307 to `/login?from=play`.
- Authenticated gameplay and database API integration were not exercised because no isolated development database or local auth account was available. No production Neon or Vercel resource was read or mutated.
- The one-active-session and one-pending-daily-grant partial unique indexes require authenticated concurrency tests after this migration is applied to an isolated development Neon branch. They were not applied to production.
- Migration `20260816193000_vault_bluff_v1` is generated and committed. It was not applied to production or any remote database.
- Promotional VP remains disabled. Current maximum liability is $0. Budget spent is $0.
