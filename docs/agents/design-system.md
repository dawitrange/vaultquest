# Vaultquest design system

**Status:** Wave 1 brand lock for Home / Earn / Rewards / Giveaways comps  
**Mirrors:** Gamesbolt / Earnit *clarity* (quest framing, honest steps, live proof) — not their assets, colors, or logo marks  
**Avoid:** purple–indigo AI gradients, cream + terracotta serif kits, neon crypto casino, fake “CODE ACCEPTED” generator UI

---

## Visual direction

**Cold vault, signal teal.** Deep graphite chamber light, brushed steel surfaces, one electric teal for action, soft brass only on unlock moments. Atmosphere comes from real gameplay / vault-room photography — not abstract purple sludge.

One composition per first viewport. Brand name is the hero signal. Calm confidence over hype.

---

## CSS variables

```css
:root {
  /* Surfaces — cool vault chamber */
  --vq-bg-deep: #0b1014;
  --vq-bg: #11181f;
  --vq-bg-raised: #182028;
  --vq-bg-sunken: #0a0e12;
  --vq-surface: #1c262f;
  --vq-surface-hover: #243039;
  --vq-border: #2a3642;
  --vq-border-strong: #3d4d5c;

  /* Text */
  --vq-ink: #e8eef4;
  --vq-ink-muted: #9aabbc;
  --vq-ink-faint: #6b7d8f;

  /* Brand signals */
  --vq-teal: #2dd4bf;          /* primary action / earn */
  --vq-teal-dim: #14998a;
  --vq-teal-glow: rgba(45, 212, 191, 0.22);
  --vq-steel: #8fa3b8;         /* secondary chrome */
  --vq-brass: #c4a574;         /* vault unlock only — not page chrome */
  --vq-brass-dim: #8f7550;

  /* Semantic */
  --vq-success: #3ecf8e;
  --vq-warn: #e0b35a;
  --vq-danger: #e06b6b;
  --vq-info: #5ba4d9;

  /* Points / ledger */
  --vq-vp: var(--vq-teal);
  --vq-vp-pending: var(--vq-warn);

  /* Typography */
  --vq-font-display: "Syne", "Segoe UI", sans-serif;
  --vq-font-body: "Sora", "Segoe UI", sans-serif;
  --vq-font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Type scale (rem @ 16px) */
  --vq-text-hero: clamp(2.75rem, 6vw, 4.5rem);
  --vq-text-h1: clamp(2rem, 3.5vw, 2.75rem);
  --vq-text-h2: 1.75rem;
  --vq-text-h3: 1.25rem;
  --vq-text-body: 1rem;
  --vq-text-sm: 0.875rem;
  --vq-text-xs: 0.75rem;

  /* Space & radius */
  --vq-space-1: 0.25rem;
  --vq-space-2: 0.5rem;
  --vq-space-3: 0.75rem;
  --vq-space-4: 1rem;
  --vq-space-6: 1.5rem;
  --vq-space-8: 2rem;
  --vq-space-12: 3rem;
  --vq-space-16: 4rem;
  --vq-radius-sm: 6px;
  --vq-radius-md: 10px;
  --vq-radius-lg: 16px;        /* interactive panels only */
  --vq-radius-pill: 999px;     /* avoid for chrome; use sparingly on status */

  /* Motion */
  --vq-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --vq-ease-vault: cubic-bezier(0.16, 1, 0.3, 1);
  --vq-dur-fast: 160ms;
  --vq-dur-med: 320ms;
  --vq-dur-slow: 680ms;

  /* Focus */
  --vq-focus: 0 0 0 2px var(--vq-bg), 0 0 0 4px var(--vq-teal);
}
```

Light mode is optional later; default product chrome is dark vault. Do not invert into cream paper.

---

## Typography

| Role | Face | Weight | Notes |
|------|------|--------|-------|
| Brand / hero | Syne | 700–800 | Slightly industrial; brand wordmark + first-viewport name |
| Headings | Syne | 600–700 | Section titles only — never outrank brand on marketing hero |
| Body / UI | Sora | 400–600 | Readable quest copy, FAQ, rules |
| Vault points / IDs | IBM Plex Mono | 500–600 | Balances, VP deltas, giveaway codes (public winners only) |

Rules:
- Marketing hero: brand name ≥ headline size (or brand alone as the dominant wordmark, then one short line).
- No Inter / Roboto / Arial / system as the designed stack.
- Tracking: display slightly tight (`letter-spacing: -0.02em`); mono normal.

---

## Color usage

| Token | Use |
|-------|-----|
| `--vq-bg-deep` / `--vq-bg` | Page / full-bleed hero base |
| `--vq-surface` | Interactive panels (offer rows, redeem items) — not decorative cards |
| `--vq-teal` | Primary CTAs, Earn focus, available VP |
| `--vq-steel` | Icons, dividers, secondary buttons |
| `--vq-brass` | Vault unlock / redeem success only |
| `--vq-ink-muted` | Supporting sentences, time expectations |
| Semantic colors | Status chips inside interactive lists only |

**Do not:** gradient-wash the whole UI teal→indigo; flood glow; purple accents; warm parchment backgrounds.

---

## Brand-first hero rules

Applies to Home and any promotional landing.

1. **One composition** — first viewport = one scene, not a dashboard.
2. **Brand first** — “Vaultquest” is hero-level (wordmark or massive type). Headline must not overpower the brand.
3. **Hero budget** — brand + one headline + one short support line + one CTA group + one full-bleed atmosphere image. No stats strips, schedules, address blocks, or “this week” promos in the first viewport.
4. **Full-bleed only** — edge-to-edge gameplay / vault atmosphere. No inset hero cards, side-panel media, tiled collages, or floating image frames.
5. **No hero overlays** — no floating badges, “LIVE”, fake urgency chips, or promo stickers on the media.
6. **No cards in the hero** — CTAs are buttons/links on the composition, not nested card chrome.
7. **Honest promise** — align with master brief: earn via quests, Vault points, redeem / fair giveaways. No generator language.
8. **Dual CTA default** — primary **Start earning** → `/earn`; secondary **View giveaways** → `/giveaways` (or How it works).

Suggested hero copy (editable):

- Brand: **Vaultquest**
- Line: Earn gaming rewards honestly.
- Support: Complete quests, build Vault points, unlock Steam credit & keys — or enter fair giveaways.

---

## Layout & section rhythm

- Max content width ~1120–1200px; hero media full viewport width.
- One job per section: one headline + one short support sentence.
- Prefer lists, rows, and timelines over card grids for trust/proof.
- Cards allowed **only** when they are the container for a user interaction (offer start, redeem, enter giveaway). If removing border/shadow/radius doesn’t hurt interaction, remove it.

---

## Components

### Shared chrome

- **Primary button:** teal fill, deep ink text, `--vq-radius-md`, focus ring.
- **Secondary button:** steel border, transparent fill, ink text.
- **Ghost / text link:** muted ink → teal on hover.
- **Balance pill (header):** mono VP amount + teal tick; pending shown in warn.
- **Nav:** brand wordmark left; Earn · Rewards · Giveaways · How it works. No emoji.

### Earn (offer catalog)

Mirror Gamesbolt clarity: scannable quest list, time expectation, reward in VP, single Start action.

| Element | Behavior |
|---------|----------|
| Quest row | Icon/partner mark, title, short task type, est. time, VP reward, Start |
| Filters | Device / type / sort (reward, newest) — compact bar, not card wall |
| Status | Available / In progress / Pending / Credited |
| Empty / capped | Honest copy + failover messaging (rotation is under the hood) |
| Disclosure | Partner-funded; we earn when you complete — footer of list or How it works link |

**Interaction container:** raised surface row with border; hover lifts border to `--vq-border-strong`. Not a 3D multi-shadow card stack.

### Rewards (redeem catalog)

Framing: **Unlock from the vault.**

| Element | Behavior |
|---------|----------|
| Balance header | Available VP (teal) · Pending (warn) · min redeem note |
| Catalog item | Denomination / key type, VP cost, stock/availability, Unlock CTA |
| Confirm | Clear hold/fulfillment timing; never ask Steam password |
| Success | Brass flash + vault unlock motion (see Motion) |

Min redeem ~$5 Steam-equivalent unless Product revises — surface in UI copy.

### Giveaways

| Element | Behavior |
|---------|----------|
| Schedule block | Next draw date, prize, entry rules (account ± VP ± offer) |
| Entry control | One clear Enter / Spend VP control |
| Odds / rules | Linked, not buried in fine print only |
| Winners | Public list with date + prize; real data only |
| Tone | Fair & scheduled — not “everyone gets a free code” |

### Proof & How it works

- Step timeline (3–4 steps): Account → Complete quests → Earn VP → Unlock / enter giveaway.
- Live recent unlocks only when data is real.
- FAQ: time-to-reward honesty; no VPN/multi-account coaching.

---

## Motion (2–3 intentional moments)

Ship these; skip decorative ambient particle noise.

1. **Vault unlock (redeem success)**  
   Door/panel splits or latch turns; brief brass highlight on the reward name; settle to confirmation. Duration ~680ms, `--vq-ease-vault`. Respect `prefers-reduced-motion` → crossfade only.

2. **Points tick (ledger credit)**  
   VP balance counts up with mono numerals; short teal flash on the delta. Used after postback credit lands. ~320–500ms.

3. **CTA / Earn focus**  
   Primary button idle: soft teal edge pulse once on first hero paint (not infinite). Quest Start: 160ms surface press + arrow nudge.

Optional later (not required for v1): subtle parallax on hero atmosphere ≤4px — never competing with type.

---

## Imagery & texture

- Prefer real gameplay stills, dim PC-setup atmosphere, or photographed metal/vault textures.
- Overlay: cool gradient from `--vq-bg-deep` at edges for type legibility — not a purple vignette.
- Avoid stock “hacker HUD”, fake Steam overlays, and generator UIs.

---

## Accessibility

- Body contrast ≥ 4.5:1 on surfaces; teal on deep bg checked for large text/buttons.
- Focus visible via `--vq-focus`.
- Motion: honor `prefers-reduced-motion`.
- Don’t rely on color alone for pending vs available (include label).

---

## Home + Earn comp notes (for Product/FE)

**Home**
1. Full-bleed vault/gameplay hero — brand-first, dual CTA.
2. How it works (4 steps, honest time line).
3. Earn peek (3–5 live quest rows, not a card grid).
4. Giveaway next draw (single purpose section).
5. Proof + disclosures + footer.

**Earn**
1. Sticky balance + filters.
2. Dense quest list (Gamesbolt-like scanability).
3. Row detail drawer or expand for rules / geo / device — keep Start one click away.
4. Footer trust strip: rotation/failover invisible; user sees healthy offers only.

---

## Do / don’t (quick)

| Do | Don’t |
|----|--------|
| Brand-first full-bleed hero | Inset hero cards, badge spam |
| Teal action on graphite | Purple AI gradients, cream–terracotta |
| Interactive rows for offers | Decorative card farms |
| Honest time & partner copy | Generator / “working codes” visuals |
| 2–3 purposeful motions | Endless glow / confetti |
