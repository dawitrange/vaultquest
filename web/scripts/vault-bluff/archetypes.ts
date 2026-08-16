import type {
  ApprovedAnswer,
  Choice,
  Confidence,
  QuestionId,
  Recommendation,
} from "../../src/lib/vault-bluff/types";

export const ARCHETYPE_IDS = [
  "truth-biased",
  "frequent-liar",
  "always-keep",
  "always-take",
  "confidence-reader",
  "timing-reader",
  "random-beginner",
  "pattern-exploiter",
  "reverse-psychology",
  "adaptive-exploiter",
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export type ArchetypeDecision = {
  answer: ApprovedAnswer;
  confidence: Confidence;
  recommendation: Recommendation;
};

export function chooserChoice(
  archetype: ArchetypeId,
  roll: number,
  latest?: { confidence: Confidence; recommendation: Recommendation; durationMs: number },
): Choice {
  switch (archetype) {
    case "always-keep":
      return "KEEP";
    case "always-take":
      return "TAKE";
    case "confidence-reader":
      return latest?.confidence === "CERTAIN" ? latest.recommendation : "KEEP";
    case "timing-reader":
      return (latest?.durationMs ?? 0) > 1_500 ? "TAKE" : "KEEP";
    case "reverse-psychology":
      return latest?.recommendation === "KEEP" ? "TAKE" : "KEEP";
    case "pattern-exploiter":
    case "adaptive-exploiter":
      return latest?.recommendation ?? (roll < 0.5 ? "KEEP" : "TAKE");
    case "truth-biased":
      return latest?.recommendation ?? "KEEP";
    case "frequent-liar":
      return latest?.recommendation === "KEEP" ? "TAKE" : "KEEP";
    case "random-beginner":
      return roll < 0.5 ? "KEEP" : "TAKE";
    default: {
      const exhaustive: never = archetype;
      return exhaustive;
    }
  }
}

export function keeperResponse(args: {
  archetype: ArchetypeId;
  question: QuestionId;
  hasKey: boolean;
  firstApproved: ApprovedAnswer;
  secondApproved?: ApprovedAnswer;
  roll: number;
}): ArchetypeDecision {
  const lie =
    args.archetype === "frequent-liar" ||
    args.archetype === "reverse-psychology" ||
    (args.archetype === "adaptive-exploiter" && args.roll < 0.55);
  const truthBiased = args.archetype === "truth-biased" || args.roll > 0.35;
  const answer = lie || !truthBiased
    ? (args.secondApproved ?? args.firstApproved)
    : args.firstApproved;
  return {
    answer,
    confidence:
      args.archetype === "confidence-reader"
        ? "CERTAIN"
        : args.roll < 0.33
          ? "GUESSING"
          : "UNSURE",
    recommendation: args.hasKey ? "TAKE" : "KEEP",
  };
}
