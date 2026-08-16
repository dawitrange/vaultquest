import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--vq-border)] bg-[var(--vq-bg-deep)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-[family-name:var(--vq-font-display)] text-lg font-bold">{SITE.name}</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--vq-ink-muted)]">
            {SITE.tagline}. Partner-funded rewards — not generators.{" "}
            <Link href="/about" className="text-[var(--vq-teal)] hover:underline">
              Since 2020
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a
              href="https://www.youtube.com/@zakai1769"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
            >
              YouTube @zakai1769 ↗
            </a>
            <a
              href="https://www.facebook.com/Freesteamcodes21"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
            >
              Facebook since 2020 ↗
            </a>
            <Link
              href="/about"
              className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-2.5 py-1 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
            >
              About & timeline
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--vq-ink-faint)]">
            Rebranded from ZaKai (2020) → VaultQuest 2026. Same operator, transparent ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--vq-ink-muted)] lg:justify-end lg:text-right">
          <div className="flex w-full flex-wrap gap-x-6 gap-y-2 lg:justify-end">
            <Link href="/earn" className="hover:text-[var(--vq-teal)]">
              Earn
            </Link>
            <Link href="/rewards" className="hover:text-[var(--vq-teal)]">
              Rewards
            </Link>
            <Link href="/giveaway" className="hover:text-[var(--vq-teal)]">
              Giveaway
            </Link>
            <Link href="/proof" className="hover:text-[var(--vq-teal)]">
              Proof & Rules
            </Link>
            <Link href="/contact" className="hover:text-[var(--vq-teal)]">
              Contact
            </Link>
            <Link href="/about" className="hover:text-[var(--vq-teal)]">
              About
            </Link>
            <Link href="/how-it-works" className="hover:text-[var(--vq-teal)]">
              How it works
            </Link>
            <a href="mailto:support@vaultquest.io" className="hover:text-[var(--vq-teal)]">
              support@vaultquest.io
            </a>
            <Link href="/terms" className="hover:text-[var(--vq-teal)]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--vq-teal)]">
              Privacy
            </Link>
          </div>
          <p className="w-full text-xs text-[var(--vq-ink-faint)] lg:text-right">Not affiliated with Valve / Steam.</p>
        </div>
      </div>
      <div className="border-t border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/35 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 text-[11px] sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1 font-[family-name:var(--vq-font-mono)] tracking-widest text-[var(--vq-ink-faint)]">
              PARTNER-FUNDED REWARDS
            </span>
            <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1 font-[family-name:var(--vq-font-mono)] tracking-widest text-[var(--vq-ink-faint)]">
              STEAM CREDIT FROM $5
            </span>
            <span className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1 font-[family-name:var(--vq-font-mono)] tracking-widest text-[var(--vq-ink-faint)]">
              SAME TEAM SINCE 2020
            </span>
          </div>
          <Link href="/how-it-works" className="text-xs text-[var(--vq-ink-muted)] hover:text-[var(--vq-teal)] hover:underline">
            How it works →
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--vq-border)] px-4 py-4 text-center text-xs text-[var(--vq-ink-faint)] sm:px-6">
        Some links are affiliate/partner links. We may earn when you complete offers. Rewards require real tasks; time
        varies by region. <span className="text-[var(--vq-ink-muted)]">VaultQuest — YouTube since 2020 · Facebook since Dec 2020</span>
        <span className="mt-1 block">© {new Date().getFullYear()} VaultQuest. Not affiliated with Valve / Steam.</span>
      </div>
    </footer>
  );
}
