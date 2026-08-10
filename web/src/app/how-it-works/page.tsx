import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "Honest path from quests to Vault points to Steam rewards.",
};

const STEPS = [
  {
    title: "Create your account",
    body: "Sign up with email or OAuth. We never ask for your Steam password.",
  },
  {
    title: "Start a quest",
    body: "Choose offers that fit your time and region. Surveys and game offers may both appear — we won’t pretend otherwise.",
  },
  {
    title: "Finish the way it’s written",
    body: "No VPN tricks, no multi-accounts. Partners ban that — and clawbacks hurt everyone.",
  },
  {
    title: "Earn Vault points",
    body: "Credits land as pending until the partner hold clears, then become available to spend.",
  },
  {
    title: "Redeem or enter giveaways",
    body: "Unlock Steam credit from the vault (~$5 min) or enter fair, scheduled giveaways with published rules.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">How it works</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Generators are fake. This is slower and real: partner-funded quests → points → Steam.
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
        Time to first redeem varies by country and offer. Anyone promising instant free $50 is lying.
      </p>

      <Link
        href="/earn"
        className="mt-8 inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)]"
      >
        Browse quests
      </Link>
    </div>
  );
}
