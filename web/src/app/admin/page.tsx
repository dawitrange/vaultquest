import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AffiliateEditForm,
  ContactReadForm,
  CreateAffiliateForm,
  FulfillmentForm,
} from "@/components/AdminForms";
import { exactFraction, funnel } from "@/lib/analytics";
import { requireAdmin } from "@/lib/admin";
import { clicksTodayForLink } from "@/lib/affiliates";
import { prisma } from "@/lib/db";
import { listPostbackLabEvidence } from "@/lib/postback-lab";
import {
  ADGATE_SLUG,
  CPX_APP_ID,
  CPX_EARN_LIVE_CERTIFIED,
  CPX_LIVE_SMOKE_ALLOWED,
  CPX_MD5_HOOK_READY,
  CPX_YIELD_FLIP_CONFIRMED,
  CPX_POSTBACK_TEMPLATE,
  CPX_SLUG,
  cpxSecureHashEnvConfigured,
  isMarketingHomepageUrl,
} from "@/lib/postback";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [links, redemptions, contacts, recentClicks, postbackLab] = await Promise.all([
    prisma.affiliateLink.findMany({ orderBy: [{ category: "asc" }, { priority: "asc" }] }),
    prisma.redemption.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.offerClick.findMany({
      include: { affiliateLink: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    listPostbackLabEvidence(prisma),
  ]);

  const clickCounts = await Promise.all(links.map(async (l) => [l.id, await clicksTodayForLink(l.id)] as const));
  const clicksMap = Object.fromEntries(clickCounts);

  const stats = await funnel(7);
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        Affiliate caps, fulfillment queue, contact inbox. Do not flip a homepage URL to{" "}
        <code>healthy</code>. AdGate is stalled (under review). Ethio&apos;s CPX postback
        test succeeded. Yield is flipping <code>{CPX_SLUG}</code> (app_id{" "}
        <code>{CPX_APP_ID}</code>). Flip confirmed: {CPX_YIELD_FLIP_CONFIRMED ? "yes" : "no"}.
        Live smoke allowed: {CPX_LIVE_SMOKE_ALLOWED ? "yes" : "no — wait for Yield confirm"}.
        After confirm, smoke path is CPX / <code>q-surveys</code> only — not Freecash, not a
        homepage. Do not invent a wall URL. Live postback has no <code>hash=</code>.
        Not earn-live until a production pending VP is visible.
        {CPX_EARN_LIVE_CERTIFIED ? null : (
          <span className="mt-2 block rounded-[8px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-2 text-xs text-[var(--vq-ink)]">
            <strong>Earn-live is not certified. Live smoke is on standby.</strong> Official CPX
            param is <code>secure_hash</code> = <code>md5(trans_id-appsecurehash)</code>. Do not
            put MD5 on HMAC <code>hash=</code> (current prod would 401).{" "}
            <code>partner=cpx</code> with no HMAC <code>hash</code> does not 401. MD5 hook{" "}
            {CPX_MD5_HOOK_READY ? "ready" : "missing"}. Runtime <code>CPX_SECURE_HASH</code>:{" "}
            {cpxSecureHashEnvConfigured() ? "configured" : "missing"} (name only).{" "}
            <strong>status=2</strong> voids a matching PENDING/POSTED EARN; it does not unwind
            an already-spent REDEEM. Do not smoke until Yield confirms the flip.
            <span className="mt-2 block break-all font-[family-name:var(--vq-font-mono)] text-[10px] text-[var(--vq-ink-muted)]">
              {CPX_POSTBACK_TEMPLATE}
            </span>
          </span>
        )}
      </p>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Conversion funnel · last 7 days</h2>
        <p className="mt-1 text-sm text-[var(--vq-ink-faint)]">
          From the ledger (real data). Counts are exact — rates are fractions, not rounded percents.
          Pageview/visitor traffic is in Vercel Web Analytics once enabled.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Offer clicks", value: String(stats.offerClicks) },
            { label: "Earn credits", value: String(stats.earnCredits) },
            { label: "Pending EARN", value: String(stats.pendingEarnCredits) },
            { label: "S2S credits", value: String(stats.s2sEarnCredits) },
            { label: "Redemptions", value: String(stats.redemptions) },
            { label: "Click → earn", value: exactFraction(stats.earnCredits, stats.offerClicks) },
            { label: "Earn → redeem", value: exactFraction(stats.redemptions, stats.earnCredits) },
          ].map((s) => (
            <div key={s.label} className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">{s.label}</p>
              <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-teal)]">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Affiliate links & caps</h2>
        <p className="mt-1 text-sm text-[var(--vq-ink-faint)]">Rotator skips capped/disabled links automatically.</p>
        <div className="mt-6 grid gap-4">
          {links.map((link) => (
            <div key={link.id}>
              <p className="mb-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
                Clicks today: {clicksMap[link.id] ?? 0}
                {link.capDaily != null ? ` / ${link.capDaily}` : ""}
                {isMarketingHomepageUrl(link.url)
                  ? ` · homepage — keep ${link.slug} disabled (do not flip /admin)`
                  : ""}
                {link.slug === CPX_SLUG
                  ? ` · app_id ${CPX_APP_ID}; Ethio postback test ok; Yield flipping — do not smoke until confirm`
                  : ""}
                {link.slug === ADGATE_SLUG ? " · AdGate stalled (under review)" : ""}
              </p>
              <AffiliateEditForm link={link} />
            </div>
          ))}
        </div>
        <CreateAffiliateForm />
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Fulfillment ops</h2>
        <div className="mt-6 grid gap-4">
          {redemptions.length === 0 ? (
            <p className="text-sm text-[var(--vq-ink-faint)]">No redemptions yet.</p>
          ) : (
            redemptions.map((r) => <FulfillmentForm key={r.id} redemption={r} />)
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Contact inbox</h2>
        <ul className="mt-6 space-y-3">
          {contacts.length === 0 ? (
            <li className="text-sm text-[var(--vq-ink-faint)]">No messages.</li>
          ) : (
            contacts.map((c) => (
              <li key={c.id} className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">
                    {c.name} &lt;{c.email}&gt;{" "}
                    <span className="text-xs font-normal text-[var(--vq-ink-faint)]">{c.status}</span>
                  </p>
                  {c.status === "NEW" ? <ContactReadForm id={c.id} /> : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[var(--vq-ink-muted)]">{c.message}</p>
                <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">{c.createdAt.toLocaleString()}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">S2S Postback Lab</h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--vq-ink-faint)]">
              Read-only database evidence joining each S2S ledger entry to its OfferClick. This proves binding,
              credited state, and VP hold state; it does not prove partner payout.
            </p>
          </div>
          <a
            href="/api/admin/postback-lab.csv"
            className="rounded-md border border-[var(--vq-border)] px-3 py-2 text-xs font-semibold text-[var(--vq-teal)] hover:border-[var(--vq-teal)]"
          >
            Download CSV
          </a>
        </div>
        {postbackLab.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--vq-ink-faint)]">No S2S ledger entries yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[10px] border border-[var(--vq-border)]">
            <table className="min-w-[980px] table-fixed text-left text-xs">
              <thead className="bg-[var(--vq-bg-raised)] text-[var(--vq-ink-faint)]">
                <tr>
                  <th className="w-44 px-3 py-2 font-medium">Partner / transaction</th>
                  <th className="w-56 px-3 py-2 font-medium">OfferClick</th>
                  <th className="w-56 px-3 py-2 font-medium">LedgerEntry</th>
                  <th className="w-48 px-3 py-2 font-medium">VP state</th>
                  <th className="w-36 px-3 py-2 font-medium">Binding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--vq-border)]">
                {postbackLab.map((row) => (
                  <tr key={row.ledgerId} className="align-top">
                    <td className="px-3 py-3">
                      <span className="block">{row.partner ?? "unknown partner"}</span>
                      <span className="mt-1 block break-all font-[family-name:var(--vq-font-mono)] text-[10px] text-[var(--vq-ink-faint)]">
                        tx={row.transactionId ?? "not supplied"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block break-all font-[family-name:var(--vq-font-mono)] text-[10px]">
                        {row.clickId ?? "unbound"}
                      </span>
                      <span className="mt-1 block text-[var(--vq-ink-faint)]">
                        credited={row.clickCredited == null ? "unknown" : String(row.clickCredited)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block break-all font-[family-name:var(--vq-font-mono)] text-[10px]">
                        {row.ledgerId}
                      </span>
                      <span className="mt-1 block text-[var(--vq-ink-faint)]">
                        {row.vp} VP{row.questId ? ` · ${row.questId}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block">{row.ledgerStatus}</span>
                      <span className="mt-1 block text-[var(--vq-ink-faint)]">{row.availability}</span>
                      {row.availableAt ? (
                        <span className="mt-1 block font-[family-name:var(--vq-font-mono)] text-[10px] text-[var(--vq-ink-faint)]">
                          {row.availableAt.toISOString()}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 font-[family-name:var(--vq-font-mono)] text-[10px]">
                      {row.binding}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Recent clicks</h2>
        <ul className="mt-4 divide-y divide-[var(--vq-border)] rounded-[10px] border border-[var(--vq-border)] text-sm">
          {recentClicks.map((c) => (
            <li key={c.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <span className="font-[family-name:var(--vq-font-mono)] text-xs">{c.id}</span>
              <span>
                {c.affiliateLink.partner} · {c.questId} · {c.user?.email ?? "anon"} ·{" "}
                {c.credited ? "credited" : "open"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
