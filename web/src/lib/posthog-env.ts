/** Official US Cloud ingest host — https://posthog.com/docs/libraries/next-js */
export const POSTHOG_US_HOST = "https://us.i.posthog.com";

const BLOCKED_PROP_KEYS = new Set([
  "email",
  "e-mail",
  "name",
  "$email",
  "$name",
  "user_email",
  "user_name",
]);

export function posthogPublicKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  return key || undefined;
}

export function posthogHost(): string {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  return host || POSTHOG_US_HOST;
}

/** Drop email/name keys. Never send those as event properties or identify traits. */
export function sanitizePosthogProperties(
  properties?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!properties) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_PROP_KEYS.has(key.toLowerCase())) continue;
    out[key] = value;
  }
  return out;
}

export const PH_EVENTS = {
  giveaway_submit: "giveaway_submit",
  signup: "signup",
  earn_click: "earn_click",
  go_hop: "go_hop",
  game_hub_viewed: "game_hub_viewed",
  vault_bluff_started: "vault_bluff_started",
  vault_bluff_round_completed: "vault_bluff_round_completed",
  vault_bluff_completed: "vault_bluff_completed",
  vault_bluff_rematch_started: "vault_bluff_rematch_started",
  vault_bluff_persona_selected: "vault_bluff_persona_selected",
  vault_bluff_daily_vp_granted: "vault_bluff_daily_vp_granted",
  vault_bluff_reward_blocked: "vault_bluff_reward_blocked",
  vault_bluff_earn_clicked: "vault_bluff_earn_clicked",
  vault_bluff_verified_postback: "vault_bluff_verified_postback",
} as const;
