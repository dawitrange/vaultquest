"use client";

import { useEffect } from "react";
import { captureClientEvent, PH_EVENTS } from "@/lib/posthog-client";

export function GameHubViewed() {
  useEffect(() => {
    captureClientEvent(PH_EVENTS.game_hub_viewed, {
      engine_version: "vault-bluff-engine-v1",
      policy_version: "vault-bluff-policy-v1",
    });
  }, []);

  return null;
}
