# Home to Earn

A visitor lands on VaultQuest, understands the promise, and reaches the earn catalog via **Start earning** without seeing generator or password-ask copy.

## Sub-features

- `home-render` shows the VaultQuest name, headline, and dual intent (earn / giveaway).
- `home-cta-earn` sends **Start earning** to `/earn`.
- `earn-catalog` shows heading **Earn** and either quest rows or the honest empty state.
- `earn-no-banned` has no working-codes CTA or “no survey” lie (policy “we do not run generators” is allowed).

## How to get to it (user POV)

- Open `/`.
- Choose **Start earning** in the home hero.
- Choose **Earn** in the primary nav (`aria-label="Primary"`).
- Choose header **Start earning** when already signed in (goes to `/earn`).

## Driving it with verify-vaultquest

Preconditions:

- Doctor PASS at `http://127.0.0.1:3317` (or `VERIFY_BASE_URL`).
- This run started the instance (or `--public` production for read-only).

- **Open home.** GET `/`. Run `bash .cursor/skills/verify-vaultquest/scripts/drive-home-earn.sh`. Home HTTP 200. Body contains `VaultQuest` and `Turn quests into Steam credit`.
- **Hero CTA.** The same HTML contains visible **Start earning** and `href="/earn"`.
- **Arrive on Earn.** GET `/earn` is HTTP 200. Heading **Earn** is present. Either **Start quest** links (`/api/go/q-offerwall` etc.) or copy **No quests available right now**.
- **Browser click (when a browser is available).** Open `$VERIFY_BASE_URL/`, choose the **Start earning** link. The URL becomes `/earn` and the **Earn** heading is visible.
- **Proof.** Artifacts in `.cursor/skills/verify-vaultquest/artifacts/home-earn/`: `home.html`, `earn.html`, `result.txt` saying `PASS home-earn`.

## Gotchas

- Header **Start earning** vs **Sign up** depends on session. Signed-out header CTA is **Sign up** (`/signup`); the home hero **Start earning** still goes to `/earn`.
- An empty catalog is a valid honest state. Do not fail the feature for missing **Start quest** unless the recipe required a live rotator.
- `vaultquest.io` is allowed for this read-only feature; do not sign up there during the run.
