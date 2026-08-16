import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { QuestTeaser } from "@/components/QuestTeaser";
import { SocialProofBar } from "@/components/SocialProofBar";
import { listServableQuests } from "@/lib/affiliates";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | Earn Steam Credit with Honest Quests` },
  description: SITE.promise,
  alternates: { canonical: "/" },
};

const FAQS = [
  {
    q: "How do I earn on VaultQuest?",
    a: "Create an account, pick quests on /earn (surveys, games, apps), and finish them as written. Partners confirm completion; we credit Vault points.",
  },
  {
    q: "How long until I can redeem Steam credit?",
    a: "Credits start PENDING during a partner hold (typically 3–14 days by network), then become available. Minimum redeem is about $5. Steam send is manual after you unlock. We will publish a typical time once we have one.",
  },
  {
    q: "Do you use Steam code generators?",
    a: "No. VaultQuest is partner-funded quests → points → Steam. We never ask for your Steam password and we do not run generators.",
  },
  {
    q: "How do giveaways work?",
    a: "Scheduled giveaways publish their rules on /giveaway, and we post winners after each draw.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const STEPS = [
  { step: "01", title: "Earn VP", body: "Finish a listed quest." },
  { step: "02", title: "Hold clears", body: "3–14 days, then spendable." },
  { step: "03", title: "Steam", body: `Unlock from about $${SITE.minRedeemUsd}.` },
] as const;

export default async function HomePage() {
  const quests = (await listServableQuests()).slice(0, 6);

  return (
    <>
      <JsonLd data={FAQ_JSON_LD} />
      <section className="border-b border-[var(--vq-border)] bg-[var(--vq-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="font-[family-name:var(--vq-font-display)] text-3xl font-semibold tracking-tight text-[var(--vq-ink)] sm:text-4xl">
            {SITE.headline}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/earn"
              className="animate-vq-cta inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
            >
              See quests
            </Link>
            <Link
              href="/giveaway"
              className="inline-flex rounded-md border border-[var(--vq-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
            >
              Join giveaway
            </Link>
          </div>

          {quests.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--vq-ink-muted)]">No quests to show right now.</p>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quests.map((quest) => (
                <QuestTeaser key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SocialProofBar />

      <section className="border-t border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {STEPS.map((item) => (
            <div key={item.step}>
              <p className="font-[family-name:var(--vq-font-mono)] text-xs tracking-widest text-[var(--vq-teal)]">{item.step}</p>
              <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-xl font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
