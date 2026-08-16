import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proof & Rules",
  description:
    "How VaultQuest makes money, what we ban, how giveaways and ledger holds work, and partner disclosures — rebranded from ZaKai (2020).",
};

const TOC = [
  { id: "earnings", label: "How earnings work" },
  { id: "never", label: "How we keep it fair" },
  { id: "giveaways", label: "Giveaway rules" },
  { id: "winners", label: "Winners & redemption proof" },
  { id: "disclosure", label: "Partner & affiliate disclosure" },
  { id: "antifraud", label: "Account & anti-fraud" },
  { id: "creator", label: "Creator / ad disclosure" },
  { id: "support", label: "Contact & support" },
  { id: "legal", label: "Terms & Privacy" },
];

export default function ProofPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-[family-name:var(--vq-font-mono)] text-xs tracking-[0.14em] text-[var(--vq-teal)]">
        HOW VAULTQUEST WORKS · SAME TEAM SINCE 2020
      </p>
      <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
        Proof & Rules
      </h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        The full picture — how you earn, how payouts work, and the rules, in plain language.{" "}
        <Link href="/about" className="text-[var(--vq-teal)] hover:underline">
          Since 2020 story →
        </Link>
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {TOC.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1 text-xs text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/60 px-4 py-3 text-sm text-[var(--vq-ink-muted)]">
        <strong className="text-[var(--vq-ink)]">Our community since 2020:</strong> YouTube{" "}
        <a href="https://www.youtube.com/@zakai1769" target="_blank" rel="noreferrer" className="text-[var(--vq-teal)] hover:underline">
          @zakai1769
        </a>{" "}
        + our{" "}
        <a href="https://www.facebook.com/Freesteamcodes21" target="_blank" rel="noreferrer" className="text-[var(--vq-teal)] hover:underline">
          Facebook community
        </a>{" "}
        → now VaultQuest (2026).
      </div>

      <section id="earnings" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">1 · How earnings work</h2>
        <p className="text-[var(--vq-ink-muted)]">
          You complete partner quests (surveys, app installs, game milestones, offer walls). When the
          partner confirms the action, we receive a commission. We credit you Vault points (VP, 100 VP =
          $1 user credit at 70% split of gross partner revenue) and fulfill Steam rewards from that
          surplus plus our vault float.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--vq-ink-muted)]">
          <li>
            Credits land as <strong className="text-[var(--vq-ink)]">PENDING</strong> until the partner hold clears (3–14 days by network) then become{" "}
            <strong className="text-[var(--vq-ink)]">POSTED — available to redeem</strong>. Full ledger at{" "}
            <Link href="/account" className="text-[var(--vq-teal)] hover:underline">
              /account
            </Link>
            .
          </li>
          <li>
            We never promise a reward larger than <code className="text-[var(--vq-ink)]">expected partner yield × 70% share</code> after
            typical clawbacks. See <Link href="/how-it-works" className="text-[var(--vq-teal)] hover:underline">How it works</Link>.
          </li>
            <li>Credits are verified server-to-server with our partners — browser pixels alone don&apos;t pay.</li>
        </ul>
      </section>

      <section id="never" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">2 · How we keep it fair</h2>
        <ul className="list-inside list-disc space-y-1 text-[var(--vq-ink-muted)]">
          <li>Run Steam code generators or “working codes” pages</li>
          <li>Ask for your Steam password — never share it</li>
          <li>Claim “no survey” when surveys/offers exist</li>
          <li>Promise guaranteed $ amounts or instant free $50</li>
          <li>Gate rewards behind manual email or contact-form steps</li>
          <li>Publish fake winner feeds, fake counters, or stock “PROOF” badges</li>
          <li>Coach VPNs, emulators, multi-accounts, or self-referrals</li>
        </ul>
        <p className="text-xs text-[var(--vq-ink-faint)]">See our sourcing and claims policy for what we never show.</p>
      </section>

      <section id="giveaways" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">3 · Giveaway rules</h2>
        <p className="text-[var(--vq-ink-muted)]">
          Giveaways are scheduled, rules publish before each draw, winners post publicly. They are funded
          as acquisition COGS from surplus margin — not an uncapped “everyone gets a code” promise.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--vq-ink-muted)]">
          <li>Eligibility: 16+ (or 18+ where local law / partner requires); void where prohibited</li>
          <li>
            Entry: VaultQuest account + optional VP or quest completion as stated per giveaway page (
            <Link href="/giveaway" className="text-[var(--vq-teal)] hover:underline">
              /giveaway
            </Link>
            )
          </li>
          <li>Selection: random draw or stated method; winner handle published on giveaways page</li>
          <li>Announcement: site post + community (Facebook Page / Discord when live)</li>
          <li>Prize delivery: Steam code / key DM or email as listed; must claim within window stated in rules</li>
        </ul>
      </section>

      <section id="winners" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">4 · Winners & redemption proof</h2>
        <div className="rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-4">
          <p className="font-[family-name:var(--vq-font-mono)] text-xs tracking-widest text-[var(--vq-ink-faint)]">
            PUBLISHED AFTER EACH DRAW
          </p>
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            Winners and redemption proof go up here after our first completed giveaway draw. With a winner&apos;s
            permission, we&apos;ll show redacted confirmations.
          </p>
          <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
            As the ledger fills, this becomes live stats — total VP credited and redemptions fulfilled.
          </p>
        </div>
      </section>

      <section id="disclosure" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">5 · Partner & affiliate disclosure</h2>
        <p className="text-[var(--vq-ink-muted)]">
          VaultQuest uses third-party offer and survey networks (Torox, Lootably, AdGate Media, BitLabs,
          ayeT Studios, CPX Research) and affiliate programs such as{" "}
          <strong className="text-[var(--vq-ink)]">Freecash on Impact</strong>. Some links on{" "}
          <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
            /earn
          </Link>{" "}
          are affiliate/partner links — we may earn when you complete qualifying offers. If a partner&apos;s
          link is capped or unavailable we automatically route to a healthy partner and log the rotation.
        </p>
      </section>

      <section id="antifraud" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">6 · Account & anti-fraud rules</h2>
        <p className="text-[var(--vq-ink-muted)]">
          One person, one account. Partner networks ban VPN/proxy, emulators, and multi-account farming —
          so do we. We may delay (hold) or reverse (void/clawback) points after partner rejections. Severe abuse
          → restrict or ban. Full outline in <Link href="/terms" className="text-[var(--vq-teal)] hover:underline">Terms</Link>.
        </p>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-3 text-[var(--vq-ink-muted)]">
            <strong className="text-[var(--vq-ink)]">We detect:</strong> device farms, VPN on restricted
            offers, self-referrals/rings, bots, giveaway multi-entry, chargeback patterns via postback.
          </div>
          <div className="rounded-lg border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-3 text-[var(--vq-ink-muted)]">
            <strong className="text-[var(--vq-ink)]">We don&apos;t auto-punish:</strong> single VPN on
            unrestricted content, shared household IP if not farming, slow earners, first device change with
            clean history.
          </div>
        </div>
      </section>

      <section id="creator" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">7 · Creator / ad disclosure</h2>
        <p className="text-[var(--vq-ink-muted)]">
          Videos and ads promoting VaultQuest or partner quests must disclose sponsorship/affiliates. On
          YouTube: verbal disclosure early in the video <em>and</em> written disclosure in the first 3 lines of the
          description. Example: “This video promotes VaultQuest; we may earn when you complete offers via our links.”
          Our channel <a href="https://www.youtube.com/@zakai1769" target="_blank" rel="noreferrer" className="text-[var(--vq-teal)] hover:underline">@zakai1769</a> → rebranding
          to VaultQuest follows this policy. Creators who teach fraud lose affiliate status.
        </p>
      </section>

      <section id="support" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">8 · Contact & support</h2>
        <p className="text-[var(--vq-ink-muted)]">
          Support is for account or redemption issues — not “email us your Freecash screenshot for a
          code” (that flow is dead). Use{" "}
          <Link href="/contact" className="text-[var(--vq-teal)] hover:underline">
            /contact
          </Link>{" "}
          (saved + emailed via Resend when configured) or the Vault Assistant chat (◈) on every page.
        </p>
      </section>

      <section id="legal" className="mt-10 scroll-mt-24 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">9 · Legal</h2>
        <p className="text-sm text-[var(--vq-ink-muted)]">
          VaultQuest is not affiliated with Valve Corporation or Steam. Points are promotional credits, not cash or bank
          deposits — redeem only via the catalog at{" "}
          <Link href="/rewards" className="text-[var(--vq-teal)] hover:underline">
            /rewards
          </Link>
. Read our full{" "}
          <Link href="/terms" className="text-[var(--vq-teal)] hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[var(--vq-teal)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/terms" className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 hover:text-[var(--vq-ink)]">
            Terms of Service →
          </Link>
          <Link href="/privacy" className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 hover:text-[var(--vq-ink)]">
            Privacy Policy →
          </Link>
          <Link href="/about" className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 hover:text-[var(--vq-ink)]">
            Since 2020 →
          </Link>
        </div>
        <p className="text-xs text-[var(--vq-ink-faint)]">
          Age gate: default 16+; offer walls / surveys enforce their own (often 18+). We don&apos;t target under-13. Geo:
          offers vary by region — &ldquo;not available in your region&rdquo; shown when applicable.
        </p>
      </section>
    </div>
  );
}
