/** Safe post-auth landing. Only allow known first-party paths — no open redirects. */
const FROM_PATHS = {
  earn: "/earn",
  rewards: "/rewards",
  account: "/account",
  giveaway: "/giveaway",
  play: "/play/vault-bluff",
} as const;

export type AuthHint = keyof typeof FROM_PATHS;

export function authHintFromValue(
  from: string | null | undefined,
): AuthHint | undefined {
  if (!from || !(from in FROM_PATHS)) return undefined;
  return from as AuthHint;
}

export function pathFromAuthHint(from: string | null | undefined): string {
  if (!from) return "/account";
  return FROM_PATHS[from] ?? "/account";
}

export function authHintFromFormData(formData: FormData): string | null {
  const from = String(formData.get("from") ?? "").trim();
  return authHintFromValue(from) ?? null;
}
