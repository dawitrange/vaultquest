import type { PersonaId, RoundPhase } from "./types";

export const VAULT_BLUFF_ROUND_COUNT = 4;
export const VAULT_BLUFF_INITIAL_FACEOFF_PERSONA: PersonaId = "SHOWBOAT";
const FACE_OFF_PHASES: readonly RoundPhase[] = [
  "KEEPER_INSPECTION",
  "KEEPER_RESPONSE",
  "CHOOSER_QUESTIONING",
  "CHOOSER_DECISION",
  "ROUND_REVEAL",
  "MATCH_COMPLETE",
];

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
  phase: RoundPhase,
) {
  return enabled && FACE_OFF_PHASES.includes(phase);
}

export function nextVaultBluffFaceoffPersona(
  currentPersona: PersonaId,
): PersonaId {
  return currentPersona === "SHOWBOAT" ? "NERVOUS" : "SHOWBOAT";
}
