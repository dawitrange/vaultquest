import Link from "next/link";

export function EarnAuthPrompt({ actions = true }: { actions?: boolean }) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] px-4 py-4">
      <p className="font-[family-name:var(--vq-font-display)] text-base font-semibold">
        Sign in so this quest can credit you
      </p>
      <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">
        Partners credit the account you use. Holds are 3–14 days. We never ask for your Steam password.
      </p>
      {actions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/login?from=earn"
            className="rounded-md bg-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup?from=earn"
            className="rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
          >
            Sign up
          </Link>
        </div>
      ) : null}
    </div>
  );
}
