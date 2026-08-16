import {
  APPROVED_ANSWER_IDS,
  type ApprovedAnswer,
  type Confidence,
  type Recommendation,
} from "./types";

export type KeeperResponseDraft = {
  answer: ApprovedAnswer;
  confidence: Confidence;
  recommendation: Recommendation;
};

function isApprovedAnswer(value: FormDataEntryValue | null): value is ApprovedAnswer {
  return (
    typeof value === "string" &&
    APPROVED_ANSWER_IDS.some((answerId) => answerId === value)
  );
}

function isConfidence(value: FormDataEntryValue | null): value is Confidence {
  return value === "CERTAIN" || value === "UNSURE" || value === "GUESSING";
}

function isRecommendation(
  value: FormDataEntryValue | null,
): value is Recommendation {
  return value === "KEEP" || value === "TAKE";
}

export function parseKeeperResponseForm(
  formData: FormData,
): KeeperResponseDraft | null {
  const answer = formData.get("answer");
  const confidence = formData.get("confidence");
  const recommendation = formData.get("recommendation");
  if (
    !isApprovedAnswer(answer) ||
    !isConfidence(confidence) ||
    !isRecommendation(recommendation)
  ) {
    return null;
  }
  return { answer, confidence, recommendation };
}
