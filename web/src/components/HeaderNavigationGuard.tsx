"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { needsGameExitConfirmation } from "@/lib/vault-bluff/navigation-policy";

export function HeaderNavigationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [destination, setDestination] = useState<string | null>(null);

  function captureNavigation(event: MouseEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    const url = new URL(anchor.href, window.location.origin);
    if (
      url.origin !== window.location.origin ||
      !needsGameExitConfirmation({
        currentPath: pathname,
        destination: url.pathname,
      })
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDestination(`${url.pathname}${url.search}${url.hash}`);
  }

  function confirmExit() {
    if (!destination) return;
    const nextDestination = destination;
    setDestination(null);
    window.dispatchEvent(new Event("vaultquest:header-navigation"));
    router.push(nextDestination);
  }

  return (
    <div className="contents" onClickCapture={captureNavigation}>
      {children}
      {destination && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] grid place-items-center bg-[var(--vq-bg-deep)]/80 px-4 backdrop-blur-sm"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="leave-game-title"
              aria-describedby="leave-game-description"
              onKeyDown={(event) => {
                if (event.key === "Escape") setDestination(null);
              }}
            >
              <div className="w-full max-w-md rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <h2
                  id="leave-game-title"
                  className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold"
                >
                  Leave Vault Bluff?
                </h2>
                <p
                  id="leave-game-description"
                  className="mt-2 text-sm text-[var(--vq-ink-muted)]"
                >
                  Your current match is saved and will resume from the same state
                  when you return.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setDestination(null)}
                    className="inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold"
                  >
                    Stay in game
                  </button>
                  <button
                    type="button"
                    onClick={confirmExit}
                    className="inline-flex min-h-11 items-center rounded-md bg-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-bg-deep)]"
                  >
                    Leave game
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
