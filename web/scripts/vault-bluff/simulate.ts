import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { applyCommand, startMatch } from "../../src/lib/vault-bluff/engine";
import { seededUnit } from "../../src/lib/vault-bluff/random";
import {
  APPROVED_ANSWERS,
  PERSONA_IDS,
  type PersonaId,
  type VaultBluffState,
} from "../../src/lib/vault-bluff/types";
import {
  ARCHETYPE_IDS,
  chooserChoice,
  keeperResponse,
  type ArchetypeId,
} from "./archetypes";

const MATCHES_PER_CELL = 250;
const BENCHMARK_SEED = "vault-bluff-benchmark-v1";

type Cell = {
  persona: PersonaId;
  archetype: ArchetypeId;
  matches: number;
  humanWins: number;
  botWins: number;
  ties: number;
  humanPoints: number;
  botPoints: number;
  botResponseDurationMs: number;
  botResponses: number;
};

function play(persona: PersonaId, archetype: ArchetypeId, index: number): VaultBluffState {
  const seed = `${BENCHMARK_SEED}:${persona}:${archetype}:${index}`;
  let state = startMatch({
    seed,
    persona,
    now: "2026-08-16T00:00:00.000Z",
  });
  let tick = 1;
  while (!state.completed) {
    const round = state.rounds.at(-1)!;
    const now = new Date(Date.UTC(2026, 7, 16, 0, 0, tick)).toISOString();
    const roll = seededUnit(seed, tick);
    tick += 1;
    if (round.phase === "KEEPER_INSPECTION") {
      state = applyCommand(state, { kind: "ACK_INSPECTION", now });
    } else if (round.phase === "KEEPER_RESPONSE") {
      const question = round.questions[round.responses.length]!;
      const options = APPROVED_ANSWERS[question];
      const response = keeperResponse({
        archetype,
        question,
        hasKey: round.keyCase === round.humanCase,
        firstApproved: options[0]!,
        secondApproved: options[1],
        roll,
      });
      state = applyCommand(state, { kind: "ANSWER_QUESTION", ...response, now });
    } else if (round.phase === "CHOOSER_QUESTIONING") {
      const question =
        round.questions.length === 0 ? "KEY_INSIDE_YOUR_CASE" : "HOW_CONFIDENT_ARE_YOU";
      state = applyCommand(state, { kind: "ASK_QUESTION", question, now });
    } else if (round.phase === "CHOOSER_DECISION") {
      state = applyCommand(state, {
        kind: "CHOOSE_CASE",
        choice: chooserChoice(archetype, roll, round.responses.at(-1)),
        now,
      });
    } else if (round.phase === "ROUND_REVEAL") {
      state = applyCommand(state, { kind: "NEXT_ROUND", now });
    }
  }
  return state;
}

async function main() {
  const cells: Cell[] = [];
  for (const persona of PERSONA_IDS) {
    for (const archetype of ARCHETYPE_IDS) {
      const cell: Cell = {
        persona,
        archetype,
        matches: MATCHES_PER_CELL,
        humanWins: 0,
        botWins: 0,
        ties: 0,
        humanPoints: 0,
        botPoints: 0,
        botResponseDurationMs: 0,
        botResponses: 0,
      };
      for (let index = 0; index < MATCHES_PER_CELL; index += 1) {
        const state = play(persona, archetype, index);
        cell.humanPoints += state.humanScore;
        cell.botPoints += state.botScore;
        if (state.humanScore > state.botScore) cell.humanWins += 1;
        else if (state.botScore > state.humanScore) cell.botWins += 1;
        else cell.ties += 1;
        for (const response of state.rounds
          .filter((round) => round.humanRole === "CHOOSER")
          .flatMap((round) => round.responses)) {
          cell.botResponseDurationMs += response.durationMs;
          cell.botResponses += 1;
        }
      }
      cells.push(cell);
    }
  }

  const totalMatches = cells.reduce((total, cell) => total + cell.matches, 0);
  const personaSummary = PERSONA_IDS.map((persona) => {
    const rows = cells.filter((cell) => cell.persona === persona);
    const matches = rows.reduce((total, row) => total + row.matches, 0);
    return {
      persona,
      matches,
      botMatchWinRate:
        rows.reduce((total, row) => total + row.botWins, 0) / matches,
      tieRate: rows.reduce((total, row) => total + row.ties, 0) / matches,
      averageBotResponseMs:
        rows.reduce((total, row) => total + row.botResponseDurationMs, 0) /
        rows.reduce((total, row) => total + row.botResponses, 0),
    };
  });
  const benchmark = {
    benchmarkVersion: "vault-bluff-benchmark-v1",
    engineVersion: "vault-bluff-engine-v1",
    policyVersion: "vault-bluff-policy-v1",
    seed: BENCHMARK_SEED,
    matchesPerPersonaArchetype: MATCHES_PER_CELL,
    totalMatches,
    personas: [...PERSONA_IDS],
    archetypes: [...ARCHETYPE_IDS],
    personaSummary,
    cells: cells.map((cell) => ({
      ...cell,
      humanMatchWinRate: cell.humanWins / cell.matches,
      botMatchWinRate: cell.botWins / cell.matches,
      tieRate: cell.ties / cell.matches,
      averageBotResponseMs: cell.botResponseDurationMs / cell.botResponses,
    })),
  };
  const output = resolve(process.cwd(), "scripts/vault-bluff/benchmark-v1.json");
  await writeFile(output, `${JSON.stringify(benchmark, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ output, totalMatches, personaSummary }, null, 2)}\n`);
}

void main();
