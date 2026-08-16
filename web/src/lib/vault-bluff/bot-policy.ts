import { policyFor } from "./policy-config";
import { seededPick, seededUnit } from "./random";
import {
  APPROVED_ANSWERS,
  QUESTIONS,
  type ApprovedAnswer,
  type Choice,
  type Confidence,
  type KeeperResponse,
  type PlayerMemory,
  type PublicKeeperView,
  type QuestionId,
  type Recommendation,
} from "./types";

type RandomContext = { seed: string; cursor: number };

function truthfulAnswer(question: QuestionId, keeperHasKey: boolean): ApprovedAnswer {
  switch (question) {
    case "KEY_INSIDE_YOUR_CASE":
      return keeperHasKey ? "YES" : "NO";
    case "WHICH_CASE_SHOULD_I_CHOOSE":
      return keeperHasKey ? "TAKE_MINE" : "KEEP_YOURS";
    case "WHAT_DID_YOU_SEE":
      return keeperHasKey ? "I_SAW_THE_KEY" : "I_SAW_AN_EMPTY_CASE";
    case "ARE_YOU_TELLING_THE_TRUTH":
      return "I_AM_TELLING_THE_TRUTH";
    case "SHOULD_I_KEEP_MINE":
      return keeperHasKey ? "TAKE" : "KEEP";
    case "HOW_CONFIDENT_ARE_YOU":
      return "CERTAIN";
    default: {
      const exhaustive: never = question;
      return exhaustive;
    }
  }
}

function oppositeAnswer(question: QuestionId, answer: ApprovedAnswer): ApprovedAnswer {
  const options = APPROVED_ANSWERS[question];
  return options.find((option) => option !== answer) ?? answer;
}

export class AdaptiveBotPolicy {
  respondAsKeeper(args: {
    question: QuestionId;
    keeperHasKey: boolean;
    memory: PlayerMemory;
    persona: keyof typeof import("./policy-config").FROZEN_POLICY.personas;
    random: RandomContext;
  }): KeeperResponse {
    const policy = policyFor(args.persona);
    const personalized =
      args.memory.completedMatches >= 5
        ? (args.memory.keepRate - 0.5) * policy.memoryWeight
        : 0;
    const exploring = seededUnit(args.random.seed, args.random.cursor) < policy.explorationRate;
    const bluffThreshold = Math.min(0.85, Math.max(0.1, policy.bluffRate + personalized));
    const bluff = exploring
      ? seededUnit(args.random.seed, args.random.cursor + 1) < 0.5
      : seededUnit(args.random.seed, args.random.cursor + 1) < bluffThreshold;
    const truth = truthfulAnswer(args.question, args.keeperHasKey);
    const answer = bluff ? oppositeAnswer(args.question, truth) : truth;
    const confidenceRoll = seededUnit(args.random.seed, args.random.cursor + 2);
    const confidence: Confidence =
      confidenceRoll < policy.certainRate
        ? "CERTAIN"
        : confidenceRoll < (policy.certainRate + 1) / 2
          ? "UNSURE"
          : "GUESSING";
    const reverse = seededUnit(args.random.seed, args.random.cursor + 3) < policy.reversePsychologyRate;
    const recommendation: Recommendation =
      answer === "YES" || answer === "I_SAW_THE_KEY" || answer === "TAKE_MINE"
        ? reverse
          ? "KEEP"
          : "TAKE"
        : reverse
          ? "TAKE"
          : "KEEP";
    const durationMs =
      policy.baseDelayMs +
      Math.floor(seededUnit(args.random.seed, args.random.cursor + 4) * policy.delayJitterMs);
    return { question: args.question, answer, confidence, recommendation, durationMs };
  }

  questionsAsChooser(args: {
    view: PublicKeeperView;
    memory: PlayerMemory;
    random: RandomContext;
  }): readonly [QuestionId, QuestionId] {
    const available = QUESTIONS.filter((question) => !args.view.questions.includes(question));
    const first = seededPick(available, args.random.seed, args.random.cursor);
    const second = seededPick(
      available.filter((question) => question !== first),
      args.random.seed,
      args.random.cursor + 1,
    );
    return [first, second];
  }

  chooseAsChooser(args: {
    view: PublicKeeperView;
    memory: PlayerMemory;
    random: RandomContext;
  }): Choice {
    const policy = policyFor(args.view.persona);
    if (seededUnit(args.random.seed, args.random.cursor) < policy.explorationRate) {
      return seededUnit(args.random.seed, args.random.cursor + 1) < 0.5 ? "KEEP" : "TAKE";
    }
    const latest = args.view.responses.at(-1);
    if (!latest) return args.memory.keepRate >= 0.5 ? "TAKE" : "KEEP";
    const trustRecommendation =
      latest.confidence === "CERTAIN" ? 0.62 : latest.confidence === "UNSURE" ? 0.48 : 0.4;
    return seededUnit(args.random.seed, args.random.cursor + 1) < trustRecommendation
      ? latest.recommendation
      : latest.recommendation === "KEEP"
        ? "TAKE"
        : "KEEP";
  }
}
