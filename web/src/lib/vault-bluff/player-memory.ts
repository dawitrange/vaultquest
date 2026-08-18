import { FROZEN_POLICY } from "./policy-config";
import {
  QUESTIONS,
  VAULT_BLUFF_ENGINE_VERSION,
  VAULT_BLUFF_POLICY_VERSION,
  type PlayerMemory,
  type VaultBluffState,
} from "./types";

export function neutralPlayerMemory(): PlayerMemory {
  return {
    completedMatches: 0,
    keepRate: 0.5,
    keeperTruthRate: 0.5,
    questionFrequency: {
      KEY_INSIDE_YOUR_CASE: 1 / QUESTIONS.length,
      WHICH_CASE_SHOULD_I_CHOOSE: 1 / QUESTIONS.length,
      WHAT_DID_YOU_SEE: 1 / QUESTIONS.length,
      ARE_YOU_TELLING_THE_TRUTH: 1 / QUESTIONS.length,
      SHOULD_I_KEEP_MINE: 1 / QUESTIONS.length,
      HOW_CONFIDENT_ARE_YOU: 1 / QUESTIONS.length,
    },
    confidenceCertainRate: 0.5,
    averageDurationMs: 1400,
    chooserAccuracy: 0.5,
    keeperBluffSuccess: 0.5,
    personaPerformance: {
      ANALYST: 0.5,
      SHOWBOAT: 0.5,
      NERVOUS: 0.5,
      WILDCARD: 0.5,
    },
    lastEngineVersion: VAULT_BLUFF_ENGINE_VERSION,
    lastPolicyVersion: VAULT_BLUFF_POLICY_VERSION,
  };
}

function blend(previous: number, observed: number): number {
  const decay = FROZEN_POLICY.memoryDecay;
  return previous * decay + observed * (1 - decay);
}

export function updatePlayerMemoryOnce(
  memory: PlayerMemory,
  state: VaultBluffState,
): PlayerMemory {
  if (!state.completed || state.forfeited) return memory;

  const humanChoices = state.rounds
    .filter((round) => round.humanRole === "CHOOSER" && round.choice)
    .map((round) => round.choice);
  const humanResponses = state.rounds
    .filter((round) => round.humanRole === "KEEPER")
    .flatMap((round) => round.responses);
  const questions = state.rounds
    .filter((round) => round.humanRole === "CHOOSER")
    .flatMap((round) => round.questions);
  const chooserRounds = state.rounds.filter((round) => round.humanRole === "CHOOSER");
  const keeperRounds = state.rounds.filter((round) => round.humanRole === "KEEPER");

  const keepRate = humanChoices.length
    ? humanChoices.filter((choice) => choice === "KEEP").length / humanChoices.length
    : 0.5;
  const truthRate = humanResponses.length
    ? humanResponses.filter((response) => response.answer === "YES" || response.answer === "I_SAW_THE_KEY")
        .length / humanResponses.length
    : 0.5;
  const certainRate = humanResponses.length
    ? humanResponses.filter((response) => response.confidence === "CERTAIN").length / humanResponses.length
    : 0.5;
  const averageDuration = humanResponses.length
    ? humanResponses.reduce((total, response) => total + response.durationMs, 0) / humanResponses.length
    : memory.averageDurationMs;
  const chooserAccuracy = chooserRounds.length
    ? chooserRounds.filter((round) => round.winner === "HUMAN").length / chooserRounds.length
    : 0.5;
  const keeperBluffSuccess = keeperRounds.length
    ? keeperRounds.filter((round) => round.winner === "HUMAN").length / keeperRounds.length
    : 0.5;
  const observedQuestions = { ...memory.questionFrequency };
  for (const question of QUESTIONS) {
    observedQuestions[question] = questions.length
      ? questions.filter((asked) => asked === question).length / questions.length
      : 1 / QUESTIONS.length;
  }
  const personaPerformance = {
    ...memory.personaPerformance,
    [state.persona]: blend(memory.personaPerformance[state.persona], state.humanScore > state.botScore ? 1 : 0),
  };

  return {
    completedMatches: memory.completedMatches + 1,
    keepRate: blend(memory.keepRate, keepRate),
    keeperTruthRate: blend(memory.keeperTruthRate, truthRate),
    questionFrequency: {
      KEY_INSIDE_YOUR_CASE: blend(
        memory.questionFrequency.KEY_INSIDE_YOUR_CASE,
        observedQuestions.KEY_INSIDE_YOUR_CASE,
      ),
      WHICH_CASE_SHOULD_I_CHOOSE: blend(
        memory.questionFrequency.WHICH_CASE_SHOULD_I_CHOOSE,
        observedQuestions.WHICH_CASE_SHOULD_I_CHOOSE,
      ),
      WHAT_DID_YOU_SEE: blend(
        memory.questionFrequency.WHAT_DID_YOU_SEE,
        observedQuestions.WHAT_DID_YOU_SEE,
      ),
      ARE_YOU_TELLING_THE_TRUTH: blend(
        memory.questionFrequency.ARE_YOU_TELLING_THE_TRUTH,
        observedQuestions.ARE_YOU_TELLING_THE_TRUTH,
      ),
      SHOULD_I_KEEP_MINE: blend(
        memory.questionFrequency.SHOULD_I_KEEP_MINE,
        observedQuestions.SHOULD_I_KEEP_MINE,
      ),
      HOW_CONFIDENT_ARE_YOU: blend(
        memory.questionFrequency.HOW_CONFIDENT_ARE_YOU,
        observedQuestions.HOW_CONFIDENT_ARE_YOU,
      ),
    },
    confidenceCertainRate: blend(memory.confidenceCertainRate, certainRate),
    averageDurationMs: blend(memory.averageDurationMs, averageDuration),
    chooserAccuracy: blend(memory.chooserAccuracy, chooserAccuracy),
    keeperBluffSuccess: blend(memory.keeperBluffSuccess, keeperBluffSuccess),
    personaPerformance,
    lastEngineVersion: state.engineVersion,
    lastPolicyVersion: state.policyVersion,
  };
}
