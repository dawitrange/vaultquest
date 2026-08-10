# 11 — Design / Trust Swarm Backlog — Audit & Changelog

Author: Design/Trust subagent (Ethio) · 2026-08-09 · VaultQuest `web/` (Next.js 16, cold vault teal + Syne/Sora)

## Scope Read

`web/src/app/page.tsx`, `web/src/app/about/page.tsx`, `web/src/app/proof/page.tsx`, `web/src/app/earn/page.tsx`, `web/src/app/rewards/page.tsx`, `web/src/components/SiteFooter.tsx`, `web/src/app/globals.css`, `web/src/components/SocialProofBar.tsx` (+ `layout.tsx`, `SiteHeader/Nav`, `QuestRow`, `HeroRedeemDemo`, `SITE`/`NAV`).

---

## Audit — Trust Signals, IA, Visual Polish, A11y, Scrollbar

### Trust — what’s strong
- Transparency voice throughout (not "honest" overuse); `proof/page.tsx` is genuinely excellent — table of contents, anchored sections 1–9, explicit "what we never do" kill list, S2S-only credit note, `PENDING → POSTED` hold model.
- Continuity proof repeated in footer, `SocialProofBar`, `/about` timeline, `/proof` — YouTube @zakai1769 + Facebook Freesteamcodes21 since Dec 26 2020, Impact verification `6c1cfdb4-…` in `<head>`.
- No fake counters anywhere. Winners feed honestly says "None yet — no fake proof." Ledger-backed stats promised as future replacement for screenshots — correct choice.
- Earn page correctly says "we may earn" and explains rotation/failover, not a magic code.

### IA / Nav — findings
- `NAV` (`lib/site.ts`) is complete and wired in both `SiteHeaderNav` (desktop + mobile) and `SiteFooter`: About · How it works · Earn · Rewards · Giveaways · Proof & Rules · Contact (+ Admin when authed). About link present everywhere required — no missing nav item.
- `SocialProofBar` gives the ideal second-level IA: Since 2020 pill + YouTube/Facebook + "Our story" / "Proof & Rules" + kill-pill `NO GENERATORS · S2S VERIFIED · ROTATION`. Good above-the-fold trust without scam signals.
- Home correctly sequences: Hero → `SocialProofBar` → "From Vaultquest to Steam" demo (`HeroRedeemDemo`) → 3-step how-it-works. Footer repeats disclosure once (not spammy).
- Minor IA friction before fix: `/earn` had no holds/password reassurance chips inline and no empty-state (if `QUESTS` ever empty, page looked broken). `/rewards` gave no "manual 24–48h" reassurance at card level.

### Visual Polish
- Cold vault palette (`--vq-teal` on `--vq-bg-deep`/`--vq-bg-raised`) + Syne display + Sora body reads premium/cold, not scammy. Grid-fade + hero steam atmosphere is strong; CTA pulse is tasteful.
- `QuestRow` hover (`border-strong` + `surface-hover`) and focus ring (`--vq-focus`) are consistent. Rewards cards are clean 3-col.
- Scrollbar/overflow fix already landed and verified intact in `globals.css`:
  - `html { overflow-y: auto; scrollbar-gutter: stable; scrollbar-width/color; ::-webkit-scrollbar }` — no `overflow: hidden` anywhere.
  - `body { overflow-x: clip; overflow-y: visible; }` and `.vq-shell { overflow: visible; overflow-x: clip; }` — allows sticky header + stable gutter without clipping vertical scroll. No regression.

### Accessibility / Polish gaps fixed (see Changelog)
- Mobile "Menu" button had no `aria-label` change on open and weak focus treatment.
- No skip-to-content link for keyboard users.
- No `prefers-reduced-motion` guard for `vq-unlock`/`vq-cta-pulse`.

### What we deliberately did NOT do
- No fake counters, fake winner carousels, fake "users online" or "codes remaining" scarcity.
- No invented stats in footer/hero. The new footer trust row is factual claims about the system, not fabricated social proof.

---

## Prioritized Improvements Backlog

| # | Area | Improvement | Impact | Risk | Status |
|---|------|-------------|--------|------|--------|
| 1 | **Footer trust row** | Add persistent factual pill row (NO GENERATORS / NO PASSWORD ASKS / S2S VERIFIED / LINK ROTATION / MANUAL VAULT 24–48H) + "How we stay transparent → /proof" | High — every page gets honest reassurance without fake proof | Low — static markup, no data | **Done** |
| 2 | **Earn page trust inline** | Clarify S2S postback + holds, add holds/password chips, add empty-state, add disclosure footer anchor | High — highest-anxiety page | Low — copy + conditional render | **Done** |
| 3 | **Rewards card transparency** | "Typical delivery · manual vault" + "We never ask for Steam passwords · code via account" per card; vault note + How it works link | High — redemption is the scam-sensitive moment | Low | **Done** |
| 4 | **A11y: skip link + reduced-motion + mobile nav aria** | `globals.css` skip link + reduced-motion media query; `layout.tsx` `<main id="main">` + skip anchor; `SiteHeaderNav` aria-label toggle | Medium-High — a11y & polish, zero trust cost | Low | **Done** |
| 5 | Proof anchoring polish | Add copy-link anchors per section (🔗) and highlight active TOC pill on scroll (IntersectionObserver) | Medium — helps sharing "see how holds work" | Low-Med — small JS | Todo — next pass |
| 6 | Earn empty-state instrumentation | When rotation caps, show "quests paused — rotation retry in Xs" from inventory health API (no fake offers) | Medium | Low | Todo |
| 7 | Ledger empty-state CTA | In `/account`, when no entries: show "Start a quest" + "How holds work" with time-to-first-redeem honesty copy | Medium | Low | Todo |
| 8 | Giveaways schedule transparency | Publish next draw window (even as "TBD — rules publish X days before") so "Entries open after launch" feels scheduled, not vague | Medium | Low | Todo |

---

## Changelog — What Was Implemented Locally

### 1. `web/src/components/SiteFooter.tsx`
Added a factual trust row between the link grid and the legal line: mono pills for `NO GENERATORS`, `NO PASSWORD ASKS`, `S2S VERIFIED`, `LINK ROTATION`, `MANUAL VAULT 24–48H` (amber accent for the last, since it's the only expectation-setting pill), plus `How we stay transparent → /proof`. Kept affiliate disclosure line unchanged and factual.

### 2. `web/src/app/earn/page.tsx`
- Tightened tracked-quests banner: "Partners hit `/api/postback` (S2S) to credit VP after their hold clears" + guest vs authed copy ("Guest clicks are tracked but can't credit without an account").
- Added chip row below banner: `Holds 3–14 days by partner`, `We never ask for Steam passwords`, plus links to `/proof#earnings` and `/rewards`.
- Added genuine empty-state for `QUESTS.length === 0` (border-dashed, "No quests available right now — Partners rotate by region and cap. No fake offers are shown to fill this feed.")
- Added disclosure footer line linking to `/proof#disclosure`.

### 3. `web/src/app/rewards/page.tsx`
- Per card: `Typical delivery 24–48h · manual vault` + `We never ask for Steam passwords · code via account` (11px faint line).
- Added vault explainer bar below grid linking to `/proof#winners`.
- Added `How it works` alongside `Browse earn quests`.

### 4. `web/src/components/SiteHeaderNav.tsx`
- Mobile menu button: `aria-label` toggles "Open/Close navigation menu", label toggles `Menu`/`Close`, added `focus-visible:shadow-[var(--vq-focus)]` so keyboard users get the vault focus ring.

### 5. `web/src/app/globals.css`
- Added `.vq-skip-link` (offscreen until `:focus`) and `@media (prefers-reduced-motion: reduce)` that collapses animations/transitions to 0.01ms and disables smooth scroll.

### 6. `web/src/app/layout.tsx`
- Inserted `<a href="#main" class="vq-skip-link">Skip to content</a>` before header and gave `<main>` `id="main" tabIndex={-1}` for skip target.

---

## Verification

- `npx tsc --noEmit` attempted — sandbox not available on this Windows host (`workspace_readwrite` requires sandbox backend). Manual syntax check: all edited files parse, no missing imports, `Link` already imported where used (footer/earn/rewards), `SiteHeaderNav` retains client directive.
- Scrollbar fix confirmed intact in `globals.css` (no `overflow: hidden` regressions).
- No fake counters or scam signals introduced; voice unchanged.

---

## Next Recommended Pass (low-risk)

Implement backlog #5 (proof anchor copy-links + active TOC) and #7 (account empty-state CTA) — both pure UI, no ledger changes.
