import { createHash, randomBytes } from "node:crypto";
import { SITE } from "@/lib/site";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

/** Origin for reset emails. Uses AUTH_URL (already in .env.example), then NEXTAUTH_URL, then the public site. */
export function authOrigin() {
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL || SITE.url;
  return raw.replace(/\/$/, "");
}

export function resetLinkForToken(token: string) {
  return `${authOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
}
