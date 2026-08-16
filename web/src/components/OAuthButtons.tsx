import { signIn } from "@/auth";
import { rememberFirstTouchUtm } from "@/lib/actions/auth";
import type { UtmTouch } from "@/lib/utm";

export function OAuthButtons({
  google,
  discord,
  redirectTo = "/account",
  utm,
}: {
  google: boolean;
  discord: boolean;
  redirectTo?: string;
  utm?: UtmTouch;
}) {
  // SSO: wire AUTH_GOOGLE_ID/SECRET + AUTH_DISCORD_ID/SECRET in web/.env + Vercel env to enable Google/Discord.
  // No divider when both are off. Email forms on /signup and /login stand alone.
  if (!google && !discord) {
    return null;
  }

  return (
    <div className="mt-6 space-y-2">
      {google ? (
        <form
          action={async () => {
            "use server";
            if (utm) await rememberFirstTouchUtm(utm);
            await signIn("google", { redirectTo });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--vq-border)] px-4 py-2.5 text-sm font-medium text-[var(--vq-ink)] hover:border-[var(--vq-teal)]"
          >
            Continue with Google
          </button>
        </form>
      ) : null}
      {discord ? (
        <form
          action={async () => {
            "use server";
            if (utm) await rememberFirstTouchUtm(utm);
            await signIn("discord", { redirectTo });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--vq-border)] px-4 py-2.5 text-sm font-medium text-[var(--vq-ink)] hover:border-[var(--vq-teal)]"
          >
            Continue with Discord
          </button>
        </form>
      ) : null}
      <div className="relative py-2 text-center text-xs text-[var(--vq-ink-faint)]">or email</div>
    </div>
  );
}
