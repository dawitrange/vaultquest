import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Vaultquest handles account, click, and postback data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-faint)]">Outline draft for partner review.</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--vq-ink-muted)]">
        <section><h2 className="font-semibold text-[var(--vq-ink)]">1. Who we are</h2><p>Vaultquest — vaultquest.io + YouTube @zakai1769 (since 2020) + Facebook Freesteamcodes21. Contact via <Link href="/contact" className="text-[var(--vq-teal)] hover:underline">/contact</Link>.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">2. Data we collect</h2><p>Account (email, name, OAuth), usage, click/postback IDs (click_id/user_id/partner), device/IP, support messages. See <Link href="/proof" className="text-[var(--vq-teal)] hover:underline">Proof</Link> for why.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">3. Purposes</h2><p>Provide service, credit Vault Points via S2S, fraud prevention, analytics (visit→signup→first offer→redeem), marketing only where consent allows.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">4. Sharing</h2><p>Offer networks (Torox, Lootably, AdGate, BitLabs, ayeT, CPX), affiliate programs (Freecash Impact), processors (Neon Postgres, Vercel hosting, Resend email), legal requests.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">5. Cookies & tracking</h2><p>NextAuth sessions, affiliate click IDs, analytics. See banner/consent if enabled.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">6. Retention & security</h2><p>Ledger + clicks retained for audit/clawback windows. Security is best-effort (hashed passwords, S2S HMAC verification, hold windows).</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">7. Rights</h2><p>Access/delete/opt-out as applicable (CCPA/GDPR if we target those regions). Request via /contact.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">8. Children</h2><p>Not directed at under-13. Offer walls often require 18+.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">9. Transfers</h2><p>Hosting/email/partners may process in US/EU.</p></section>
        <section><h2 className="font-semibold text-[var(--vq-ink)]">10. Changes</h2><p>We&apos;ll update this page and note effective date.</p></section>
      </div>
    </div>
  );
}
