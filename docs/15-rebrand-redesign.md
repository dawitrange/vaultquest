# 15 — VaultQuest Complete Redesign Handoff

**Date:** 2026-08-10 · **Lead:** trust-designer (Ethio) · **Scope:** One coherent delivery — web + Facebook + YouTube
**Source brand:** `docs/01-brand.md` + `docs/agents/design-system.md` + `docs/agents/youtube-channel-rebrand.md`
**Live checks:** `web/src/lib/site.ts` tagline verified · `web/src/app/about/page.tsx` keeps `youtube-nocookie` `sOQWHaHeCkg` · `web/src/components/SiteFooter.tsx` + `/proof` + `/about` cross-checked
**Model routing:** `trust-designer` → `anthropic/claude-3.5-sonnet` (fallback `openai/gpt-4o`) per `web/src/lib/agent-models.ts` / `.cursor/agent-models.json`

> **What changed (2026-08-10 rev — vault-wheel evolution):** Vault-wheel hero replaces VQ monogram — modern evolution of Ethio's reference (monochrome vault-wheel left + VAULT over QUEST with underline, handle bar beyond circle at ~45deg, tick ring). Refined: even tick weights, balanced brass 3-spoke handle with one spoke extending beyond the teal outer ring at 135deg, cold-vault palette. Banner now carries left wheel (300px) + horizontal VAULT/QUEST lockup inside safe. Wordmark-free wheel is the avatar. Nothing deployed — stage-only.

---

## 1. Logo — vault wheel mark (SAME across every surface — wordmark-free)

**Files:** `web/public/vaultquest-logo.svg` (800×800 avatar master) · `web/src/app/icon.svg` (512×512 favicon) — **same vault-wheel language**

| Field | Spec |
|-------|------|
| **Mark** | Vault wheel hero — thick teal outer ring (`#2dd4bf` 18px at 800px / 11px at 512px) on cold vault `#0b1014`. Precision tick ring outside the outer stroke (36 ticks, 10deg step — 12 major 16px/2.8w + 24 minor 10px/2.2w in `#e8eef4` with even spacing). Inner steel depth rings `#2a3642`/`#1c262f`. Center brass hub `#c4a574` with 3-spoke handle — **one spoke extends beyond the outer ring at 135deg** (reference evolution: Ethio's ~45deg bar, refined to 135deg SE for balance). Hub rivets subtle, center pin. No VQ monogram on the wheel — wheel is the identifier (unique evolution, not 1:1 copy). |
| **Legibility** | Holds at 36px circle (header) and 16px favicon — thick outer stroke + brass handle read at small scale; tick ring stays crisp without moire. Test: render at 36px and 98px — wheel + handle must remain distinct. |
| **Canvas** | Master 800×800 square (viewBox 0 0 800 800) · sRGB · no external fonts · valid XML (`xmlns`, `viewBox`, `width`/`height`, clean UTF-8 em-dash, no control chars). Exports at 800, 500, 98, 36. No wordmark on avatar — wordmark lives in banner + site header only. |
| **Palette** | Background `#0b1014`, teal stroke `#2dd4bf`, tick ink `#e8eef4`, brass `#c4a574` (handle+hub), steel rings `#1c262f`/`#2a3642`. Keep valid sRGB hex only. |
| **Do not** | Add purple glow, cream paper, gradient mesh, generator green, Steam logo, "CODE ACCEPTED" badge, or re-add VQ text inside the wheel. |

**Reference evolution notes (Ethio PNG — read via vision):** Monochrome left wheel + VAULT (bold, tight) over QUEST (spaced `0.24em`) with underline + tick marks + handle bar beyond circle. This rev keeps the *language* (thick ring + ticks + extended handle + stacked wordmark in banner) but refines weights, centers ticks evenly (36 vs reference's denser ring), balances the handle to 3 spokes with one extended spoke, and uses VaultQuest palette (teal/brass/cold vault) so it is a modern evolution, not a trace.

**Where it is used (one wheel, three places):**

- **Web:** `web/src/components/SiteHeader.tsx` renders the 32px (36px desktop) wheel roundel + `VaultQuest` wordmark in Syne; `web/src/app/icon.svg` serves the 512×512 wheel favicon (Next.js auto-discovers `/icon.svg`). Header text remains `SITE.name`.
- **Facebook avatar:** Export `vaultquest-logo.svg` → PNG 800×800 and 500×500, circular crop centered. Upload at `facebook.com/Freesteamcodes21` → Page avatar. Wheel must read at 40px comment size.
- **YouTube avatar:** Same 800×800 PNG (YouTube requires 800×800 min, displays circular). Studio → Customization → Branding → Picture.

**Export checklist — logo (updated):**

- [ ] `vaultquest-logo.svg` (vector master 800×800, already in `web/public/`) — keep for print/re-export
- [ ] PNG 800×800, sRGB, 72dpi, solid `#0b1014` base (no transparency — avoids white flash on dark mode)
- [ ] PNG 500×500 (Facebook high-res avatar fallback)
- [ ] PNG 98×98 (Facebook comment size test — wheel + handle must stay legible, no VQ needed)
- [ ] Favicon: `web/src/app/icon.svg` (512×512 wheel, Next.js auto-discovers) — Vercel emits `/icon.svg` + derived PNGs; no extra `favicon.ico` needed unless legacy (`pnpm dlx --yes favicons` or export 32×32 ICO)
- [ ] Verify: valid XML — `node -e "import('fs').then(fs=>{for(const f of ['web/public/vaultquest-logo.svg','web/src/app/icon.svg']) console.log(f, /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(fs.readFileSync(f,'utf8'))?'HAS CONTROL':'clean', fs.readFileSync(f,'utf8').includes('viewBox')?'viewBox ok':'NO viewBox')})"` — expect clean + viewBox ok

---

## 2. Banner — vault-wheel lockup + cold vault (2560×1440, safe 1546×423)

**File:** `web/public/vaultquest-banner.svg` (vector master; export to JPG for upload — YouTube + Facebook re-encode to JPG)

| Field | Spec |
|-------|------|
| **Master** | 2560×1440 px, `viewBox 0 0 2560 1440`, valid XML (no control chars, `xmlns` + `width`/`height` + sRGB hex) |
| **Safe area** | **1546×423** centered at 1280×720 → `x=507, y=508` — nothing critical outside it. Guide rect `id="safe-guide"` at `opacity 0.11` `stroke-dasharray 18 14` — **delete this one rect before JPG export** (or set `opacity="0"`). |
| **Lockup inside safe** | **Left vault wheel 300px** (center 700,720) — same wheel language as logo (teal outer ring 10px, tick ring at r 147, brass 3-spoke handle with one spoke beyond ring at 135deg, brass hub). **Wordmark right of wheel:** `VAULT` 132px Syne 800 tight `-0.04em` at `895,698` over `QUEST` 76px Syne 700 `letter-spacing 0.24em` at `895,810` — reference evolution (VAULT bold over QUEST spaced). **Teal underline 2.5px** `900,720 560w` between them. Tagline `Transparent gaming rewards` 28px Sora `#9aabbc` at `900,866`, mono `vaultquest.io` 18px IBM Plex Mono `#6b7d8f` `0.14em` at `900,902`. All text 100% inside safe. |
| **Background outside safe** | Cold vault chamber — dim brushed steel panels left/right with rivet lines, center vault light pool, floor line. Teal rim radial at 72%/38% (16%→0), steel wash at 22%/72%, bottom 980–1440 42% `#0b1014` legibility overlay. No gameplay collage, no purple sludge, no Steam grid, no duplicate VQ. Wheel + wordmark are the hero. |
| **Don't** | Fake badges ("100% LEGIT"), "LIVE CODES" pills, neon casino glares, emoji clusters, QR codes, countdown timers, multiple taglines, or second VQ badge on banner. Brass only on the wheel hub/handle. |

**Where it is used:**

- **YouTube banner:** Studio → Customization → Branding → Banner image → upload 2560×1440 JPG (≥2048×1152, ≤6MB, sRGB). Preview TV/desktop/mobile — wordmark + wheel never clip.
- **Facebook cover:** Page → Edit cover photo → Upload same 2560×1440 JPG (Facebook scales to 820×312). Centered crop keeps lockup intact.

**Export checklist — banner (updated):**

- [ ] Keep `vaultquest-banner.svg` as master — safe guide is exactly one `<rect id="safe-guide" x="507" y="508" width="1546" height="423" rx="18" ... opacity="0.11">` — delete it before final JPG
- [ ] JPG 2560×1440, quality 82–88, sRGB, 400–900 KB (JPG smaller than PNG for gradients; platforms re-encode anyway)
- [ ] Optional PNG 2560×1440 archival (~2–3 MB)
- [ ] Test: YouTube Studio preview at 30% (mobile safe) and 100% (TV); Facebook desktop + mobile cover preview — wheel left + VAULT/QUEST inside safe on every crop
- [ ] Verify before export: `node -e "import('fs').then(fs=>{const s=fs.readFileSync('web/public/vaultquest-banner.svg','utf8');console.log('has safe-guide',s.includes('id=\"safe-guide\"'),'has viewBox',s.includes('viewBox'),'control',/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s))})"` → `true true false`

**Quick convert (local — updated for safe-guide delete):**

```powershell
# 1) Duplicate and strip safe-guide rect before rasterizing
Copy-Item web/public/vaultquest-banner.svg web/public/vaultquest-banner-export.svg
# Delete the single line containing id="safe-guide" from the export copy (or set opacity="0")
# 2) Rasterize — pick one:
magick -background "#0b1014" -density 300 web/public/vaultquest-banner-export.svg -quality 86 -colorspace sRGB web/public/vaultquest-banner-2560.jpg
magick web/public/vaultquest-logo.svg -resize 800x800 -colorspace sRGB web/public/vaultquest-logo-800.png
magick web/public/vaultquest-logo.svg -resize 500x500 -colorspace sRGB web/public/vaultquest-logo-500.png
# Alternative: Inkscape or browser DevTools capture full-size screenshot; cloudconvert.com/svg-to-jpg at 2560x1440 86q sRGB
```

---

## 3. Previous ads / posts — audit: what to clean vs keep

**Policy basis:** `docs/agents/compliance.md` §0 Kill list + §1 Claims · `docs/00-master-brief.md` Claims policy · `docs/03-old-model-autopsy.md`

Codebase scan (`rg` no-survey/generator/gestyy) is **clean** — no site pages carry banned claims. Facebook/YouTube history was not auto-deleted via API (no token, brittle, and manual review is safer for a 2020 page). Use this recommendation-only table and clean manually.

### Keep (do NOT delete)

| Item | Where | Why |
|------|-------|-----|
| `https://youtu.be/sOQWHaHeCkg` — legacy free-Steam explainer (pre-rebrand) | Embedded in `/about` via `youtube-nocookie` + linked as Legacy video pill | **Required keep.** Historical artifact; framed as 2020 context, not current claim. Proves continuity for reviewers. |
| Any 2020-era Facebook "Page created Dec 26, 2020" transparency or welcome posts that show the creation date | Facebook Page Timeline → Page Transparency | Keep public — age proof for Torox/Lootably/AdGate reviewers. Do not hide age signal. |
| VaultQuest-era posts already in new voice (if any) | Facebook / YouTube Community | Keep as the new baseline. |

### Clean (archive, hide, or delete manually)

| Pattern | Example to find | Action |
|---------|-----------------|--------|
| gestyy / opaque shortlinks as primary CTAs | `gestyy.com`, `bit.ly` wrapping Freecash/PointsPrizes without disclosed destination | **Delete or edit** — replace with `vaultquest.io` → rotated link under the hood. Opaque shortlinks are spam reputation risks per compliance §0. |
| "NO SURVEY OR DOWNLOAD" | Thumbnail text, ad copy, descriptions claiming no surveys when surveys/offers exist | **Delete** — absolute ban; partner/ad-review nuke |
| "Working codes 2026" / generator screenshots / "CODE ACCEPTED" progress bars | Old thumbnails/posts showing fake Steam code generators | **Delete/unlist** — scam UI, ban risk |
| "Instant free $50" / guaranteed dollar amounts / fake urgency ("codes expire in 3 min") | Ad creatives, captions | **Delete** — contradicts margin rule (never promise redemption > expected yield × 70% share) |
| Manual fulfillment flow "Do Code #1 → Contact Us → we email a code" | Weebly-era instructions, DMs asking for screenshots of Freecash for manual code | **Delete instructions**; if keeping Weebly as archive, label it deprecated in the post ("Legacy funnel — replaced by verified ledger") |
| Asking for Steam passwords or account credentials | Any post/DM template requesting Steam login | **Purge immediately** — fraud/to theft risk |
| Thin "PROOF WE ARE REAL" with no ledger/winners/rules | Old posts claiming legitimacy without data | **Delete** — replaced by `/proof` 9 sections + `/about` timeline |
| Donation-as-product narrative / "donate to get codes" | Legacy framing | **Delete** — not the earn path |
| Raw CPA as sole destination without disclosed vaultquest.io first | Posts that link directly to Freecash/PointsPrizes without site context | **Edit** — add `vaultquest.io` as primary; Freecash is one quest inside `/earn` (`cpa_signup` P1 when Impact link healthy) |

**No API auto-delete was run.** Owner reviews each post, then archives/hides in Facebook Pages Manager and unlists/hides legacy YouTube videos that fail the new claims policy (add disclaimer if kept public: "Pre-2026 content — current earn path at vaultquest.io").

---

## 4. Bios — paste-ready (transparent voice, no hype)

All three use the same promise; `honest` appears once per bio max (system avoids repetition per compliance voice `direct, gamer-native, calm confidence`). Colors and type match `design-system.md`.

### A — Facebook Page Bio / Intro

**Settings path:** Facebook → `Free Steam Wallet Codes - ZaKai` (`@Freesteamcodes21`) → Manage Page → Settings → Page Info → **Name** `VaultQuest` (keep **username** `Freesteamcodes21` until migration) → **Intro / Bio** + **About** + **Website** + **Category**

**Category:** Gaming / Video Game Store or Internet Company (whichever Facebook offers closest to Rewards Hub — pick one, keep it consistent with Impact profile)

**Website:** `https://vaultquest.io`

**Intro (short, 101 chars — fits Page header):**

```
VaultQuest — gaming rewards since Dec 2020. Quests → Vault points → Steam.
```

**Bio / About (paste):**

```
VaultQuest — gaming rewards platform, operating since Dec 26, 2020 as ZaKai (YouTube @zakai1769 + Facebook Freesteamcodes21, 67 followers).

Complete partner quests to build Vault points, then unlock Steam credit & keys from the vault — or enter fair, scheduled giveaways. Some quests involve surveys or app/game milestones. Time varies by offer and region; nothing is guaranteed.

We may earn when you complete qualifying offers — that funds the vault. No generators. No Steam password asks. Rewards are partner-funded and ledger-verified (PENDING → POSTED after 3–14 day holds).

Site: vaultquest.io · Since 2020 story: vaultquest.io/about · Rules: vaultquest.io/proof
Not affiliated with Valve / Steam.
```

**Pronouns/extra fields:** Username stays `Freesteamcodes21`; after rename, verify the Page Transparency creation date still shows **Dec 26, 2020** — that is the proof point, not the handle.

### B — YouTube About

**Settings path:** YouTube Studio → Customization → Basic Info → **Channel name** `VaultQuest` → **Handle** keep `@zakai1769` until `@vaultquest` free → **Description** paste below → **Links** → **Contact** email

**Description (paste — reuse of `docs/agents/youtube-channel-rebrand.md` with disclosed voice):**

```
VaultQuest — earn gaming rewards with a clear earn path.

Complete real quests and partner offers, build Vault points, and unlock Steam credit & keys — or enter fair, scheduled giveaways. No generators. No password asks. No fake "working codes."

We show how it works: typical time ranges, partner-funded rewards, and verification holds before points post. When you finish a quest, we earn a commission — that's how the vault stays stocked.

Start here: https://vaultquest.io
How it works · Earn · Rewards · Giveaways · Proof & Rules

Business / partner: [support email from /contact]

Not affiliated with Valve Corporation or Steam.
Some links may be affiliate / partner links — we may earn when you complete qualifying offers.
```

**Links row (priority order):**

1. `https://vaultquest.io` — VaultQuest site (primary CTA — never raw CPA only)
2. `https://vaultquest.io/earn`
3. `https://vaultquest.io/giveaways`
4. `https://vaultquest.io/proof` (Proof & Rules)
5. `https://www.facebook.com/Freesteamcodes21` (once renamed, keep same URL)
6. Discord when live (per `docs/agents/marketing-social.md` decision — not invented here)

**Channel keywords (Settings → Advanced):**

```
vaultquest, earn steam, steam wallet, steam gift card, gaming rewards, vault points, offer quests, partner rewards
```

**Advanced settings:**

- `Made for kids`: No
- Category: Gaming or HowTo & Style
- Location: match operator / Impact profile
- Keep comments **on**, enable end screens + cards by default

### C — Site promise / tagline / footer — verification

| Surface | Value | Status |
|---------|-------|--------|
| `web/src/lib/site.ts` `SITE.tagline` | `Transparent gaming rewards` | ✅ Already correct — no change. `SITE.promise` is `Complete quests, build Vault points, unlock Steam credit & keys — or enter fair giveaways.` |
| `web/src/app/page.tsx` hero | `SITE.name` + `SITE.tagline` + `SITE.promise` rendered hero-first | ✅ Matches banner copy |
| `web/src/components/SiteFooter.tsx` | `{SITE.tagline}. Partner-funded rewards — not generators. Since 2020 → /about` + trust pills `NO GENERATORS · NO PASSWORD ASKS · S2S VERIFIED · LINK ROTATION · MANUAL VAULT 24–48H` + affiliate disclosure | ✅ Already consistent — no edit needed beyond header mark |
| `web/src/app/about/page.tsx` | Timeline 2020→2026 with `youtube-nocookie` embed `sOQWHaHeCkg` + timeline pills | ✅ Keep as-is, video preserved |
| `web/src/app/proof/page.tsx` | 9 sections + earnings math `100 VP = $1 at 70% share` | ✅ Consistent with bios above |

If you ever change `SITE.tagline`, re-export banner safe text to match — brand line must stay identical across web header, banner, and bios.

---

## 5. Photos / Post — announcement drafts

### Photos to replace (cover, avatar, featured)

| Asset | Replace with | Size | Notes |
|-------|-------------|------|-------|
| **Facebook Page avatar** | `vaultquest-logo-800.png` (from `vaultquest-logo.svg`) | 800×800, sRGB | Circular crop — center VQ, teal stroke visible at 40px comment size |
| **Facebook cover** | `vaultquest-banner-2560.jpg` (from `vaultquest-banner.svg`, safe 1546×423 type intact) | 2560×1440 JPG, 82–88q | Test desktop (820×312 crop) + mobile — wordmark never clips |
| **YouTube avatar** | Same `vaultquest-logo-800.png` | 800×800 min (YouTube requires) | Same file as Facebook — consistency is the point |
| **YouTube banner** | Same `vaultquest-banner-2560.jpg` | 2560×1440 JPG, ≤6MB | Safe area holds on TV/desktop/mobile |
| **YouTube thumbnail (Video 01 refresh, optional)** | Dark graphite base, teal bar, Syne title `HONEST STEAM` or `EARN → VAULT` | 1280×720 | Per `docs/agents/marketing-youtube.md` §3.2; never fake "CODE ACCEPTED" |
| **Featured / pinned post image** | 1200×630 variant of vault banner (crop center 1546×423 safe slice, add margin) | 1200×630 JPG | Use for the Facebook announcement post itself + Open Graph share preview |

**Image direction (for any new photo shoot or stock pick):**

- Cold vault chamber: dim steel, concrete, overhead softbox. One teal rim (window or LED strip) — not purple. Real gameplay or PC-setup stills are acceptable alternates, but banner stays vault-room so it reads at thumbnail scale.
- No: money rain, neon "FREE", floating Steam gift-card grids, fake code screenshots, hacker HUD, or AI purple vignettes.
- Human presence: optional; if used, calm confidence — not rage-face. Product stays the hero.

### Announcement post — Facebook (paste-ready)

**Post type:** Photo post with `vaultquest-logo-800.png` badge overlay or vault banner crop. **Pinned** after posting. Keep comments on.

```
ZaKai → VaultQuest.

Same community since Dec 26, 2020 — new name, new platform.

We kept the community that started as Free Steam Wallet Codes on @Freesteamcodes21 and @zakai1769. We replaced the old email-for-code flow with a clear earn path you can check anytime:

  Quests → Vault points → Steam credit & keys.
  Fair giveaways, rules on the page. No generators. No Steam password asks.

Points post after partner verification (usually 3–14 days). Time varies by offer and region — we show ranges, not promises. We fund the vault from partner commissions when you complete qualifying offers.

What's next: quests are live at vaultquest.io/earn, redemptions at /rewards, and rules at /proof. The old video from 2020 stays on /about as history — the current path is on the site.

Link in bio: https://vaultquest.io
Since 2020 story + video: https://vaultquest.io/about

Thanks for staying since 2020 — see you in the vault.

#VaultQuest #SteamRewards #GamingRewards
```

**First comment (post as Page, pin):**

```
Quick disclosure: some links are affiliate / partner links. We may earn when you complete offers — that's what keeps rewards funded. See how it works: vaultquest.io/how-it-works · Rules: vaultquest.io/proof
Not affiliated with Valve / Steam.
```

### Announcement post — YouTube Community (paste-ready)

**Post type:** Community text + vault image + link to site (not only raw CPA). Publish from `@zakai1769` (now VaultQuest display name).

```
VaultQuest is live.

ZaKai (2020) → VaultQuest (2026). Same operator, same community — new name, new platform.

If you joined for free-Steam guides back in 2020, thank you — we're still here. The path is now on our own site with a ledger you can check:

  Complete quests → build Vault points → unlock Steam credit & keys.
  Or enter fair, scheduled giveaways. Rules on the page.

Why the rebrand: we retired opaque shortlinks and email-for-code steps. Rewards are partner-funded and verified server-to-server. Points post PENDING → POSTED after holds clear (3–14 days). No generators. No Steam passwords. Ever.

Start at https://vaultquest.io
See our story + original 2020 video: https://vaultquest.io/about
Rules + disclosure: https://vaultquest.io/proof

What to watch next: the honest earn-path walkthrough + giveaway rules.

— VaultQuest
```

**Alt short version (if you want a tighter community post):**

```
ZaKai → VaultQuest. Same community since 2020. Clear Steam earn path — link in bio.

Quests → Vault points → Steam credit. Holds, rules, and proof on the site. No generators, no password asks.

https://vaultquest.io · https://vaultquest.io/about

We stayed since 2020 — now the vault has a ledger.
```

### Posting cadence (next 2 weeks, per `docs/agents/marketing-social.md` shape)

1. Day 0: **Rebrand announcement** (above) + avatar/banner swap
2. Day 2–3: **How it works explainer** — infographic or 30s clip of Home → Earn → Rewards → Hold bar + `/how-it-works` link
3. Day 5–7: **Giveaway rules** — "How fair draws work" + `/giveaways` + `/proof` links (no guaranteed win language)
4. Pin the rebrand post until the next giveaway draw; keep older 2020 posts public for age proof

---

## 6. Export sizes & handoff table

| Deliverable | Master file | Export | Size | sRGB | Used at |
|-------------|------------|--------|------|------|---------|
| Logo / avatar | `web/public/vaultquest-logo.svg` | `vaultquest-logo-800.png` | 800×800 | yes | YouTube avatar, Facebook avatar |
| Logo fallback | same | `vaultquest-logo-500.png` | 500×500 | yes | Facebook comment density test |
| Logo tiny test | same | 98×98 PNG | 98×98 | yes | Visual QA — wheel + handle legible (no VQ) |
| Banner master | `web/public/vaultquest-banner.svg` | `vaultquest-banner-2560.jpg` | 2560×1440 | yes, 82–88q | YouTube banner, Facebook cover |
| Banner archive | same | `vaultquest-banner-2560.png` | 2560×1440 | yes | Archival lossless |
| OG / post image | banner safe slice | `vaultquest-og-1200x630.jpg` | 1200×630 | yes | Facebook announcement image, OG fallback |
| Favicon | `web/src/app/icon.svg` | Auto PNG generation by Next.js | 512, 180, 32 | yes | Browser tab, iOS touch |

**Fonts:** Syne 700–800 (display/wordmark), Sora 400–600 (body), IBM Plex Mono 500–600 (balances/IDs/CTA strip). Already loaded in `web/src/app/layout.tsx` via `next/font/google`.

---

## 7. Keep vs Clean — quick reference table

| Status | Item | Evidence / location |
|--------|------|---------------------|
| **KEEP** | YouTube video `sOQWHaHeCkg` embedded via `youtube-nocookie` | `web/src/app/about/page.tsx:152` — framed as historical context, not current claim |
| **KEEP** | `youtube-nocookie` domain (privacy) | About page iframe `referrerPolicy strict-origin-when-cross-origin` |
| **KEEP** | Continuity timeline Since Dec 26, 2020 | `/about` + `SiteFooter` + `SocialProofBar` |
| **KEEP** | `impact-site-verification` meta `6c1cfdb4-889e-4703-8c10-f8a4960fb83a` | `web/src/app/layout.tsx:35` |
| **CLEAN** | gestyy / opaque shortlinks as primary CTAs | Remove from old posts; use `vaultquest.io` first, rotator under the hood |
| **CLEAN** | "NO SURVEY" claims | Delete — surveys/offers are disclosed in bios + `/proof` |
| **CLEAN** | Generator screenshots / "Working codes 2026" | Delete/unlist |
| **CLEAN** | Guaranteed $ / instant free $50 / fake urgency | Delete |
| **CLEAN** | Steam password asks | Purge |
| **CLEAN** | Contact-gated manual code fulfillment | Delete instructions |
| **CLEAN** | Fake "PROOF" badges / synthetic winner feeds | Delete — replaced by ledger-backed proof surface |

---

## 8. What needs manual upload (stage-only — no auto-push)

> **Rev 2026-08-10 — vault-wheel evolution (Ethio reference):** Logo + banner + favicon rewritten as modern evolution of the monochrome vault-wheel reference (left wheel + VAULT over QUEST with underline, handle beyond circle, tick ring). Refined weights, 36 even ticks, brass 3-spoke handle with one spoke beyond ring at 135deg, cold-vault palette `#0b1014`/`#2dd4bf`/`#c4a574`/`#e8eef4`. Avatar is now wordmark-free wheel; banner carries left 300px wheel + horizontal VAULT/QUEST lockup inside safe. All SVGs clean UTF-8, em-dash `—` U+2014, no control chars, valid `xmlns`+`viewBox`+`width`/`height`, sRGB hex, no external fonts, safe-guide `id="safe-guide"` (delete one rect before JPG). Prior fix 87419530 (U+0014 control char `�` in title) preserved — see §8.1. Re-export PNG/JPG before uploading — Facebook/YouTube strip SVG.

This turn staged vector masters and `icon.svg` + `SiteHeader` mark only. These still need a human click:

- [ ] **Facebook** (logged in as Page owner): avatar 800×800 PNG, cover 2560×1440 JPG, paste Intro/Bio from §4A, set Category + Website `https://vaultquest.io`, rename Page to **VaultQuest** (keep username), pin announcement post from §5
- [ ] **YouTube Studio** (`@zakai1769`): rename display name to **VaultQuest**, paste About + Links from §4B, upload avatar 800×800, banner 2560×1440, add banner alt text, verify handle change opportunity for `@vaultquest` later, create Community post from §5
- [ ] **Exports:** Generate JPG/PNG from the two SVGs — **do not upload the raw `.svg` to Facebook/YouTube.** Facebook cover/avatar and YouTube banner/avatar transcode to JPG and strip SVG. Export first (steps in §8.1), then upload the JPG/PNG. For the banner, delete the single `<rect id="safe-guide" … opacity="0.11" stroke-dasharray="18 14">` before final JPG, or set its `opacity="0"`. Also export 1200×630 OG/post image with the announcement.
- [ ] **Review pass:** Archive/hide legacy scammy posts per §3 table; keep `sOQWHaHeCkg` and 2020 age posts public
- [ ] **Vercel (when ready to stage):** verify `web/src/app/icon.svg` renders as favicon in preview; no env change needed

**Not done this turn (intentionally):** `git push` / `vercel deploy` — stage-only per brief. Owner runs `git add` → `git commit` → `git push` then Vercel auto-deploys `b84b03b → next`.

### 8.1 Fix detail + exact export steps (Ethio 87419530)

**What was broken:**
- `vaultquest-logo.svg` line 2 `<title>VaultQuest \x14 VQ…</title>` and `vaultquest-banner.svg` line 2 `<title>… 2560�1440… safe 1546�423</title>` contained illegal XML char `U+0014` / `�` (control/replacement char). Chrome, `resvg`, `sharp`, and Facebook's transcoder reject the file as not well-formed XML — shows blank/broken image. No `viewBox` issue — both already had correct `xmlns`, `viewBox`, `width`/`height`, sRGB colors, no `clipPath` that breaks Facebook JPG transcoder.
- Secondary: Facebook/YouTube never accept SVG upload. Even a valid SVG must be exported to PNG (avatar) or JPG (banner) in sRGB before upload.

**What was fixed (this turn — vault-wheel evolution, in place):**
- Rewrote `web/public/vaultquest-logo.svg` (800×800) as vault-wheel hero: thick teal outer ring 18px at `r=268`, 36 even ticks outside ring at `r=298` (12 major 16×2.8 + 24 minor 10×2.2 in `#e8eef4`), inner steel rings, brass 3-spoke handle with one spoke beyond ring at 135deg (135/255/15), brass hub `#c4a574`. Wordmark-free — wheel reads at 36px.
- Rewrote `web/public/vaultquest-banner.svg` (2560×1440) as wheel + wordmark lockup: same cold-vault chamber, left 300px wheel at `700,720` (teal ring 10px, tick ring at `r=147` on 15deg steps, handle at 135/255/15), right wordmark `VAULT` 132px + `QUEST` 76px `0.24em` with 2.5px teal underline `900,720 560w`, tagline + `vaultquest.io` mono — all inside safe `507,508 1546×423`.
- Rewrote `web/src/app/icon.svg` (512×512) as matching wheel favicon: 512 viewBox, teal ring 11px, 24 ticks at `r=192` 15deg steps, same 3-spoke handle, brass hub — tab matches avatar.
- All three: clean UTF-8, `—` em-dash, no control chars `U+0014`, valid `xmlns` + `viewBox` + `width`/`height`, sRGB hex `#0b1014`/`#2dd4bf`/`#e8eef4`/`#c4a574`/`#1c262f`/`#2a3642`, no external fonts or `clipPath`. Banner safe-guide remains `<rect id="safe-guide" x="507" y="508" width="1546" height="423" rx="18" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-dasharray="18 14" opacity="0.11"/>` — delete exactly this one rect before JPG (or `opacity="0"`).

**Export — pick one method (no extra install needed for option A):**

**A — Browser canvas (no install, recommended for Ethio now):**
1. Open `web/public/vaultquest-logo.svg` in Chrome via `file://` — you should see the vault wheel with teal ring + tick marks + brass 3-spoke handle (one spoke beyond ring). Inspect → no XML error. Banner: same — chamber + left wheel + VAULT/QUEST + faint dashed safe rect; no blank page.
2. Logo → PNG: DevTools Console: `fetch(location.href).then(r=>r.text()).then(s=>console.log('bytes', s.length, 'viewBox', s.includes('viewBox')))` — expect ~6k bytes + viewBox true. Capture: `Ctrl+Shift+P` → "Capture full size screenshot" → PNG at DPR. For exact 800×800, use https://cloudconvert.com/svg-to-png or Figma Import → Export 800×800 PNG sRGB.
3. Banner → JPG: Duplicate → `vaultquest-banner-export.svg` → delete the single `<rect id="safe-guide"...>` → open export SVG → `Ctrl+Shift+P` → Capture → convert PNG→JPG at 86q (or cloudconvert svg-to-jpg 2560×1440 86q sRGB). Ensure 2560×1440 sRGB 400–900 KB; confirm left wheel + VAULT over QUEST inside safe at `507,508`.

**B — Inkscape (lossless vector raster):**
```powershell
# Logo
inkscape web/public/vaultquest-logo.svg --export-type=png --export-width=800 --export-height=800 --export-filename=web/public/vaultquest-logo-800.png
inkscape web/public/vaultquest-logo.svg --export-type=png --export-width=500 --export-height=500 --export-filename=web/public/vaultquest-logo-500.png
# Banner: first remove safe-guide rect, then
inkscape web/public/vaultquest-banner-export.svg --export-type=jpg --export-width=2560 --export-height=1440 --export-filename=web/public/vaultquest-banner-2560.jpg
```

**C — ImageMagick / rsvg / sharp (if already installed):**
```powershell
magick -background "#0b1014" -density 300 web/public/vaultquest-banner-export.svg -quality 86 -colorspace sRGB web/public/vaultquest-banner-2560.jpg
magick web/public/vaultquest-logo.svg -resize 800x800 -colorspace sRGB web/public/vaultquest-logo-800.png
magick web/public/vaultquest-logo.svg -resize 500x500 -colorspace sRGB web/public/vaultquest-logo-500.png
# Node sharp alt:
node -e "import('sharp').then(m=>m.default('web/public/vaultquest-logo.svg').png().toFile('web/public/vaultquest-logo-800.png'))"
# Verify XML parses (no control chars):
node -e "import('fs').then(fs=>{for(const f of ['web/public/vaultquest-logo.svg','web/public/vaultquest-banner.svg']){const s=fs.readFileSync(f,'utf8'); console.log(f, 'len', s.length, 'has xmlns', s.includes('xmlns'), 'viewBox', s.includes('viewBox'), 'has control', /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s))}})"
```

**After export, upload:** Facebook Page → avatar = `vaultquest-logo-800.png` (800×800 PNG), cover = `vaultquest-banner-2560.jpg` (2560×1440 JPG, sRGB, 82–88q). YouTube Studio → avatar same PNG, banner same JPG. Keep the masters `*.svg` in `web/public/` for re-export/OG 1200×630 crop.

---

## 9. Files created / touched this turn

| File | Action |
|------|--------|
| `web/public/vaultquest-logo.svg` | **Rewritten** — 800×800 vault-wheel hero (teal ring + 36 ticks + brass 3-spoke handle extended at 135deg, wordmark-free, 36px-legible) |
| `web/public/vaultquest-banner.svg` | **Rewritten** — 2560×1440 wheel + wordmark lockup (left 300px wheel at 700,720 + VAULT over QUEST`0.24em` + 2.5px teal underline + Transparent gaming rewards tagline, all inside safe 1546×423) |
| `web/src/app/icon.svg` | **Rewritten** — 512×512 wheel favicon to match logo (teal ring 11px + same handle/ticks) — tab matches avatar |
| `web/src/components/SiteHeader.tsx` | **Updated** — inline 48×48 vault-wheel SVG (teal ring + brass handle) replaces VQ text roundel; still `SITE.name` for rename tracking |
| `docs/15-rebrand-redesign.md` | **Created** — this handoff |
| `web/src/lib/site.ts` | Read-verified only — `Transparent gaming rewards` already correct |
| `web/src/app/about/page.tsx` | Read-verified — `youtube-nocookie` `sOQWHaHeCkg` preserved |
| `web/src/components/SiteFooter.tsx` | Read-verified — tagline + trust pills + disclosure intact, no change needed |

---

## 10. Paste-ready block (copy all three at once)

**Facebook Intro:** `VaultQuest — gaming rewards since Dec 2020. Quests → Vault points → Steam.`
**YouTube About:** See §4B — paste the 12-line block starting `VaultQuest — earn gaming rewards with a clear earn path.`
**Site tagline:** `Transparent gaming rewards` (already live via `SITE.tagline`)

---

## 11. Plugin log (updated 2026-08-10 22:45 — Ethio tail run)

- `apify` — **connected** (live crawl `Kv41QsupXiXDCc2Mr` warm reused per instruction + tail `s349ErrlIrZVOgTaM` FB `vaultquest22` 200 + `fgDtXFC6xuz4aN0YA` q-freecash → `freecash.com/en?ref=14APDV` 200; ~0.029 CU tail ~$0.03)
- `agentmail` — **connected** (support inbox `vaultquest-support@agentmail.to` created 2026-08-10T02:45:52.055Z — `list_inboxes` now 2; ping `94b02178-b2e1-4b94-874a-3193c6d43c3b` via `dawit-5378@agentmail.to` still valid — claims audit 9/9 PASS; `SUPPORT_INBOX_ID` staged in `web/.env.example`, `support@vaultquest.io` → inbox forwarding is manual DNS step per `docs/16-support-agent.md` §1, `SiteFooter`+`/contact` now link it)
- `datadog` — **connected** (Ethio 22:45 correction: was `enabled:false` optional → now `plugins.datadog.enabled:true` per `.cursor/settings.json`; `plugin-datadog-datadog` + `project-0-vaultquest-vercel` for runtime logs/errors; `web/src/lib/affiliates.ts` `logRotation` still mirrors health per `04-affiliate-constraints.md` — no block)

**2026-08-10 22:45 tail status — rebrand → staged (only manual uploads remain):** Web READY (logo/banner/header/icon per §§1–2+9), Facebook rename staged (Page name VaultQuest, handle keeps `Freesteamcodes21` — new `vaultquest22` resolves 200 per `s349Errl` but rename review is manual), support inbox staged, `www.vaultquest.io/about` 200 + `www.vaultquest.io/api/go/q-freecash` 307→`freecash.com/en?ref=14APDV` verified. Announcement post queued — **post AFTER** exporting `vaultquest-logo.svg→PNG 800×800` and `vaultquest-banner.svg→JPG 2560×1440` (delete the `opacity 0.11` safe-guide `<rect x=507 …>` first) per §5.

### Article queued per tail brief (§§4A/11 + 10 §6)

> Also queued in `docs/task_logs.md` as the live task log. Source for paste is `docs/15-rebrand-redesign.md` §5 / `docs/10-legitimacy-application-pack.md` §1 — verbatim below, staged not posted.

---

## 12. Brand token lock (quick ref)

`--vq-bg-deep #0b1014` · `--vq-bg #11181f` · `--vq-teal #2dd4bf` · `--vq-brass #c4a574` · `--vq-ink #e8eef4` · Syne (display) + Sora (body) + IBM Plex Mono (IDs/mono strip) — per `docs/agents/design-system.md` + `web/src/app/globals.css`.

*Next: owner completes manual uploads (§8), then `vault-build-check` (`pwsh .cursor/skills/vault-build-check/scripts/check.ps1`) before staging to Vercel. Browser agent at `settings/?tab=page_info` continues Page rename; this file is the single source for image + copy paste.*
