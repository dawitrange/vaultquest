"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { posthogHost, posthogPublicKey } from "@/lib/posthog-env";

/**
 * Client PostHog boot. Init only when NEXT_PUBLIC_POSTHOG_KEY is set.
 * Pageviews use SDK history_change defaults. Autocapture on. Session replay off.
 * Identify: VaultQuest user id only — no email/name traits.
 * Does not write first-touch UTMs (none exist in-app; do not invent a second writer).
 */
export function PostHogProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const userIdRef = useRef(userId);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    const key = posthogPublicKey();
    if (!key) return;
    if (posthog.__loaded) return;

    posthog.init(key, {
      api_host: posthogHost(),
      defaults: "2026-05-30",
      autocapture: true,
      capture_pageview: "history_change",
      disable_session_recording: true,
      person_profiles: "identified_only",
      loaded: (ph) => {
        if (userIdRef.current) ph.identify(userIdRef.current);
      },
    });
  }, []);

  useEffect(() => {
    if (!posthogPublicKey()) return;
    if (!posthog.__loaded) return;

    if (userId) {
      posthog.identify(userId);
    } else if (prevUserIdRef.current) {
      posthog.reset();
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  return children;
}
