# Sign up and sign in

A user creates an email account (age gate), lands on `/account`, and can sign in again. VaultQuest never asks for a Steam password.

## Sub-features

- `signup-open` opens `/signup` from header **Sign up** or the earn “Sign up first” link.
- `signup-age` requires the 16+/18+ checkbox.
- `signup-create` persists a user and signs them in to `/account`.
- `login-open` opens `/login` with **Email** and **Password**.
- `login-reject` shows an error for a bad password without crashing.

## How to get to it (user POV)

- Header **Sign up** (signed out).
- Header **Sign in**.
- `/earn` copy **Sign up** when signed out.
- Login form link **Sign up**; signup form link **Sign in**.

## Driving it with verify-vaultquest

Preconditions:

- Doctor PASS on a **non-production** database.
- Unique email, e.g. `vq-verify-$RUN_ID@example.com`, password ≥ 8 characters.
- `AUTH_SECRET` set. OAuth buttons may be absent (env not required).

- **Open signup.** GET `/signup`. Heading **Create account**. Fields **Name**, **Email**, **Password**. Submit **Create account**. No Steam password field.
- **Submit.** Fill email/password, check the age box, choose **Create account**. Result: redirect or `/account` showing the email.
- **Sign out / sign in.** GET `/login`. Heading **Sign in**. Fill **Email** / **Password**, choose **Sign in**. Result: `/account`.
- **Bad password.** Submit a wrong password. Visible error **Invalid email or password** (or equivalent). Still on `/login`.
- **Proof.** Artifact folder `artifacts/signup-login/` with HTML or screenshots of `/signup` (no steam password inputs) and `/account` after success. Confirm a `User` row for the verify email on the verify DB only.

## Gotchas

- Never run this recipe against `www.vaultquest.io` or the Neon `production` branch.
- Duplicate email returns **An account with that email already exists** — use a fresh address.
- OAuth Google/Discord only appear when `AUTH_GOOGLE_*` / `AUTH_DISCORD_*` are set; their absence is not a failure.
- `signIn` may throw a NEXT redirect; the user-visible success is landing on `/account`, not a JSON `{ok:true}`.
