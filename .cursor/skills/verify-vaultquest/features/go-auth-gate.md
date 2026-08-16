# Go auth gate

A signed-out visitor who hits a tracked quest hop lands on sign-in. VaultQuest does not create an OfferClick and does not send them to a partner.

## Sub-features

- `go-freecash-signed-out` GET `/api/go/q-freecash` without a session → `/login?from=earn`.
- `go-gamehag-signed-out` GET `/api/go/q-gamehag` matches the same login redirect. No `gamehag.com`.
- `go-surveys-signed-out` GET `/api/go/q-surveys` matches the same login redirect.
- `go-all-quests-signed-out` q-offerwall and q-play do the same. Every QUESTS hop is gated, not two ids.
- `go-signed-out-no-click` Location has no `click_id` / `subid` and is not Freecash or Gamehag.

## How to get to it (user POV)

- Open `/earn` signed out and choose **Start quest** on Featured partner signup, or GET `/api/go/q-freecash` directly.
- Surveys already bounced to login. Freecash must match.

## Driving it with verify-vaultquest

Preconditions:

- Doctor PASS at `http://127.0.0.1:3317` (or a **preview** `VERIFY_BASE_URL`).
- Never point this recipe at `www.vaultquest.io`. Unsigned GET `/api/go/q-freecash` on live still 307s to Freecash and writes OfferClick `userId=null` until the auth-gate is deployed. OfferClick `cmsv8toze0003lc04z6tmnl6y` is eng-qa logged-out smoke, not user traffic.

- **Signed-out Freecash hop.** `curl` GET `/api/go/q-freecash` without `-L`. HTTP 307 or 302. `Location` is `/login?from=earn` (relative or absolute). No `click_id`. Host is not `freecash.com`.
- **Signed-out Gamehag hop.** Same for `/api/go/q-gamehag`. Host is not `gamehag.com`.
- **Signed-out surveys hop.** Same for `/api/go/q-surveys`.
- **Other QUESTS.** Same for `/api/go/q-offerwall` and `/api/go/q-play`.
- **Proof.** Artifacts in `.cursor/skills/verify-vaultquest/artifacts/go-auth-gate/`: headers per quest and `result.txt` saying `PASS go-auth-gate`.
- **Signed-in hop (optional, localhost with a session cookie).** GET `/api/go/q-freecash` or `/api/go/q-offerwall` then still creates an OfferClick whose `userId` is that session. Do not fire a production postback.

## Gotchas

- `curl` without `-L` still *sends* the GET. Against production that GET is the leak. Refuse `vaultquest.io` in the drive script.
- Unknown quest ids still 307 to `/earn` (not login). That is existing behavior.
- Do not invent partner URLs. Do not follow the login redirect into a signup mutation on production.
