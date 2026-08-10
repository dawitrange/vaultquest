import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getBalance, listLedger } from "@/lib/ledger";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [balance, entries, redemptions] = await Promise.all([
    getBalance(session.user.id),
    listLedger(session.user.id),
    prisma.redemption.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Account</h1>
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-[var(--vq-border)] px-3 py-2 text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">Available VP</p>
          <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-3xl text-[var(--vq-teal)]">
            {balance.available}
          </p>
        </div>
        <div className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">Pending VP</p>
          <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-3xl text-[var(--vq-warn)]">{balance.pending}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
        Pending clears after the hold window (demo earns use ~3 days).{" "}
        <Link href="/rewards" className="text-[var(--vq-teal)] hover:underline">
          Redeem
        </Link>{" "}
        ·{" "}
        <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
          Earn
        </Link>
      </p>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Ledger</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--vq-ink-faint)]">No entries yet. Complete a demo credit on Earn.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--vq-border)] rounded-[10px] border border-[var(--vq-border)]">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{e.kind}</p>
                  <p className="text-xs text-[var(--vq-ink-faint)]">
                    {e.status}
                    {e.availableAt ? ` · available ${e.availableAt.toLocaleDateString()}` : ""}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <p
                  className={`font-[family-name:var(--vq-font-mono)] ${e.vp >= 0 ? "text-[var(--vq-teal)]" : "text-[var(--vq-danger)]"}`}
                >
                  {e.vp >= 0 ? "+" : ""}
                  {e.vp} VP
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Redemptions</h2>
        {redemptions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--vq-ink-faint)]">No unlock requests yet.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {redemptions.map((r) => (
              <li key={r.id} className="rounded-md border border-[var(--vq-border)] px-4 py-3">
                <span className="font-medium">{r.label}</span>
                <span className="text-[var(--vq-ink-faint)]">
                  {" "}
                  · {r.costVp} VP · {r.status}
                </span>
                {r.deliveryCode ? (
                  <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-teal)]">
                    Delivery: {r.deliveryCode}
                  </p>
                ) : null}
                {r.fulfillNote && r.status === "FULFILLED" ? (
                  <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">{r.fulfillNote}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
