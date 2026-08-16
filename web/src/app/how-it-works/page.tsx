import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "Create an account, pick a listed quest, finish it as written, then unlock from the vault.",
};

const STEPS = [
  {
    title: "Create your account",
    body: "Sign up with email or Google/Discord. Free, about a minute.",
  },
  {
    title: "Pick a listed quest",
    body: "Open the earn list and choose a survey, app, or game that fits your region and time.",
  },
  {
    title: "Finish as written",
    body: "Complete the offer exactly as the partner described. One account. No VPN on restricted offers.",
  },
  {
    title: "Pending VP",
    body: "Points land as pending until the partner hold clears, usually 3–14 days. Then they are yours to spend.",
  },
  {
    title: "Unlock from the vault",
    body: "Spend available VP on Steam credit, about $5 minimum, or enter the giveaway at /giveaway with published rules.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">How it works</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        The path is short on paper and slow in the middle. Account, listed quest, finish as written,
        pending VP, then unlock from the vault.
      </p>

      <ol className="mt-12 space-y-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-teal)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">{step.title}</h2>
              <p className="mt-1 text-[var(--vq-ink-muted)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-sm text-[var(--vq-ink-faint)]">
        Time to first redeem depends on the offer and your country. We do not quote a first-dollar clock.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
        >
          Sign up
        </Link>
        <Link
          href="/earn"
          className="inline-flex rounded-md border border-[var(--vq-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
        >
          See quests
        </Link>
      </div>
    </div>
  );
}
