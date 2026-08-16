/** Safe post-auth landing. Only allow known first-party paths — no open redirects. */
const FROM_PATHS: Record<string, string> = {
  earn: "/earn",
  rewards: "/rewards",
  account: "/account",
  signup: "/earn?from=signup",
};

/** Login (and other return-to) default stays /account. */
export function pathFromAuthHint(from: string | null | undefined): string {
  if (!from) return "/account";
  return FROM_PATHS[from] ?? "/account";
}

/** Signup always lands on earn, ready to click a live quest. */
export function pathAfterSignup(): string {
  return "/earn?from=signup";
}

export function authHintFromFormData(formData: FormData): string | null {
  const from = String(formData.get("from") ?? "").trim();
  return from && from in FROM_PATHS ? from : null;
}
