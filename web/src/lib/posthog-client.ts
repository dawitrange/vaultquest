"use client";

import posthog from "posthog-js";
import { PH_EVENTS, posthogPublicKey, sanitizePosthogProperties } from "@/lib/posthog-env";

export { PH_EVENTS };

export function captureClientEvent(event: string, properties?: Record<string, unknown>): void {
  if (!posthogPublicKey()) return;
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, sanitizePosthogProperties(properties));
}
