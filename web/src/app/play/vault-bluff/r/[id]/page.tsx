import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VaultBluffReplay } from "@/components/play/VaultBluffReplay";
import {
  getPublicGameReplay,
  isVaultBluffSchemaUnavailable,
} from "@/lib/vault-bluff/service";

export const metadata: Metadata = {
  title: "Vault Bluff replay",
  description: "A finished Vault Bluff match against a clearly labeled bot.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Vault Bluff replay | VaultQuest",
    description: "A finished Vault Bluff match against a clearly labeled bot.",
  },
};

type Props = {
  params: Promise<{ id: string }>;
};

function ReplayUnavailable() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <section className="rounded-[12px] border border-[var(--vq-warn)]/50 bg-[var(--vq-bg-raised)] p-6 sm:p-8">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-warn)]">
          Temporarily unavailable
        </p>
        <h1 className="mt-2 font-[family-name:var(--vq-font-display)] text-3xl font-bold">
          This replay cannot load right now
        </h1>
        <p className="mt-3 text-[var(--vq-ink-muted)]">
          The archived match is unchanged. Try the link again later.
        </p>
        <Link
          href="/play"
          className="mt-6 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
        >
          Back to Play
        </Link>
      </section>
    </main>
  );
}

export default async function VaultBluffReplayPage({ params }: Props) {
  const { id } = await params;
  let replay: Awaited<ReturnType<typeof getPublicGameReplay>>;

  try {
    replay = await getPublicGameReplay(id);
  } catch (error) {
    if (isVaultBluffSchemaUnavailable(error)) return <ReplayUnavailable />;
    throw error;
  }

  if (!replay) notFound();
  return <VaultBluffReplay replay={replay} sessionId={id} />;
}
