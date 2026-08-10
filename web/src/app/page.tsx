import Image from "next/image";
import Link from "next/link";
import { HeroRedeemDemo } from "@/components/HeroRedeemDemo";
import { SocialProofBar } from "@/components/SocialProofBar";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[min(88vh,860px)] overflow-hidden">
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

        <div className="relative z-[2] mx-auto flex min-h-[min(88vh,860px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
          <div className="animate-vq-unlock max-w-xl">
            <p className="font-[family-name:var(--vq-font-display)] text-[clamp(3rem,9vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-[var(--vq-ink)]">
              {SITE.name}
            </p>
            <h1 className="mt-5 font-[family-name:var(--vq-font-display)] text-2xl font-semibold text-[var(--vq-ink)] sm:text-3xl">
              {SITE.tagline}
            </h1>
            <p className="mt-4 max-w-lg text-base text-[var(--vq-ink-muted)] sm:text-lg">{SITE.promise}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/earn"
                className="animate-vq-cta inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
              >
                Start earning
              </Link>
              <Link
                href="/giveaways"
                className="inline-flex rounded-md border border-[var(--vq-border-strong)] bg-[var(--vq-bg-deep)]/50 px-5 py-3 text-sm font-semibold text-[var(--vq-ink)] backdrop-blur-sm hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
              >
                Join giveaway
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SocialProofBar />

      <section className="border-t border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-20">
          <div>
            <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
              From Vaultquest to Steam
            </h2>
            <p className="mt-3 max-w-md text-[var(--vq-ink-muted)]">
              Watch the path: quest credit → unlock Steam credit → activate the code in Steam. No password sharing.
            </p>
          </div>
          <HeroRedeemDemo />
        </div>
      </section>

      <section className="border-t border-[var(--vq-border)] bg-[var(--vq-bg)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            {
              step: "01",
              title: "Complete quests",
              body: "Real partner offers — games, surveys, apps. Time varies. No fake generators.",
            },
            {
              step: "02",
              title: "Build Vault points",
              body: "Points credit when partners confirm. Pending holds protect against clawbacks.",
            },
            {
              step: "03",
              title: "Unlock rewards",
              body: `Redeem Steam credit from about $${SITE.minRedeemUsd}, or enter fair scheduled giveaways.`,
            },
          ].map((item) => (
            <div key={item.step} className="animate-vq-tick">
              <p className="font-[family-name:var(--vq-font-mono)] text-xs tracking-widest text-[var(--vq-teal)]">{item.step}</p>
              <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <Link href="/how-it-works" className="text-sm font-medium text-[var(--vq-teal)] hover:underline">
            See how it works →
          </Link>
        </div>
      </section>
    </>
  );
}
