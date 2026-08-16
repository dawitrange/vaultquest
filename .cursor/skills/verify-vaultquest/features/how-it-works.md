# How it works

How it works explains quests → Vault points → Steam or giveaways with real time ranges and no generator story.

## Sub-features

- `hiw-open` opens `/how-it-works` from nav **How it works**.
- `hiw-steps` lists account, quest, finish as written, pending points, redeem/giveaway.
- `hiw-honest` does not promise instant guaranteed dollars or “no survey”.

## How to get to it (user POV)

- Choose **How it works** in the primary nav.
- Follow in-page links from home or `/proof`.

## Driving it with verify-vaultquest

Preconditions:

- Doctor PASS.
- Read-only is enough (no account).

- **Nav entry.** GET `/how-it-works`. Expect HTTP 200 and heading **How it works**.
- **Steps present.** Body contains **Create your account**, **Start a quest**, **Earn Vault points**, and a hold range (`3–14` or equivalent).
- **Banned scan.** Body must not contain `generator` or `working codes`. Steam password must not be requested.
- **Proof.** Save HTML to `.cursor/skills/verify-vaultquest/artifacts/how-it-works/page.html` plus status code.

## Gotchas

- Copy may say surveys exist. That is allowed. “No survey” as a promise is not.
- Do not treat footer trust pills as this page; this recipe is `/how-it-works` only.
