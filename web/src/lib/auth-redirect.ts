/** Safe post-auth landing. Only allow known first-party paths — no open redirects. */
const FROM_PATHS: Record<string, string> = {
  earn: "/earn",
  rewards: "/rewards",
  account: "/account",
  giveaway: "/giveaway",
};

export function pathFromAuthHint(from: string | null | undefined): string {
  if (!from) return "/account";
  return FROM_PATHS[from] ?? "/account";
}

export function authHintFromFormData(formData: FormData): string | null {
  const from = String(formData.get("from") ?? "").trim();
  return from && from in FROM_PATHS ? from : null;
}
