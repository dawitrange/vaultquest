import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { QuestTeaser } from "@/components/QuestTeaser";
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

export default async function HomePage() {
  const quests = (await listServableQuests()).slice(0, 6);

  return (
    <>
      <JsonLd data={FAQ_JSON_LD} />
      <section className="relative min-h-[min(72vh,720px)] overflow-hidden">
        <div className="vq-hero-media" aria-hidden>
          <Image
            src="/hero-vault-steam.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="vq-grid-fade pointer-events-none absolute inset-0 z-[1] opacity-25" aria-hidden />

        <div className="relative z-[2] mx-auto flex min-h-[min(72vh,720px)] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
          <div className="animate-vq-unlock max-w-xl">
            <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--vq-teal)]">
              {SITE.tagline}
            </p>
            <p className="mt-2 font-[family-name:var(--vq-font-display)] text-[clamp(3rem,9vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-[var(--vq-ink)]">
              {SITE.name}
            </p>
            <h1 className="mt-5 font-[family-name:var(--vq-font-display)] text-2xl font-semibold text-[var(--vq-ink)] sm:text-3xl">
              {SITE.headline}
            </h1>
            <p className="mt-4 max-w-lg text-base text-[var(--vq-ink-muted)] sm:text-lg">{SITE.promise}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/earn"
                className="animate-vq-cta inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
              >
                See quests
              </Link>
              <Link
                href="/giveaway"
                className="inline-flex rounded-md border border-[var(--vq-border-strong)] bg-[var(--vq-bg-deep)]/50 px-5 py-3 text-sm font-semibold text-[var(--vq-ink)] backdrop-blur-sm hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
              >
                Join giveaway
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--vq-border)] bg-[var(--vq-bg)]" aria-labelledby="home-catalog">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="home-catalog" className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
                Quest catalog
              </h2>
              <p className="mt-2 max-w-xl text-[var(--vq-ink-muted)]">
                Real tiles from /earn. Next click stays on vaultquest.io. We omit a quest when it cannot be served.
              </p>
            </div>
            <Link href="/earn" className="text-sm font-medium text-[var(--vq-teal)] hover:underline">
              See quests →
            </Link>
          </div>
          {quests.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--vq-ink-muted)]">
              No quests are servable right now. We will not invent a store to fill this row.
            </p>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quests.map((quest) => (
                <QuestTeaser key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/40" aria-labelledby="home-faq">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 id="home-faq" className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Common questions
          </h2>
          <p className="mt-2 text-[var(--vq-ink-muted)]">Straight answers — more detail on Proof & Rules.</p>
          <dl className="mt-8 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-[var(--vq-ink-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
          <Link href="/proof" className="mt-8 inline-flex text-sm font-medium text-[var(--vq-teal)] hover:underline">
            Read Proof & Rules →
          </Link>
        </div>
      </section>
    </>
  );
}
