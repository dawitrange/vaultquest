import {
  PERSONA_IDS,
  type Confidence,
  type PersonaId,
  type Recommendation,
} from "./types";

export const PUBLIC_REPLAY_FIELDS = [
  "personaId",
  "personaCueCode",
  "confidence",
  "recommendation",
  "responseDurationBucket",
  "roundPhase",
  "publicContradictionCount",
  "revealedOutcome",
  "botScore",
  "rematchState",
] as const;

export type PublicPersonaCueCode =
  | "MEASURED_READ"
  | "BOLD_READ"
  | "CAUTIOUS_READ"
  | "UNPREDICTABLE_READ";

export type PublicResponseDurationBucket =
  | "BRIEF"
  | "STEADY"
  | "DELIBERATE";

export type PublicRevealedOutcome =
  | "PLAYER_KEEP_WIN"
  | "PLAYER_KEEP_LOSS"
  | "PLAYER_TAKE_WIN"
  | "PLAYER_TAKE_LOSS"
  | "BOT_KEEP_WIN"
  | "BOT_KEEP_LOSS"
  | "BOT_TAKE_WIN"
  | "BOT_TAKE_LOSS";

export type PublicReplayFrame = {
  personaId: PersonaId;
  personaCueCode: PublicPersonaCueCode;
  confidence: Confidence;
  recommendation: Recommendation;
  responseDurationBucket: PublicResponseDurationBucket;
  roundPhase: "ROUND_REVEAL" | "MATCH_COMPLETE";
  publicContradictionCount: number;
  revealedOutcome: PublicRevealedOutcome;
  botScore: number;
  rematchState: "NEW_SESSION_REQUIRED";
};

export type PublicVaultBluffReplay = readonly PublicReplayFrame[];

type ReplayResponseSource = {
  confidence: Confidence;
  recommendation: Recommendation;
  durationMs: number;
};

type ReplayRoundSource = {
  number: number;
  humanRole: "KEEPER" | "CHOOSER";
  phase: "ROUND_REVEAL" | "MATCH_COMPLETE";
  responses: ReplayResponseSource[];
  choice: "KEEP" | "TAKE";
  winner: "HUMAN" | "BOT";
};

const CUE_BY_PERSONA: Record<PersonaId, PublicPersonaCueCode> = {
  ANALYST: "MEASURED_READ",
  SHOWBOAT: "BOLD_READ",
  NERVOUS: "CAUTIOUS_READ",
  WILDCARD: "UNPREDICTABLE_READ",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPersonaId(value: unknown): value is PersonaId {
  return (
    typeof value === "string" &&
    PERSONA_IDS.some((personaId) => personaId === value)
  );
}

function isConfidence(value: unknown): value is Confidence {
  return value === "CERTAIN" || value === "UNSURE" || value === "GUESSING";
}

function isRecommendation(value: unknown): value is Recommendation {
  return value === "KEEP" || value === "TAKE";
}

function isReplayResponseSource(value: unknown): value is ReplayResponseSource {
  return (
    isRecord(value) &&
    isConfidence(value.confidence) &&
    isRecommendation(value.recommendation) &&
    typeof value.durationMs === "number" &&
    Number.isFinite(value.durationMs) &&
    value.durationMs >= 0
  );
}

function replayRoundSource(
  value: unknown,
  index: number,
): ReplayRoundSource | null {
  if (
    !isRecord(value) ||
    value.number !== index + 1 ||
    (value.humanRole !== "KEEPER" && value.humanRole !== "CHOOSER") ||
    (value.phase !== "ROUND_REVEAL" && value.phase !== "MATCH_COMPLETE") ||
    (value.choice !== "KEEP" && value.choice !== "TAKE") ||
    (value.winner !== "HUMAN" && value.winner !== "BOT") ||
    !Array.isArray(value.responses) ||
    value.responses.length !== 2 ||
    !value.responses.every(isReplayResponseSource)
  ) {
    return null;
  }

  return {
    number: value.number,
    humanRole: value.humanRole,
    phase: value.phase,
    responses: value.responses,
    choice: value.choice,
    winner: value.winner,
  };
}

function responseDurationBucket(
  durationMs: number,
): PublicResponseDurationBucket {
  if (durationMs < 1_200) return "BRIEF";
  if (durationMs < 3_500) return "STEADY";
  return "DELIBERATE";
}

function publicContradictionCount(
  responses: readonly ReplayResponseSource[],
): number {
  let count = 0;
  for (let index = 1; index < responses.length; index += 1) {
    if (responses[index]?.recommendation !== responses[index - 1]?.recommendation) {
      count += 1;
    }
  }
  return count;
}

function revealedOutcome(round: ReplayRoundSource): PublicRevealedOutcome {
  const chooser = round.humanRole === "CHOOSER" ? "PLAYER" : "BOT";
  const chooserWon =
    round.winner === (chooser === "PLAYER" ? "HUMAN" : "BOT");

  if (chooser === "PLAYER") {
    if (round.choice === "KEEP") {
      return chooserWon ? "PLAYER_KEEP_WIN" : "PLAYER_KEEP_LOSS";
    }
    return chooserWon ? "PLAYER_TAKE_WIN" : "PLAYER_TAKE_LOSS";
  }
  if (round.choice === "KEEP") {
    return chooserWon ? "BOT_KEEP_WIN" : "BOT_KEEP_LOSS";
  }
  return chooserWon ? "BOT_TAKE_WIN" : "BOT_TAKE_LOSS";
}

export function toPublicVaultBluffReplay(
  value: unknown,
): PublicVaultBluffReplay | null {
  if (
    !isRecord(value) ||
    value.completed !== true ||
    value.forfeited !== false ||
    !isPersonaId(value.persona) ||
    !Array.isArray(value.rounds) ||
    value.rounds.length !== 4 ||
    typeof value.botScore !== "number" ||
    !Number.isInteger(value.botScore)
  ) {
    return null;
  }

  const frames: PublicReplayFrame[] = [];
  let botScore = 0;

  for (let index = 0; index < value.rounds.length; index += 1) {
    const round = replayRoundSource(value.rounds[index], index);
    const expectedPhase = index === value.rounds.length - 1
      ? "MATCH_COMPLETE"
      : "ROUND_REVEAL";
    const expectedHumanRole = index % 2 === 0 ? "KEEPER" : "CHOOSER";
    if (
      !round ||
      round.phase !== expectedPhase ||
      round.humanRole !== expectedHumanRole
    ) {
      return null;
    }

    if (round.winner === "BOT") botScore += 1;
    const response = round.responses.at(-1);
    if (!response) return null;

    frames.push({
      personaId: value.persona,
      personaCueCode: CUE_BY_PERSONA[value.persona],
      confidence: response.confidence,
      recommendation: response.recommendation,
      responseDurationBucket: responseDurationBucket(response.durationMs),
      roundPhase: round.phase,
      publicContradictionCount: publicContradictionCount(round.responses),
      revealedOutcome: revealedOutcome(round),
      botScore,
      rematchState: "NEW_SESSION_REQUIRED",
    });
  }

  return botScore === value.botScore ? frames : null;
}
