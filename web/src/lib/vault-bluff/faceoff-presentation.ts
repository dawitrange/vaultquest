import type { RoundPhase } from "./types";

export const VAULT_BLUFF_ROUND_COUNT = 4;

export function isVaultBluffFaceoffEnabled(
  value: string | undefined,
  vercelEnvironment?: string,
) {
  return value === "true" || vercelEnvironment === "preview";
}

export function roundProgressLabel(roundNumber: number) {
  return `Round ${roundNumber} of ${VAULT_BLUFF_ROUND_COUNT}`;
}

export function shouldRenderVaultBluffFaceoff(
  enabled: boolean,
  _phase: RoundPhase,
) {
  return enabled;
}
