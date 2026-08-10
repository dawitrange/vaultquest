import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Since 2020",
  description:
    "Vaultquest is the 2026 rebuild of ZaKai (YouTube @zakai1769 + Facebook Freesteamcodes21 since 2020) — same community, transparent ledger, link rotation, no generators.",
};

const TIMELINE = [
  {
    year: "2020",
    title: "ZaKai starts — Free Steam Wallet Codes",
    body: "YouTube channel @zakai1769 and Facebook Page Freesteamcodes21 go live (Dec 26, 2020). Weebly funnel at freesteamcodes21.weebly.com drives Freecash + PointsPrizes referrals via a manual Code #1 → Contact Us → agent email flow. It works, but it's slow, scammy-feeling, and unscalable.",
    proof: "Evidence: YouTube About → Joined 2020 · Facebook Page → 67 followers · Weebly still archived as legacy proof (screenshot only, no longer linked as primary CTA).",
    pill: "Legacy",
  },
  {
    year: "2020–2024",
    title: "Community & learning",
    body: "Kept YouTube + Facebook alive while learning what breaks: single affiliate links cap, gestyy shortlinks get spam-flagged, Contact-gated codes kill trust, generators get banned. Research on Gamesbolt / Earnit / Freecash confirms the fix: own the site, own the ledger.",
    proof: "Evidence: video https://youtu.be/sOQWHaHeCkg — early free-Steam explainer (pre-rebrand language). Keep as historical artifact, not current claim.",
    pill: "Lessons",
  },
  {
    year: "2026",
    title: "Vaultquest rebuild",
    body: "Full rebrand to Vaultquest. Next.js 16 + Vault Points ledger (PENDING → POSTED with verification holds), affiliate link rotation/failover, S2S postbacks, and a clear promise: Complete quests, build Vault points, unlock Steam credit & keys — or enter fair giveaways. No generators. No Steam password asks.",
    proof: "Live: vaultquest.io · YouTube rebrand in progress (@zakai1769 → Vaultquest, handle kept until @vaultquest free) · Facebook Page migrating to Vaultquest Community.",
    pill: "Now",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs tracking-[0.14em] text-[var(--vq-teal)]">
          SINCE DEC 26, 2020
        </p>
        <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          From ZaKai to Vaultquest
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--vq-ink-muted)]">
          Same operator since 2020. New name, new product. We kept the community and replaced the
          manual email-for-code funnel with a verified ledger, link rotation, and transparent rules.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/proof"
            className="inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-2.5 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
          >
            Proof & Rules →
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex rounded-md border border-[var(--vq-border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
          >
            How it works
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <a
            href="https://www.youtube.com/@zakai1769"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
          >
            YouTube @zakai1769 ↗
          </a>
          <a
            href="https://www.facebook.com/Freesteamcodes21"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
          >
            Facebook since 2020 ↗
          </a>
          <a
            href="https://youtu.be/sOQWHaHeCkg?si=j7vEVl9RkTsLy5UE"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
          >
            Legacy video ↗
          </a>
        </div>
      </div>

      <div className="relative mt-14 grid gap-6 border-l border-[var(--vq-border)] pl-6 sm:pl-8">
        {TIMELINE.map((item) => (
          <div key={item.year} className="relative">
            <span className="absolute -left-[29px] top-2 h-3 w-3 rounded-full border-2 border-[var(--vq-teal)] bg-[var(--vq-bg)] sm:-left-[37px]" />
            <div className="rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--vq-font-mono)] text-xs tracking-widest text-[var(--vq-teal)]">
                  {item.year}
                </span>
                <span className="rounded-full bg-[var(--vq-teal)]/15 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-[var(--vq-teal)]">
                  {item.pill}
                </span>
              </div>
              <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-lg font-semibold tracking-tight sm:text-xl">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--vq-ink-muted)]">{item.body}</p>
              <p className="mt-3 rounded-lg bg-[var(--vq-bg-sunken)] px-3 py-2 font-[family-name:var(--vq-font-mono)] text-xs leading-relaxed text-[var(--vq-ink-faint)]">
                {item.proof}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-6">
          <h3 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">What we kept from 2020</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--vq-ink-muted)]">
            <li>Affiliate-funded rewards — you complete real tasks, partners pay, we fund the vault</li>
            <li>YouTube as primary discovery (Freecash-style funnels → vaultquest.io first)</li>
            <li>Facebook community for giveaways / updates</li>
            <li>Same operator — continuity screenshots available for partner review</li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h3 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold text-amber-200">What we killed</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-amber-200/80">
            <li>“NO SURVEY OR DOWNLOAD” lies while requiring surveys</li>
            <li>Contact-gated “Code #1 → email us → we send a code” (unscalable + scam signal)</li>
            <li>gestyy / opaque shortlinks as primary CTA</li>
            <li>Single affiliate link with no failover (cap = dead business)</li>
            <li>Generators / “working codes 2026” / Steam password asks — never again</li>
          </ul>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] p-6 sm:p-7">
        <h3 className="font-[family-name:var(--vq-font-display)] text-lg font-semibold">Legacy video — historical context</h3>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          This is the pre-rebrand explainer you linked. We embed via{" "}
          <code className="text-[var(--vq-ink)]">youtube-nocookie</code> so it doesn&apos;t set
          tracking cookies until played. Language reflects 2020; current promise is at{" "}
          <Link href="/proof" className="text-[var(--vq-teal)] hover:underline">
            Proof & Rules
          </Link>
          .
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--vq-border)] bg-black">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/sOQWHaHeCkg"
              title="Free Steam Codes — legacy Vaultquest video (pre-rebrand)"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--vq-ink-faint)]">
          For partner applications: provide a screenshot of YouTube Studio → Customization → Basic Info
          showing <strong className="text-[var(--vq-ink-muted)]">Joined 2020</strong> + this video&apos;s
          publish date alongside the channel link — that&apos;s the strongest age proof (scraping YT is blocked for bots).
        </p>
      </section>

      <section className="mt-10 rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/50 px-6 py-5 text-sm text-[var(--vq-ink-muted)]">
        <strong className="text-[var(--vq-ink)]">For partners reviewing this site:</strong> Impact site
        verification <code className="text-[var(--vq-ink)]">6c1cfdb4-889e-4703-8c10-f8a4960fb83a</code> is in{" "}
        <code className="text-[var(--vq-ink)]">&lt;head&gt;</code>. Postback endpoint:{" "}
        <code className="text-[var(--vq-ink)]">/api/postback</code> (S2S, HMAC-validated for BitLabs / ayeT).
        Rotation inventory at <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">/earn</Link>.
      </section>
    </div>
  );
}
