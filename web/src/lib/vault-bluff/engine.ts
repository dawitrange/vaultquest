import { AdaptiveBotPolicy } from "./bot-policy";
import { neutralPlayerMemory } from "./player-memory";
import { seededUnit } from "./random";
import {
  APPROVED_ANSWERS,
  VAULT_BLUFF_ENGINE_VERSION,
  VAULT_BLUFF_POLICY_VERSION,
  type CaseId,
  type PlayerMemory,
  type PublicKeeperView,
  type SafeRoundDto,
  type SafeSessionDto,
  type StartMatchInput,
  type VaultBluffCommand,
  type VaultBluffRound,
  type VaultBluffState,
  VaultBluffError,
} from "./types";

const bot = new AdaptiveBotPolicy();

function createRound(state: Pick<VaultBluffState, "seed" | "rngCursor">, number: number, now: string) {
  const keyCase: CaseId =
    seededUnit(state.seed, state.rngCursor) < 0.5 ? "CASE_A" : "CASE_B";
  const deadlineAt = new Date(Date.parse(now) + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    number,
    humanRole: number % 2 === 1 ? "KEEPER" : "CHOOSER",
    humanCase: "CASE_A",
    botCase: "CASE_B",
    keyCase,
    phase: number % 2 === 1 ? "KEEPER_INSPECTION" : "CHOOSER_QUESTIONING",
    questions: [],
    responses: [],
    choice: null,
    winner: null,
    startedAt: now,
    deadlineAt,
    resolvedAt: null,
  } satisfies VaultBluffRound;
}

export function startMatch(input: StartMatchInput): VaultBluffState {
  const base = {
    engineVersion: VAULT_BLUFF_ENGINE_VERSION,
    policyVersion: VAULT_BLUFF_POLICY_VERSION,
    seed: input.seed,
    rngCursor: 0,
    persona: input.persona,
    rounds: [],
    humanScore: 0,
    botScore: 0,
    completed: false,
    forfeited: false,
    xpAwarded: 0,
  } satisfies VaultBluffState;
  return { ...base, rngCursor: 1, rounds: [createRound(base, 1, input.now)] };
}

function currentRound(state: VaultBluffState): VaultBluffRound {
  const round = state.rounds.at(-1);
  if (!round) throw new VaultBluffError("INVALID_COMMAND", "Match has no active round");
  return round;
}

function chooserView(state: VaultBluffState, round: VaultBluffRound): PublicKeeperView {
  return {
    roundNumber: round.number,
    persona: state.persona,
    questions: round.questions,
    responses: round.responses,
  };
}

function resolveRound(state: VaultBluffState, round: VaultBluffRound, now: string): void {
  if (!round.choice) throw new VaultBluffError("INVALID_COMMAND", "A choice is required");
  const chooserIsHuman = round.humanRole === "CHOOSER";
  const chooserCase = chooserIsHuman
    ? round.choice === "KEEP"
      ? round.humanCase
      : round.botCase
    : round.choice === "KEEP"
      ? round.botCase
      : round.humanCase;
  const chooserWon = chooserCase === round.keyCase;
  round.winner = chooserWon
    ? chooserIsHuman
      ? "HUMAN"
      : "BOT"
    : chooserIsHuman
      ? "BOT"
      : "HUMAN";
  round.phase = "ROUND_REVEAL";
  round.resolvedAt = now;
  if (round.winner === "HUMAN") state.humanScore += 1;
  else state.botScore += 1;
}

function requirePhase(round: VaultBluffRound, phase: VaultBluffRound["phase"]) {
  if (round.phase !== phase) {
    throw new VaultBluffError(
      "ILLEGAL_TRANSITION",
      `Action is not allowed during ${round.phase}`,
    );
  }
}

export function applyCommand(
  original: VaultBluffState,
  command: VaultBluffCommand,
  memory: PlayerMemory = neutralPlayerMemory(),
): VaultBluffState {
  const state = structuredClone(original);
  const round = currentRound(state);
  if (state.completed) {
    throw new VaultBluffError("ILLEGAL_TRANSITION", "Match is already complete");
  }
  if (command.kind !== "FORFEIT" && Date.parse(command.now) > Date.parse(round.deadlineAt)) {
    throw new VaultBluffError(
      "ROUND_EXPIRED",
      "This round expired. Forfeit it and start a new match",
    );
  }

  switch (command.kind) {
    case "ACK_INSPECTION": {
      requirePhase(round, "KEEPER_INSPECTION");
      const questions = bot.questionsAsChooser({
        view: chooserView(state, round),
        memory,
        random: { seed: state.seed, cursor: state.rngCursor },
      });
      round.questions.push(...questions);
      round.phase = "KEEPER_RESPONSE";
      state.rngCursor += 2;
      break;
    }
    case "ASK_QUESTION": {
      requirePhase(round, "CHOOSER_QUESTIONING");
      if (round.questions.includes(command.question)) {
        throw new VaultBluffError("DUPLICATE_QUESTION", "Ask two different questions");
      }
      if (round.questions.length >= 2) {
        throw new VaultBluffError("QUESTION_LIMIT", "Only two questions are allowed");
      }
      round.questions.push(command.question);
      round.responses.push(
        bot.respondAsKeeper({
          question: command.question,
          keeperHasKey: round.keyCase === round.botCase,
          memory,
          persona: state.persona,
          random: { seed: state.seed, cursor: state.rngCursor },
        }),
      );
      state.rngCursor += 5;
      if (round.questions.length === 2) round.phase = "CHOOSER_DECISION";
      break;
    }
    case "ANSWER_QUESTION": {
      requirePhase(round, "KEEPER_RESPONSE");
      const question = round.questions[round.responses.length];
      if (!question) {
        throw new VaultBluffError("QUESTION_LIMIT", "All questions are answered");
      }
      if (!APPROVED_ANSWERS[question].includes(command.answer)) {
        throw new VaultBluffError("INVALID_ANSWER", "Answer is not valid for this question");
      }
      const started = Date.parse(round.startedAt);
      const answered = Date.parse(command.now);
      round.responses.push({
        question,
        answer: command.answer,
        confidence: command.confidence,
        recommendation: command.recommendation,
        durationMs: Math.max(250, Math.min(30_000, answered - started)),
      });
      if (round.responses.length === 2) {
        round.phase = "CHOOSER_DECISION";
        round.choice = bot.chooseAsChooser({
          view: chooserView(state, round),
          memory,
          random: { seed: state.seed, cursor: state.rngCursor },
        });
        state.rngCursor += 2;
        resolveRound(state, round, command.now);
      }
      break;
    }
    case "CHOOSE_CASE": {
      requirePhase(round, "CHOOSER_DECISION");
      if (round.humanRole !== "CHOOSER") {
        throw new VaultBluffError("INVALID_COMMAND", "The bot owns this choice");
      }
      round.choice = command.choice;
      resolveRound(state, round, command.now);
      break;
    }
    case "NEXT_ROUND": {
      requirePhase(round, "ROUND_REVEAL");
      if (round.number === 4) {
        state.completed = true;
        round.phase = "MATCH_COMPLETE";
        state.xpAwarded =
          80 + state.humanScore * 10 + (state.humanScore > state.botScore ? 20 : 0);
      } else {
        state.rounds.push(createRound(state, round.number + 1, command.now));
        state.rngCursor += 1;
      }
      break;
    }
    case "FORFEIT": {
      state.completed = true;
      state.forfeited = true;
      state.xpAwarded = 0;
      round.phase = "MATCH_COMPLETE";
      break;
    }
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
  return state;
}

function safeRound(round: VaultBluffRound, isCurrent: boolean): SafeRoundDto {
  const revealed = round.phase === "ROUND_REVEAL" || round.phase === "MATCH_COMPLETE";
  const dto: SafeRoundDto = {
    number: round.number,
    humanRole: round.humanRole,
    humanCase: round.humanCase,
    botCase: round.botCase,
    phase: round.phase,
    questions: round.questions,
    responses: round.responses,
    choice: round.choice,
    winner: round.winner,
    startedAt: round.startedAt,
    deadlineAt: round.deadlineAt,
    resolvedAt: round.resolvedAt,
  };
  if (revealed) dto.keyCase = round.keyCase;
  if (
    isCurrent &&
    round.humanRole === "KEEPER" &&
    round.phase === "KEEPER_INSPECTION"
  ) {
    dto.keeperHasKey = round.keyCase === round.humanCase;
  }
  return dto;
}

export function toSafeSessionDto(state: VaultBluffState): SafeSessionDto {
  const rounds = state.rounds.map((round, index) =>
    safeRound(round, index === state.rounds.length - 1),
  );
  const current = rounds.at(-1);
  if (!current) throw new VaultBluffError("INVALID_COMMAND", "Match has no round");
  return {
    engineVersion: state.engineVersion,
    policyVersion: state.policyVersion,
    persona: state.persona,
    rounds,
    currentRound: current,
    humanScore: state.humanScore,
    botScore: state.botScore,
    completed: state.completed,
    forfeited: state.forfeited,
    xpAwarded: state.xpAwarded,
  };
}
