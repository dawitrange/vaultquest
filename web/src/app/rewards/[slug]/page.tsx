import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { REWARD_GUIDES, SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

function guideBySlug(slug: string) {
  return REWARD_GUIDES.find((g) => g.slug === slug);
}

export function generateStaticParams() {
  return REWARD_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/rewards/${guide.slug}` },
    openGraph: {
      title: `${guide.title} | ${SITE.name}`,
      description: guide.description,
      url: `/rewards/${guide.slug}`,
    },
  };
}

export default async function RewardGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Rewards", item: `${SITE.url}/rewards` },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `${SITE.url}/rewards/${guide.slug}`,
      },
    ],
  };

  const others = REWARD_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JsonLd data={breadcrumb} />
      <nav className="text-xs text-[var(--vq-ink-faint)]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--vq-teal)]">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/rewards" className="hover:text-[var(--vq-teal)]">
          Rewards
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--vq-ink-muted)]">{guide.title}</span>
      </nav>

      <h1 className="mt-4 font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
        {guide.h1}
      </h1>
      <p className="mt-4 text-[var(--vq-ink-muted)]">{guide.intro}</p>

      <ul className="mt-6 list-disc space-y-2 pl-5 text-[var(--vq-ink-muted)]">
        {guide.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/earn"
          className="inline-flex rounded-md bg-[var(--vq-teal)] px-5 py-3 text-sm font-semibold text-[var(--vq-bg-deep)] hover:bg-[var(--vq-teal-dim)] hover:text-white"
        >
          Start earning
        </Link>
        <Link
          href="/rewards"
          className="inline-flex rounded-md border border-[var(--vq-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--vq-ink)] hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
        >
          View redeem catalog
        </Link>
        <Link href="/how-it-works" className="inline-flex px-2 py-3 text-sm text-[var(--vq-teal)] hover:underline">
          How it works →
        </Link>
      </div>

      <section className="mt-14 border-t border-[var(--vq-border)] pt-8">
        <h2 className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">Related guides</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/rewards/${g.slug}`}
                className="inline-flex rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] px-3 py-1.5 text-sm text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)]"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
