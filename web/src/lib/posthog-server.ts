import { PostHog } from "posthog-node";
import { PH_EVENTS, posthogHost, posthogPublicKey, sanitizePosthogProperties } from "@/lib/posthog-env";

export { PH_EVENTS };

/**
 * Short-lived Node client. Next.js route/action lifetimes are short, so flush immediately.
 * No-op when NEXT_PUBLIC_POSTHOG_KEY is unset (preview/local still boot).
 */
function createClient(): PostHog | null {
  const key = posthogPublicKey();
  if (!key) return null;
  return new PostHog(key, {
    host: posthogHost(),
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!distinctId) return;
  const client = createClient();
  if (!client) return;
  try {
    client.capture({
      distinctId,
      event,
      properties: sanitizePosthogProperties(properties),
    });
    await client.shutdown();
  } catch {
    // Analytics must never block hops, signup, or giveaway writes.
  }
}
