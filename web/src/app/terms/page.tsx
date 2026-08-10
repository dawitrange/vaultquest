import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Vaultquest Terms — points are promotional credits, anti-fraud, giveaways, liability.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-faint)]">Outline draft for partner review — lawyer review before paid scale.</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--vq-ink-muted)]">
        <section><h2 className="font-semibold text-[var(--vq-ink)]">1. Acceptance & eligibility</h2><p>By creating a Vaultquest account you agree to these Terms. Default 16+ (18+ where required by partner or local law). Do not target under-13. You represent eligibility info is true.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">2. Account & anti-abuse</h2><p>One person, one account. No VPN/proxy abuse on restricted offers, no emulators, no multi-account farming, no self-referrals, no device farms. See <Link href="/proof" className="text-[var(--vq-teal)] hover:underline">Proof & Rules</Link>.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">3. Service: quests → Vault points → rewards</h2><p>Vault Points (VP, 100 VP = $1 user credit at 70% share) are promotional credits, not cash. Earned via partner quest completions verified by S2S postbacks. Ledger states: PENDING (hold for clawback) → POSTED (redeemable) / VOID (clawback).</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">4. Holds, clawbacks, fraud voiding</h2><p>We apply holds (3–14 days by network). Partner rejections trigger clawbacks/reversals. Fraud → hold, void, restrict, or ban per <Link href="/proof#antifraud" className="text-[var(--vq-teal)] hover:underline">Account & anti-fraud</Link>. Decisions logged.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">5. Giveaways</h2><p>Scheduled draws, rules per giveaway at <Link href="/giveaways" className="text-[var(--vq-teal)] hover:underline">/giveaways</Link>. Eligibility, entry, selection, and delivery as stated in each giveaway&apos;s official rules (incorporated here). Void where prohibited. Winners posted.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">6. Partners</h2><p>Offers are third-party. Vaultquest doesn&apos;t control partner content or availability. Affiliate disclosure applies. Rotation ensures you see a healthy link; inventory varies by geo/device.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">7. Prohibited conduct</h2><p>Fraud, harassment, IP theft, scraping for abuse, reverse engineering auth, impersonating staff or Valve.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">8. IP & brand</h2><p>Vaultquest marks and content belong to Vaultquest. Not affiliated with Valve / Steam. Don&apos;t imply endorsement.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">9. Disclaimers & liability</h2><p>Service as-is. To the extent permitted by law, Vaultquest limits liability per outline; does not exclude mandatory consumer rights. Lawyer to set governing law/disputes jurisdiction before scale.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">10. Termination & contact</h2><p>We may suspend/terminate for breach or fraud. Contact via <Link href="/contact" className="text-[var(--vq-teal)] hover:underline">/contact</Link> or Vault Assistant.</p></section>
        <p className="text-xs text-[var(--vq-ink-faint)]">Based on <code>docs/agents/compliance.md §6</code>. Budget flag: lawyer review $150–400 before paid ads / large creator push.</p>
      </div>
    </div>
  );
}
