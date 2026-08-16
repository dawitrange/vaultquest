# Weekly Meta / YouTube test protocol — VaultQuest

**Status:** Paper launch pack. Owner clicks billing. Agent prepares cells, copy, UTMs, and kill calls — never pays.

**Hybrid lock (do not break):** Gamesbolt / Earnit-style product UX + Freecash-style growth landing on **vaultquest.io first**. Ads send people to our site. Partners sit behind `/earn`. Never send paid traffic only to a raw CPA / Freecash homepage.

**Related:** `docs/00-master-brief.md` (margin + claims), `docs/01-brand.md` (voice), `docs/08-budget.md` (owner approves spend), `docs/07-orchestration-roadmap.md` (Paid last), `docs/18-launch-orchestration.md` (W3 gate), `docs/20-overnight-manager.md` (credentials + morning debrief).

---

## 0. Five-minute morning launch pack

Use this file as the 5-minute start. Do not invent live metrics.

1. Confirm **Manager** has said paid traffic is allowed. Until then, prepare only — do not imply “we’re live, start earning.”
2. Confirm Meta billing is current (agent **cannot** click Meta billing). If unpaid, queue the boost and stop.
3. Pick **2–4 cells** (angle × creative). One landing each. Same UTM campaign, different `utm_content`.
4. Paste the UTM URLs below into the ad destination. Caps on. Kill rules on.
5. Midday: check spend vs signups. Kill a dead cell. Do not “give it another day” past the kill line.
6. End of week: scale the winner only. Pause the rest.

---

## 1. Landing + UTMs

**Allowed landings (www only):**

| Page | When to use |
|------|-------------|
| `https://www.vaultquest.io` | Default brand / promise / dual CTA |
| `https://www.vaultquest.io/how-it-works` | Skeptic / “is this legit” angles |
| `https://www.vaultquest.io/earn` | Intent already “I will do tasks” |

Apex `vaultquest.io` **308s**. Postbacks and ad destinations must use **www**. Do not land paid traffic on partner homepages.

**Required UTM keys** (all four, every cell):

| Key | Meaning | Example |
|-----|---------|---------|
| `utm_source` | Platform | `meta` or `youtube` |
| `utm_medium` | Buy type | `paid` |
| `utm_campaign` | Week + test name | `vq_wYYYYMMDD_honest` |
| `utm_content` | Cell id | `a1_quest_static` |

**Ready URLs (swap the campaign date; keep content ids stable):**

```
https://www.vaultquest.io/?utm_source=meta&utm_medium=paid&utm_campaign=vq_w20260816_honest&utm_content=a1_quest_static
https://www.vaultquest.io/how-it-works?utm_source=meta&utm_medium=paid&utm_campaign=vq_w20260816_honest&utm_content=a2_honest_path
https://www.vaultquest.io/earn?utm_source=meta&utm_medium=paid&utm_campaign=vq_w20260816_honest&utm_content=a3_earn_catalog
https://www.vaultquest.io/?utm_source=youtube&utm_medium=paid&utm_campaign=vq_w20260816_honest&utm_content=y1_walkthrough
```

Do not add extra tracking params that leak secrets. Do not put `POSTBACK_SECRET` or pixel IDs in the URL.

---

## 2. Honest claims only

Public promise (canonical):

> Earn gaming rewards honestly. Complete quests, build Vault points, redeem Steam credit & keys — or enter fair giveaways. No generators. No password asks.

**Allowed:** complete partner tasks; typical time ranges; we earn a commission when you finish offers; redeem from the catalog when you have available VP; fair giveaways with published rules.

**Banned (ads, thumbs, primary text, landing, comments):**

- Generators / “working codes” / hacks
- “No survey” (or “no download”) lies
- Steam password or account-login asks
- Guaranteed dollar amounts / “$50 today” / “instant free $50”
- Valve / Steam affiliation or “official Steam”
- “We’re live, start earning” until **Manager** says so
- Fake counters, fake live cashout tickers, invented member counts
- Sending traffic only to Freecash / raw CPA

If a cell needs a banned line to convert, kill the cell. Do not “soften” the lie.

---

## 3. Default caps + kill rules

| Channel | Default daily cap | Who can raise |
|---------|-------------------|---------------|
| Meta (Boost / Ads Manager) | **$150 / day** | Owner only |
| YouTube ads | **$50 / day** | Owner only |

Combined paid tests sit in the `docs/08-budget.md` marketing-tests slice. Owner approves before any cell goes live. Propose with **cost / lift / kill**.

**Kill a cell when any one is true:**

1. About **$40 spent** and **zero signups** attributed to that cell’s UTMs.
2. **3 days** of CAC above expected first-earn yield for that action (margin rule: never buy a user for more than we expect to earn on their first verified completion).
3. **Policy reject** (Meta / YouTube / partner). Do not appeal with a banned rewrite. Pause and rewrite honest.

Also pause the **channel** if billing is unpaid, if `/earn` has no healthy crediting path, or if Manager has not cleared “live.”

Do not invent first-earn yield. Use the live partner payout we actually received (or $0 if none). Car Fund / cash is recorded in the morning debrief — not guessed here.

---

## 4. Cells (2–4) — angle × creative

Run **2–4 cells** in a week. Same offer (VaultQuest earn path). Different angle and/or creative. One winner scales; losers die.

| Cell | Angle | Creative shell | Landing |
|------|-------|----------------|---------|
| A1 | Quest framing (Gamesbolt-class UX) | Static: vault + “Complete quests. Unlock Steam credit.” | Home |
| A2 | Honest path vs generators | Static or 15s: “No generators. Real tasks. Your points.” | `/how-it-works` |
| A3 | Catalog intent | Static: “Surveys and offers → Vault points → redeem.” | `/earn` |
| Y1 | YouTube walkthrough (optional 4th) | 15–30s cut of honest how-it-works; CTA to site | Home or `/how-it-works` |

Drop A3 or Y1 if budget is tight. Never run more than 4 in the first week.

**Scale rule:** After a cell beats kill lines for 3 days, raise *that* cell’s cap first (still inside the channel daily cap). Do not clone losers with a new color.

---

## 5. Audiences (morning paste)

**Meta (18+; partner age gates — do not target 13–17):**

| Name | Seed | Notes |
|------|------|-------|
| `vq_meta_steam_int` | Interests: Steam, PC gaming, Steam Deck (and close variants Ads Manager offers) | Default cold |
| `vq_meta_yt_warm` | People who engage with the YouTube / Page properties we actually own | Only if the source is real |
| `vq_meta_site_visitors` | Pixel visitors of www.vaultquest.io (7–30d) | **Only after** Pixel is installed and Manager confirms. Do not invent a pixel ID. |
| Lookalikes | From **converters** (signup or first postback), not from Page likes | Build after ≥100 real events. Not day 1. |

Exclude existing converters once the list exists. Exclude obvious non-gamer junk if frequency is high and CTR is empty.

**YouTube ads:**

| Name | Seed | Notes |
|------|------|-------|
| `vq_yt_inmarket_games` | In-market / affinity: video games, PC gaming | Default |
| `vq_yt_channel_warm` | Viewers of `@zakai1769` (and VaultQuest-named channel after rebrand) | Prefer this if Ads access exists |
| Keywords (tight) | `earn steam wallet`, `free steam legit`, `gaming rewards surveys` | No “working codes” / generator keywords |

Do not buy competitor brand terms we have not confirmed. Do not invent competitor Facebook URLs (see `docs/ops/competitor-facebook-playbook.md`).

---

## 6. Copy shells (honest)

Swap only the bracketed bits. Do not add a dollar guarantee.

**Primary text (Meta) — A1 Quest**

> Earn gaming rewards honestly. Complete quests, build Vault points, redeem Steam credit from the catalog — or enter fair giveaways. No generators. No password asks.

**Primary text — A2 Honest path**

> Generators are fake. The real path is slower and real: sign up on VaultQuest, finish partner tasks, get Vault points after verification. We earn a commission when you complete offers.

**Primary text — A3 Earn**

> Surveys and offers take time. We say so. Typical tasks vary; check each quest. Points start pending, then become available. No “instant $50.”

**Headline options (pick one per cell):**

- Complete quests. Unlock your vault.
- Honest Steam credit path
- Tasks → points → redeem
- No generators. Real quests.

**YouTube hook (0–8s):** Show the live site (home or how-it-works), say “this is the honest path,” CTA to the UTM link. Do not show a fake Steam wallet bump.

**Description / disclaimer line (every cell):**

> Partner offers. 18+. Not affiliated with Valve or Steam. Sponsored / affiliate.

---

## 7. Agent vs Owner (billing)

| Action | Agent | Owner / Manager |
|--------|-------|-----------------|
| Draft cells, copy, UTMs, audiences | Yes | Review |
| Click **Meta billing**, add a card, pay a $25 unpaid balance, raise a spend limit | **No** | Yes |
| Click YouTube / Google Ads billing | **No** | Yes |
| Queue a $20 Page boost | May draft; may not pay | Pays or kills |
| Pause a cell that hit a kill line | Yes (recommend + do if Ads access is already granted for pause-only) | Confirm |
| Say “we’re live, start earning” | **No** | Manager only |

If billing is blocked (example: boost queued, unpaid balance, funds held), **stop**. Record it in the morning debrief. Do not work around with a personal card or a new account.

---

## 8. Weekly loop

| Day | Do |
|-----|----|
| Sun / Mon AM | 5-minute pack: 2–4 cells live under caps |
| Daily | Spend, signups, first-earn, policy status. Kill on the lines in §3 |
| Fri | Name the winner. Pause the rest. Propose next-week scale with cost / lift / kill |
| Any day | Policy reject → pause that cell immediately |

Log the week in `docs/ops/overnight-debrief-YYYY-MM-DD.md` (traffic + PR table stay TBD if Manager has not filled them).

---

## 9. Do not

- Do not change site code from this protocol.
- Do not commit secrets, pixel IDs, or access tokens.
- Do not invent revenue, CAC, or member counts.
- Do not run paid until landing + claims + at least one crediting earn path + owner OK (`docs/07-orchestration-roadmap.md`, `docs/18-launch-orchestration.md` W3).
- Do not break the hybrid lock.
