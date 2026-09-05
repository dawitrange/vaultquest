"use client";

import Link from "next/link";
import { useState } from "react";
import { vaultBluffReplayPath } from "@/lib/vault-bluff/public-replay-path";

export function VaultBluffReplayShare({
  sessionId,
  className = "",
}: {
  sessionId: string;
  className?: string;
}) {
  const [notice, setNotice] = useState("");
  const replayPath = vaultBluffReplayPath(sessionId);

  async function shareReplay() {
    const url = new URL(replayPath, window.location.origin).toString();
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Vault Bluff public replay",
          text: "Watch this finished Vault Bluff match.",
          url,
        });
        setNotice("Replay link shared.");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setNotice("Replay link copied.");
        return;
      }
      setNotice("Open the replay and copy its address.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice("Open the replay and copy its address.");
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Link
        href={replayPath}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
      >
        Open replay
      </Link>
      <button
        type="button"
        onClick={() => void shareReplay()}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-teal)] hover:bg-[var(--vq-teal-glow)]"
      >
        Share replay
      </button>
      <p
        role="status"
        aria-live="polite"
        className="basis-full text-xs text-[var(--vq-ink-muted)]"
      >
        {notice}
      </p>
    </div>
  );
}
