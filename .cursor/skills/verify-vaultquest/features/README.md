# VaultQuest verification map

Maintained source for user-facing behavior of the VaultQuest web app (`web/`). Read this index, then the matching feature file.

## Baseline preconditions

- Launch at `http://127.0.0.1:3317` via `bash .cursor/skills/verify-vaultquest/scripts/launch.sh` unless the recipe says production-read-only.
- `DATABASE_URL` (Postgres) and `AUTH_SECRET` are set in the environment. Names: `web/.env.example`. Never commit values.
- Run `bash .cursor/skills/verify-vaultquest/scripts/doctor.sh` and require HTTP 200 + `VaultQuest`.
- Never drive a `next dev` you did not start, and never mutate **production** Neon (`production` / `br-lively-morning-aydx8h4v`).
- Do not kill processes by name; use `scripts/cleanup.sh`.

## Driving conventions

- Start from `/` unless a recipe says otherwise.
- Prefer visible link text and labeled form fields (Email, Password, Sign in).
- Treat commands in feature files as literal.
- SSR pages: `curl` of HTML is valid user-document proof. Clicks: Cursor browser against `$VERIFY_BASE_URL`.
- After mutations, restore or use a disposable Neon branch. Keep `artifacts/`.

## Proof and skip reporting

- Capture the action (URL, click name) and the resulting page/API state.
- Mutation proof needs a second read (account page, ledger, or `OfferClick`).
- Record the feature file name with every artifact under `.cursor/skills/verify-vaultquest/artifacts/<id>/`.
- If a quest shows `Not available yet`, report that path **skipped** with evidence — do not claim Start quest verified via a different quest.

## Features

- [Home to Earn](./home-earn.md) — hero CTA and earn catalog.
- [Go auth gate](./go-auth-gate.md) — signed-out `/api/go/*` (including q-freecash) → login, no OfferClick.
- [How it works](./how-it-works.md) — honest steps, no generator path.
- [Sign up and sign in](./signup-login.md) — email account, never Steam password.
- [Proof and claims](./proof-claims.md) — `/proof` rules and banned-claim scan.
- [Postback credit](./postback-credit.md) — partner S2S pending VP (existing smoke script).
