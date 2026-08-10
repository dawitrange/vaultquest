import { signIn } from "@/auth";

export function OAuthButtons({ google, discord }: { google: boolean; discord: boolean }) {
  if (!google && !discord) {
    return (
      <p className="mt-6 text-center text-xs text-[var(--vq-ink-faint)]">
        Google/Discord sign-in appears after you add OAuth client IDs to <code>.env</code>.
      </p>
    );
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
