import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "Transparent path from quests to Vault points to Steam rewards.",
};

const STEPS = [
  {
    title: "Create your account",
    body: "Sign up with email or Google/Discord — free, takes about a minute.",
  },
  {
    title: "Start a quest",
    body: "Choose offers that fit your time and region — surveys, apps, and games.",
  },
  {
    title: "Finish the way it’s written",
    body: "Complete each offer exactly as described so the partner confirms it (one account, no VPN on restricted offers).",
  },
  {
    title: "Earn Vault points",
    body: "Points post as pending until the partner’s hold clears (3–14 days), then they’re yours to spend.",
  },
  {
    title: "Redeem or enter giveaways",
    body: "Cash out to Steam credit from about $5, or enter the giveaway at /giveaway with published rules.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">How it works</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Real quests, real Steam credit. Here&apos;s the whole path, start to finish.
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
        Time to first redeem varies by country and offer.
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
