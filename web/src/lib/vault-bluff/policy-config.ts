import type { PersonaId } from "./types";

export type PersonaPolicy = {
  bluffRate: number;
  explorationRate: number;
  memoryWeight: number;
  certainRate: number;
  baseDelayMs: number;
  delayJitterMs: number;
  reversePsychologyRate: number;
};

export const FROZEN_POLICY = {
  version: "vault-bluff-policy-v1",
  minimumPersonalizationMatches: 5,
  memoryDecay: 0.9,
  personas: {
    ANALYST: {
      bluffRate: 0.28,
      explorationRate: 0.2,
      memoryWeight: 0.55,
      certainRate: 0.72,
      baseDelayMs: 1450,
      delayJitterMs: 500,
      reversePsychologyRate: 0.18,
    },
    SHOWBOAT: {
      bluffRate: 0.58,
      explorationRate: 0.2,
      memoryWeight: 0.42,
      certainRate: 0.86,
      baseDelayMs: 850,
      delayJitterMs: 350,
      reversePsychologyRate: 0.38,
    },
    NERVOUS: {
      bluffRate: 0.4,
      explorationRate: 0.2,
      memoryWeight: 0.48,
      certainRate: 0.32,
      baseDelayMs: 1850,
      delayJitterMs: 900,
      reversePsychologyRate: 0.24,
    },
    WILDCARD: {
      bluffRate: 0.5,
      explorationRate: 0.22,
      memoryWeight: 0.3,
      certainRate: 0.52,
      baseDelayMs: 1100,
      delayJitterMs: 1100,
      reversePsychologyRate: 0.62,
    },
  } satisfies Record<PersonaId, PersonaPolicy>,
} as const;

export function policyFor(persona: PersonaId): PersonaPolicy {
  return FROZEN_POLICY.personas[persona];
}
