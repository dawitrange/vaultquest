import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giveaways",
  description: "Fair, scheduled VaultQuest giveaways with published rules and public winners.",
};

export default function GiveawaysPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Giveaways</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Scheduled, rules published, winners posted. Funded as trust/growth — not “everyone gets a free code.”
      </p>

      <article className="mt-10 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-6">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-brass)]">
          Upcoming
        </p>
        <h2 className="mt-2 font-[family-name:var(--vq-font-display)] text-2xl font-semibold">Launch vault giveaway</h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          First public draw after earn path goes live. Entry will require an account; optional VP entry or quest
          completion may apply. Exact rules publish before open.
        </p>
        <ul className="mt-4 list-inside list-disc text-sm text-[var(--vq-ink-muted)]">
          <li>No purchase necessary where prohibited by law</li>
          <li>Winners listed on this page</li>
          <li>Never DM Steam passwords</li>
        </ul>
        <button
          type="button"
          disabled
          className="mt-6 rounded-md border border-[var(--vq-border)] px-4 py-2.5 text-sm text-[var(--vq-ink-faint)]"
        >
          Entries open after launch
        </button>
      </article>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Past winners</h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-faint)]">None yet — this feed stays empty until real draws happen. No fake proof.</p>
      </section>

      <Link href="/proof" className="mt-8 inline-block text-sm text-[var(--vq-teal)] hover:underline">
        Read Proof & Rules →
      </Link>
    </div>
  );
}
