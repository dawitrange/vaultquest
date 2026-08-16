# Proof and claims

Proof & Rules is the public honesty page: how earnings work, what is banned, giveaways, disclosure. Verification here is claims, not fake social proof.

## Sub-features

- `proof-open` opens `/proof` from nav **Proof & Rules**.
- `proof-toc` exposes sections including earnings, never, giveaways, disclosure, support.
- `proof-banned-absent` has no generator product, no Steam password ask, no fake winner ticker.
- `terms-privacy` `/terms` and `/privacy` return 200.

## How to get to it (user POV)

- Primary nav **Proof & Rules**.
- Footer / in-page links to `/proof#disclosure`, `/proof#earnings`.
- Direct `/proof`, `/terms`, `/privacy`.

## Driving it with verify-vaultquest

Preconditions:

- Doctor PASS. Read-only.

- **Open proof.** GET `/proof`. HTTP 200. Heading **Proof & Rules**.
- **TOC.** Page contains **How earnings work** and **Partner & affiliate disclosure** (or the TOC labels from `web/src/app/proof/page.tsx`).
- **Banned scan.** No `working codes`, no steam password form. Generator mentioned only as something we do **not** do (negative mention is allowed; a product CTA for generators is not).
- **Next step.** After the rules, a real CTA: **Sign up** (`/signup`) or **See quests** (`/earn`). No invented winners, pending-VP counts, or “we’re live” badge.
- **Legal.** GET `/terms` and `/privacy` → 200.
- **Proof.** Save `artifacts/proof-claims/proof.html` and a short `result.txt`.

## Gotchas

- “No generators” as a statement of policy is allowed. Do not fail the page for that phrase.
- Empty winners list is honest. Do not require a populated feed.
- Do not use this feature as a substitute for earn-live (postback).
