import type { RoundPhase } from "./types";

export const VAULT_BLUFF_ROUND_COUNT = 4;

export function isVaultBluffFaceoffEnabled(
  value: string | undefined,
) {
  return value === "true";
}

export function roundProgressLabel(roundNumber: number) {
  return `Round ${roundNumber} of ${VAULT_BLUFF_ROUND_COUNT}`;
}

export function shouldRenderVaultBluffFaceoff(
  enabled: boolean,
  phase: RoundPhase,
) {
  return enabled && phase === "CHOOSER_DECISION";
}
