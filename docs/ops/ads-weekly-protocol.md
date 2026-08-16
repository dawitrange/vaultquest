# VaultQuest ads weekly protocol

**Repo ops draft.** Builder: PR this file to `docs/ops/ads-weekly-protocol.md`.
**Role:** Traffic drafts. Manager (Ethio Gamer) approves spend and copy. Builder lands the PR.
**This file is ops law.** It is not a launch order and it is not permission to spend.

Last updated: 2026-08-15 (America/New_York). Landing override in this draft is newer than any homepage-as-CTA instruction.

---

## 1. Weekly cadence (America/New_York)

- Work ads in **weekday hours**, America/New_York (Mon–Fri). Do not treat weekend nights as a launch window unless Manager names one.
- Monday: Manager names the campaign (or keep `brand-waitlist`) and whether any cell may run. Traffic does not assume a go.
- Mid-week: Traffic reports live cells (if any): spend, CPC, `/earn` landing clicks, UTM, post URL. Kill anything that trips §7.
- Friday: Traffic files the week’s post URLs + UTMs to Manager. No leftover “boost tonight” on the queue without a named weekday start.
- After every post (paid or organic): report **post URL + UTM** to Manager. Do not wait for the Friday rollup.

Queued tests stay queued until Manager says they may run. A queued $20 boost is not a live cell.

---

## 2. Default landing (paid and organic)

**LANDING OVERRIDE (mandatory):** paid **and** organic land on **https://www.vaultquest.io/earn** (CPX).

- The site **homepage is not the CTA.** Do not send paid or organic humans to `https://www.vaultquest.io` as the destination.
- **Freecash is never the landing** until S2S / postback exists. Freecash has no S2S today. Honesty about that hop lives in comments and docs only — never as the ad or post destination.
- Use our `/earn` page, not a raw CPX iframe URL, as the human destination.

---

## 3. UTMs

Every paid and organic destination that can take a query string uses all four:

| Param | Rule |
|---|---|
| `utm_source` | Channel: `facebook`, `youtube`, or the named source Manager gives. |
| `utm_medium` | `paid` for ads / boosts. `organic` for Page or YT posts that are not paid. |
| `utm_campaign` | Hyphenated **`brand-waitlist`** unless Manager names another campaign. |
| `utm_content` | Cell or post id, hyphenated (example: `overnight-a-cell1`, `overnight-a-yt1`). |

Example paid Meta cell:

`https://www.vaultquest.io/earn?utm_source=facebook&utm_medium=paid&utm_campaign=brand-waitlist&utm_content=overnight-a-cell1`

Example paid YouTube cell:

`https://www.vaultquest.io/earn?utm_source=youtube&utm_medium=paid&utm_campaign=brand-waitlist&utm_content=overnight-a-yt1`

Do not drop UTMs on “just a boost.” Do not invent a second campaign name to look busy.

---

## 4. Earn-live language

- No **“we’re live”** and no **“start earning”** until Manager says **earn-live**.
- Internal CPX S2S credit (tester PENDING EARN) is not a public live claim.
- No **$50** face, no promised VP→dollar rate, no giveaway framing.

---

## 5. Paid CTA and who pays

- Paid CTA is **Learn More** only. Never “Start earning.” Never “Join giveaway.”
- **Traffic cannot click billing.** Ethio pays on Traffic’s computer when he chooses.
- Do not click Pay on an unpaid balance. Do not treat a restricted ad account as a reason to route around billing.

---

## 6. Caps (planning vs launch)

| Cap | Rule |
|---|---|
| Default test | **$20**. A queued $20 test stays queued until Manager releases it. |
| Pack ceiling — Meta | **$150/day**. Planning split only until Manager says run. |
| Pack ceiling — YouTube | **$50/day**. Planning only until Manager says run. |
| $300 held | **Never auto-launch.** Held cash is not a go. |

Do not boost on a night Manager has marked **DO NOT BOOST**. Unpaid balance (example: $25.06) means no boost that night.

---

## 7. Kill rules (every cell)

Stop the cell and report to Manager if either is true:

1. **24 hours** and **zero** `/earn` landing clicks.
2. **CPC over $1.** This dies **every cell**. No “let it learn.”

A kill is not a pause-and-hope. Turn the cell off.

---

## 8. Creative bans

Do not ship:

- Generators
- No-survey lies
- Steam passwords (we never ask)
- Fake counters
- Contact-gated codes
- $50 face
- Official Valve / Steam gift-card art
- CS2 capsule as **ad** creative
- Fake social proof
- “Start earning”
- “Join giveaway”
- 2020 YouTube explainer as a current claim

Path clip `/workspace/fb-assets/vq-path-post.mp4` is **organic-only** unless Manager asks to pay it.

Allowed stills (examples, on-disk): `/workspace/fb-assets/og.png`, `/home/box/Desktop/vq-og.png`, `/workspace/fb-assets/vq-logo-512.png`, `/workspace/hero-vault-steam.jpg`.

---

## 9. Audiences

- **18+ gamers.** Interest / geo only.
- No fake lookalikes. No “we cloned buyers” claim we have not built.

---

## 10. YouTube disclosure (if a cut ever promotes offers)

We are **not** promoting offer walls in the default ad. If a future cut promotes offers:

- Verbal disclosure on in-stream, **and**
- First three lines of the written description on in-feed.

Land on `/earn` (CPX) with UTMs. Never Freecash. Never the homepage.

---

## 11. Honesty — CPX vs Freecash (comments / docs only)

- **CPX on `/earn` credits.** That is why `/earn` is the human landing.
- **Freecash has no S2S.** Clicks only until a postback exists. Do not promise Vault Points from Freecash. Do not land ads or organic posts on Freecash.
- Say this in comments and docs. Do not put it in the ad destination.

---

## 12. Report after every post

After every post (Page, boost, YT, or paid cell that goes live):

1. Post URL
2. Full landing URL including UTM (`source` / `medium` / `campaign` / `content`)

Send both to Manager. Same day. Do not batch only on Friday if a post already shipped.

---

## 13. Reference (do not treat as a go)

- Facebook Page: https://www.facebook.com/Vaultquest22/
- YouTube: https://www.youtube.com/@zakai1769
- Intro post (queued $20 boost, not a tonight-go): https://www.facebook.com/Vaultquest22/posts/pfbid02gLnFKT2z3aRJDJA8TqjiNGXGF7NvhSVXc38cDkno85F7ThKXVHZ424PEZzsDKVwrl
- Ad account `381799792692602` — restricted when this draft was written; unpaid balance is Ethio’s to pay.

Traffic drafts. Traffic does not post, does not open those URLs to publish, and does not spend.
