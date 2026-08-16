export const VAULT_BLUFF_ENGINE_VERSION = "vault-bluff-engine-v1";
export const VAULT_BLUFF_POLICY_VERSION = "vault-bluff-policy-v1";
export const VAULT_BLUFF_REWARD_POLICY_VERSION = "vault-bluff-reward-v1";

export const PERSONA_IDS = ["ANALYST", "SHOWBOAT", "NERVOUS", "WILDCARD"] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

export const QUESTIONS = [
  "KEY_INSIDE_YOUR_CASE",
  "WHICH_CASE_SHOULD_I_CHOOSE",
  "WHAT_DID_YOU_SEE",
  "ARE_YOU_TELLING_THE_TRUTH",
  "SHOULD_I_KEEP_MINE",
  "HOW_CONFIDENT_ARE_YOU",
] as const;
export type QuestionId = (typeof QUESTIONS)[number];

export const QUESTION_LABELS: Record<QuestionId, string> = {
  KEY_INSIDE_YOUR_CASE: "Is the key inside your case?",
  WHICH_CASE_SHOULD_I_CHOOSE: "Which case should I choose?",
  WHAT_DID_YOU_SEE: "What did you see?",
  ARE_YOU_TELLING_THE_TRUTH: "Are you telling the truth?",
  SHOULD_I_KEEP_MINE: "Should I keep mine?",
  HOW_CONFIDENT_ARE_YOU: "How confident are you?",
};

export type Confidence = "CERTAIN" | "UNSURE" | "GUESSING";
export type Recommendation = "KEEP" | "TAKE";
export type Choice = "KEEP" | "TAKE";
export type Side = "HUMAN" | "BOT";
export type CaseId = "CASE_A" | "CASE_B";

export const APPROVED_ANSWER_IDS = [
  "YES",
  "NO",
  "KEEP_YOURS",
  "TAKE_MINE",
  "I_SAW_THE_KEY",
  "I_SAW_AN_EMPTY_CASE",
  "I_AM_TELLING_THE_TRUTH",
  "I_MIGHT_BE_BLUFFING",
  "KEEP",
  "TAKE",
  "CERTAIN",
  "UNSURE",
  "GUESSING",
] as const;
export type ApprovedAnswer = (typeof APPROVED_ANSWER_IDS)[number];

export const APPROVED_ANSWERS: Record<QuestionId, readonly ApprovedAnswer[]> = {
  KEY_INSIDE_YOUR_CASE: ["YES", "NO"],
  WHICH_CASE_SHOULD_I_CHOOSE: ["KEEP_YOURS", "TAKE_MINE"],
  WHAT_DID_YOU_SEE: ["I_SAW_THE_KEY", "I_SAW_AN_EMPTY_CASE"],
  ARE_YOU_TELLING_THE_TRUTH: ["I_AM_TELLING_THE_TRUTH", "I_MIGHT_BE_BLUFFING"],
  SHOULD_I_KEEP_MINE: ["KEEP", "TAKE"],
  HOW_CONFIDENT_ARE_YOU: ["CERTAIN", "UNSURE", "GUESSING"],
};

export type KeeperResponse = {
  question: QuestionId;
  answer: ApprovedAnswer;
  confidence: Confidence;
  recommendation: Recommendation;
  durationMs: number;
};

export type RoundPhase =
  | "KEEPER_INSPECTION"
  | "CHOOSER_QUESTIONING"
  | "KEEPER_RESPONSE"
  | "CHOOSER_DECISION"
  | "ROUND_REVEAL"
  | "MATCH_COMPLETE";

export type VaultBluffRound = {
  number: number;
  humanRole: "KEEPER" | "CHOOSER";
  humanCase: CaseId;
  botCase: CaseId;
  keyCase: CaseId;
  phase: RoundPhase;
  questions: QuestionId[];
  responses: KeeperResponse[];
  choice: Choice | null;
  winner: Side | null;
  startedAt: string;
  deadlineAt: string;
  resolvedAt: string | null;
};

export type VaultBluffState = {
  engineVersion: typeof VAULT_BLUFF_ENGINE_VERSION;
  policyVersion: typeof VAULT_BLUFF_POLICY_VERSION;
  seed: string;
  rngCursor: number;
  persona: PersonaId;
  rounds: VaultBluffRound[];
  humanScore: number;
  botScore: number;
  completed: boolean;
  forfeited: boolean;
  xpAwarded: number;
};

export type PlayerMemory = {
  completedMatches: number;
  keepRate: number;
  keeperTruthRate: number;
  questionFrequency: Record<QuestionId, number>;
  confidenceCertainRate: number;
  averageDurationMs: number;
  chooserAccuracy: number;
  keeperBluffSuccess: number;
  personaPerformance: Record<PersonaId, number>;
  lastEngineVersion: string;
  lastPolicyVersion: string;
};

export type StartMatchInput = {
  seed: string;
  persona: PersonaId;
  now: string;
};

export type VaultBluffCommand =
  | { kind: "ACK_INSPECTION"; now: string }
  | { kind: "ASK_QUESTION"; question: QuestionId; now: string }
  | {
      kind: "ANSWER_QUESTION";
      answer: ApprovedAnswer;
      confidence: Confidence;
      recommendation: Recommendation;
      now: string;
    }
  | { kind: "CHOOSE_CASE"; choice: Choice; now: string }
  | { kind: "NEXT_ROUND"; now: string }
  | { kind: "FORFEIT"; now: string };

export type SafeRoundDto = Omit<VaultBluffRound, "keyCase"> & {
  keyCase?: CaseId;
  keeperHasKey?: boolean;
};

export type SafeSessionDto = Omit<VaultBluffState, "seed" | "rngCursor" | "rounds"> & {
  rounds: SafeRoundDto[];
  currentRound: SafeRoundDto;
};

export type PublicKeeperView = {
  roundNumber: number;
  persona: PersonaId;
  questions: readonly QuestionId[];
  responses: readonly KeeperResponse[];
};

export class VaultBluffError extends Error {
  constructor(
    readonly code:
      | "ILLEGAL_TRANSITION"
      | "INVALID_COMMAND"
      | "DUPLICATE_QUESTION"
      | "QUESTION_LIMIT"
      | "INVALID_ANSWER"
      | "ROUND_EXPIRED",
    message: string,
  ) {
    super(message);
    this.name = "VaultBluffError";
  }
}
