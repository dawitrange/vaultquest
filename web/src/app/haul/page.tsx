import type { Metadata } from "next";
import Image from "next/image";
import {
  formatSteamPrice,
  getPocketHaul,
  POCKET_HAUL_SIZE,
} from "@/lib/steam-specials";

export const metadata: Metadata = {
  title: "Pocket Haul",
  description:
    "Five current Steam specials in a small, deterministic bag. Prices and links come from Steam's public specials feed.",
  alternates: { canonical: "/haul" },
};

const EMPTY_COPY = {
  empty: {
    title: "Steam has not packed any usable specials",
    body: "The public specials feed is readable, but it has no deals we can safely show. This bag stays empty instead of filling itself with made-up games or prices.",
  },
  unavailable: {
    title: "Steam specials are unavailable right now",
    body: "We could not read a valid response from Steam's public feed. Nothing has been added to the bag. Try again later.",
  },
} as const;

export default async function HaulPage() {
  const haul = await getPocketHaul();
  const slots =
    haul.status === "ready"
      ? Array.from(
          { length: POCKET_HAUL_SIZE },
          (_, index) => haul.items[index] ?? null,
        )
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--vq-teal)]">
          Steam specials · five slots
        </p>
        <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Pocket Haul
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--vq-ink-muted)] sm:text-lg">
          A small bag cut from Steam&apos;s current public specials feed. No
          paid placement, affiliate deep links, or mystery inventory.
        </p>
      </header>

      <section
        className="mt-9 overflow-hidden rounded-2xl border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)]/70"
        aria-labelledby="haul-bag-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--vq-border)] bg-[var(--vq-bg-sunken)]/75 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="haul-bag-title"
              className="font-[family-name:var(--vq-font-display)] text-xl font-semibold"
            >
              Five-slot bag
            </h2>
            <p className="mt-1 text-xs text-[var(--vq-ink-faint)]">
              Steam feed order is preserved. The snapshot is cached for up to
              15 minutes, so refreshes do not reshuffle it.
            </p>
          </div>
          <span className="rounded-full border border-[var(--vq-border)] px-3 py-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-muted)]">
            {haul.items.length}/{POCKET_HAUL_SIZE} packed
          </span>
        </div>

        {haul.status === "ready" ? (
          <ol className="grid gap-px bg-[var(--vq-border)] sm:grid-cols-2 lg:grid-cols-5">
            {slots.map((item, index) => (
              <li
                key={item?.appId ?? `empty-${index}`}
                className="min-w-0 bg-[var(--vq-surface)]"
              >
                {item ? (
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-[616/353] overflow-hidden bg-[var(--vq-bg-sunken)]">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded bg-[var(--vq-bg-deep)]/90 px-2 py-1 font-[family-name:var(--vq-font-mono)] text-[11px] text-[var(--vq-ink-muted)]">
                        Slot {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <span className="w-fit rounded bg-[var(--vq-teal)] px-2 py-0.5 font-[family-name:var(--vq-font-mono)] text-xs font-semibold text-[var(--vq-bg-deep)]">
                        −{item.discountPercent}%
                      </span>
                      <h3 className="mt-3 font-[family-name:var(--vq-font-display)] text-lg font-semibold leading-snug">
                        {item.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="font-[family-name:var(--vq-font-mono)] text-lg font-semibold text-[var(--vq-teal)]">
                          {formatSteamPrice(
                            item.finalPriceCents,
                            item.currency,
                          )}
                        </span>
                        <span className="text-sm text-[var(--vq-ink-faint)] line-through">
                          {formatSteamPrice(
                            item.originalPriceCents,
                            item.currency,
                          )}
                        </span>
                      </div>
                      <a
                        href={item.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex min-h-11 items-center pt-5 text-sm font-semibold text-[var(--vq-teal)] hover:underline"
                        aria-label={`View ${item.name} on Steam`}
                      >
                        View on Steam ↗
                      </a>
                    </div>
                  </article>
                ) : (
                  <div className="flex min-h-64 flex-col justify-between p-4 text-[var(--vq-ink-faint)]">
                    <span className="font-[family-name:var(--vq-font-mono)] text-[11px]">
                      Slot {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm">
                      Steam did not supply another usable special.
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <div className="px-6 py-16 text-center" role="status">
            <p className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">
              {EMPTY_COPY[haul.status].title}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--vq-ink-muted)]">
              {EMPTY_COPY[haul.status].body}
            </p>
          </div>
        )}
      </section>

      <aside className="mt-5 rounded-xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)]/40 px-5 py-4 text-xs leading-relaxed text-[var(--vq-ink-muted)]">
        Prices are USD values supplied by Steam and can change after this
        snapshot. Confirm price, availability, and regional eligibility on
        Steam before buying. VaultQuest does not sell these games and receives
        no commission from these links. Steam and Valve are not affiliated with
        VaultQuest.
      </aside>
    </div>
  );
}
