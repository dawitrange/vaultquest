import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AffiliateEditForm,
  ContactReadForm,
  CreateAffiliateForm,
  FulfillmentForm,
} from "@/components/AdminForms";
import { requireAdmin } from "@/lib/admin";
import { clicksTodayForLink } from "@/lib/affiliates";
import { prisma } from "@/lib/db";

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        Affiliate caps, fulfillment queue, contact inbox. Postback URL:{" "}
        <code className="text-[var(--vq-teal)]">/api/postback?secret=…&click_id=…&vp=…</code>
      </p>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Affiliate links & caps</h2>
        <p className="mt-1 text-sm text-[var(--vq-ink-faint)]">Rotator skips capped/disabled links automatically.</p>
        <div className="mt-6 grid gap-4">
          {links.map((link) => (
            <div key={link.id}>
              <p className="mb-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
                Clicks today: {clicksMap[link.id] ?? 0}
                {link.capDaily != null ? ` / ${link.capDaily}` : ""}
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
