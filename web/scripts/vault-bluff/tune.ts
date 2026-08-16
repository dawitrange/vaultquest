import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { FROZEN_POLICY } from "../../src/lib/vault-bluff/policy-config";

const SEARCH = {
  bluffRate: [0.25, 0.4, 0.55, 0.7],
  explorationRate: [0.15, 0.2, 0.25],
  memoryWeight: [0.3, 0.45, 0.6],
  certainRate: [0.35, 0.55, 0.75, 0.85],
  baseDelayMs: [850, 1_150, 1_500, 1_850],
  reversePsychologyRate: [0.15, 0.35, 0.6],
} as const;

function score(candidate: {
  bluffRate: number;
  explorationRate: number;
  memoryWeight: number;
  certainRate: number;
  baseDelayMs: number;
  reversePsychologyRate: number;
}) {
  return (
    Math.abs(candidate.explorationRate - 0.2) * 8 +
    Math.abs(candidate.bluffRate - 0.48) * 1.5 +
    Math.abs(candidate.memoryWeight - 0.45) +
    Math.abs(candidate.certainRate - 0.6) * 0.5 +
    Math.abs(candidate.baseDelayMs - 1_300) / 3_000 +
    Math.abs(candidate.reversePsychologyRate - 0.35) * 0.75
  );
}

async function main() {
  const candidates = [];
  for (const bluffRate of SEARCH.bluffRate)
    for (const explorationRate of SEARCH.explorationRate)
      for (const memoryWeight of SEARCH.memoryWeight)
        for (const certainRate of SEARCH.certainRate)
          for (const baseDelayMs of SEARCH.baseDelayMs)
            for (const reversePsychologyRate of SEARCH.reversePsychologyRate) {
              const candidate = {
                bluffRate,
                explorationRate,
                memoryWeight,
                certainRate,
                baseDelayMs,
                reversePsychologyRate,
              };
              candidates.push({ ...candidate, score: score(candidate) });
            }
  candidates.sort((left, right) => left.score - right.score);
  const report = {
    tuningVersion: "vault-bluff-tuning-v1",
    candidateCount: candidates.length,
    dimensions: SEARCH,
    topCandidates: candidates.slice(0, 20),
    selectedPolicyVersion: FROZEN_POLICY.version,
    selectedFrozenPolicy: FROZEN_POLICY,
    note: "Search report is advisory. Runtime never rewrites the frozen policy.",
  };
  const output = resolve(process.cwd(), "scripts/vault-bluff/tuning-v1.json");
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ output, candidateCount: candidates.length }, null, 2)}\n`);
}

void main();
