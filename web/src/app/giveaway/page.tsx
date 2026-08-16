import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { GiveawayForm } from "@/components/GiveawayForm";
import {
  FACEBOOK_PAGE_URL,
  ROBLOX_GIVEAWAY_PRIZE,
  ROBLOX_GIVEAWAY_WINDOW_LABEL,
  ROBLOX_GIVEAWAY_WINNER_COUNT,
  giveawayPhase,
  type GiveawayTally,
} from "@/lib/giveaway";
import { getGiveawayTally } from "@/lib/giveaway-store";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roblox gift card giveaway",
  description:
    "Enter for five $25 Roblox gift cards on VaultQuest. One base entry for a valid submit. Extra entries from completed quests on /earn. Steam credit is still the product.",
  alternates: { canonical: "/giveaway" },
  openGraph: {
    title: "Roblox gift card giveaway | VaultQuest",
    description:
      "Five $25 Roblox gift cards. Enter on vaultquest.io. No purchase necessary. Winners on this page and Facebook.",
    url: `${SITE.url}/giveaway`,
  },
};

function phaseCopy(phase: ReturnType<typeof giveawayPhase>) {
  if (phase === "upcoming") {
    return {
      badge: "Opens August 17",
      formDisabled: true,
      formReason: `Entries open ${ROBLOX_GIVEAWAY_WINDOW_LABEL}. The form stays off until then.`,
    };
  }
  if (phase === "closed") {
    return {
      badge: "Closed",
      formDisabled: true,
      formReason:
        "This giveaway is closed. We are not taking new entries. Winners will be posted on this page and the Facebook Page. We will not DM codes.",
    };
  }
  return { badge: "Open", formDisabled: false, formReason: undefined };
}

function EntryTally({ tally, signedIn }: { tally: GiveawayTally | null; signedIn: boolean }) {
  return (
    <section className="mt-8 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-6">
      <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">How entries work</h2>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        Extra entries are a live count of completed quests on your VaultQuest account during the window. A
        completion is a partner-confirmed earn that is pending or posted, not voided. Clicking Start quest is not a
        completion. Gamehag does not count.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--vq-ink-muted)]">
        <li>1 base entry for a valid form submit in the window</li>
        <li>+1 entry per completed quest or offer on vaultquest.io during the window</li>
      </ul>
      {signedIn && tally ? (
        <p className="mt-4 font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-ink)]">
          Your count: {tally.baseEntries} base + {tally.extraEntries} completed quests = {tally.totalEntries}{" "}
          {tally.totalEntries === 1 ? "entry" : "entries"}
        </p>
      ) : (
        <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
          Sign in or enter below to see your real count. We do not show a public total.
        </p>
      )}
      <p className="mt-3 text-sm text-[var(--vq-ink-muted)]">
        Do offers for a better chance. That line is only true because the count above is real. Offers live on{" "}
        <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
          vaultquest.io/earn
        </Link>
        , not Gamehag and not a raw partner wall.
      </p>
    </section>
  );
}

export default async function GiveawayPage({
  searchParams,
}: {
  searchParams: Promise<{ entered?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const phase = giveawayPhase();
  const copy = phaseCopy(phase);
  const tally = session?.user?.id ? await getGiveawayTally(session.user.id) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--vq-teal)]">
        Rebrand giveaway · {copy.badge}
      </p>
      <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
        Roblox gift card giveaway
      </h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Prize: {ROBLOX_GIVEAWAY_PRIZE}. Not a limited Roblox avatar item. Steam credit is still the product. This
        draw is a rebrand giveaway for the VaultQuest community.
      </p>
      <p className="mt-3 text-sm text-[var(--vq-ink-muted)]">
        Window: <span className="text-[var(--vq-ink)]">{ROBLOX_GIVEAWAY_WINDOW_LABEL}</span>
      </p>

      {params.entered === "1" ? (
        <p className="mt-6 text-sm text-[var(--vq-success)]">
          You&apos;re in. Next step: complete a quest on{" "}
          <Link href="/earn" className="underline hover:text-[var(--vq-teal)]">
            /earn
          </Link>{" "}
          if you want extra entries.
        </p>
      ) : null}

      <EntryTally tally={tally} signedIn={signedIn} />

      <section className="mt-8 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-6">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Enter</h2>
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          Name, email, and a short &quot;why you should get it.&quot; Submitting creates or uses your VaultQuest
          account.
        </p>
        <GiveawayForm
          signedIn={signedIn}
          defaultName={session?.user?.name ?? undefined}
          defaultEmail={session?.user?.email ?? undefined}
          disabled={copy.formDisabled}
          disabledReason={copy.formReason}
        />
        {signedIn && tally?.entered ? (
          <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
            Next step:{" "}
            <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">
              /earn
            </Link>{" "}
            for extra entries from completed quests.
          </p>
        ) : null}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Rules</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--vq-ink-muted)]">
          <li>18 or older. No purchase necessary. Void where prohibited.</li>
          <li>Not affiliated with Roblox, Valve, or Steam.</li>
          <li>We will not DM codes. If you win, we email the account on this entry and post on this page.</li>
          <li>
            Winners announced on this site and our{" "}
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noreferrer" className="text-[var(--vq-teal)] hover:underline">
              Facebook Page
            </a>
            .
          </li>
          <li>
            {ROBLOX_GIVEAWAY_WINNER_COUNT} winners, picked at random, weighted by the entry count shown above after
            the window closes.
          </li>
          <li>Steam credit on /rewards is still the everyday product. This is one scheduled giveaway.</li>
        </ul>
        <p className="text-sm text-[var(--vq-ink-faint)]">
          Full site rules:{" "}
          <Link href="/proof#giveaways" className="text-[var(--vq-teal)] hover:underline">
            Proof & Rules
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
