import { signIn } from "@/auth";

export function OAuthButtons({ google, discord }: { google: boolean; discord: boolean }) {
  // SSO: wire AUTH_GOOGLE_ID/SECRET + AUTH_DISCORD_ID/SECRET in web/.env + Vercel env to enable Google/Discord — no user-visible hint.
  if (!google && !discord) {
    return <div className="relative py-2 text-center text-xs text-[var(--vq-ink-faint)]">or continue with email</div>;
  }

  return (
    <div className="mt-6 space-y-2">
      {google ? (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/account" });
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
            await signIn("discord", { redirectTo: "/account" });
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
