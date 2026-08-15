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
import {
  ADGATE_SLUG,
  CPX_ALLOWED_WALL_HOSTS,
  CPX_EARN_LIVE_CERTIFIED,
  CPX_MD5_HOOK_READY,
  CPX_POSTBACK_TEMPLATE,
  CPX_SLUG,
  cpxSecureHashEnvConfigured,
  isMarketingHomepageUrl,
} from "@/lib/postback";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [links, redemptions, contacts, recentClicks] = await Promise.all([
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
  ]);

  const clickCounts = await Promise.all(links.map(async (l) => [l.id, await clicksTodayForLink(l.id)] as const));
  const clicksMap = Object.fromEntries(clickCounts);

  const stats = await funnel(7);
  const recentS2s = await prisma.ledgerEntry.findMany({
    where: { kind: "EARN", note: { startsWith: "S2S postback" } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      vp: true,
      status: true,
      availableAt: true,
      questId: true,
      clickId: true,
      createdAt: true,
      note: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        Affiliate caps, fulfillment queue, contact inbox. Do not flip a homepage URL to{" "}
        <code>healthy</code>. AdGate is stalled (under review). Next network is CPX (
        <code>{CPX_SLUG}</code>) — Yield writes that flip only after Ethio pastes a real{" "}
        <code>{CPX_ALLOWED_WALL_HOSTS[0]}</code> or <code>{CPX_ALLOWED_WALL_HOSTS[1]}</code> URL
        with his app_id. Freecash is not earn-live. WIP stays 2/3 — do not certify earn-live.
        {CPX_EARN_LIVE_CERTIFIED ? null : (
          <span className="mt-2 block rounded-[8px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-2 text-xs text-[var(--vq-ink)]">
            <strong>Earn-live is not certified.</strong> CPX MD5 hook is{" "}
            {CPX_MD5_HOOK_READY ? "ready" : "missing"}:{" "}
            <code>md5(trans_id-CPX_SECURE_HASH)</code> vs <code>hash</code>/<code>secure_hash</code>.
            Runtime <code>CPX_SECURE_HASH</code>:{" "}
            {cpxSecureHashEnvConfigured() ? "configured" : "missing"} (name only).{" "}
            <code>POSTBACK_SECRET</code> is already set — that gate alone is not enough.
            Do not invent a wall URL. Do not flip <code>{CPX_SLUG}</code>.
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
                  ? " · wait for Ethio offers./wall.cpx-research.com + app_id; Yield flips"
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
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">S2S postback credits</h2>
        <p className="mt-1 text-sm text-[var(--vq-ink-faint)]">
          Ledger rows created by <code className="text-[var(--vq-teal)]">/api/postback</code> (pending VP +{" "}
          <code>availableAt</code> from holdDays). Demo credits are excluded.
        </p>
        {recentS2s.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--vq-ink-faint)]">No S2S credits yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--vq-border)] rounded-[10px] border border-[var(--vq-border)] text-sm">
            {recentS2s.map((row) => (
              <li key={row.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                <span className="font-[family-name:var(--vq-font-mono)] text-xs">{row.id}</span>
                <span>
                  {row.vp} VP · {row.status}
                  {row.availableAt ? ` · available ${row.availableAt.toISOString()}` : ""}
                  {row.questId ? ` · ${row.questId}` : ""}
                  {row.note?.includes("tx=") ? " · has tx_id" : ""}
                  {row.note?.includes("hmac=ok") ? " · hmac=ok" : ""}
                  {row.note?.includes("cpx_md5=ok") ? " · cpx_md5=ok" : ""}
                </span>
              </li>
            ))}
          </ul>
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
