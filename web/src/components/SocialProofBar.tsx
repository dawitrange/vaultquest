import Link from "next/link";

export function SocialProofBar() {
  return (
    <div className="border-y border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-[var(--vq-ink-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-[var(--vq-teal)] shadow-[0_0_8px_var(--vq-teal-glow)]" />
            Since Dec 26, 2020
          </span>
          <a
            href="https://www.youtube.com/@zakai1769"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg)] px-2.5 py-1 hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
          >
            YouTube @zakai1769
          </a>
          <a
            href="https://www.facebook.com/Freesteamcodes21"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg)] px-2.5 py-1 hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
          >
            Facebook Page
          </a>
          <span className="hidden text-[var(--vq-ink-faint)] sm:inline">→ rebranded to VaultQuest 2026</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[var(--vq-ink-faint)]">
          <Link href="/about" className="rounded-full border border-[var(--vq-border)] px-2.5 py-1 hover:text-[var(--vq-ink)]">
            Our story
          </Link>
          <Link href="/proof" className="rounded-full border border-[var(--vq-border)] px-2.5 py-1 hover:text-[var(--vq-ink)]">
            Proof & Rules
          </Link>
          <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1 font-[family-name:var(--vq-font-mono)] text-[10px] tracking-widest">
            NO GENERATORS · S2S VERIFIED · ROTATION
          </span>
        </div>
      </div>
    </div>
  );
}
