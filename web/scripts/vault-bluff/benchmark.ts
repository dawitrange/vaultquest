import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PERSONA_IDS } from "../../src/lib/vault-bluff/types";
import { ARCHETYPE_IDS } from "./archetypes";

async function main() {
  const file = resolve(process.cwd(), "scripts/vault-bluff/benchmark-v1.json");
  const benchmark: unknown = JSON.parse(await readFile(file, "utf8"));
  assert.ok(benchmark && typeof benchmark === "object");
  assert.ok("totalMatches" in benchmark && typeof benchmark.totalMatches === "number");
  assert.ok(benchmark.totalMatches >= 10_000);
  assert.ok("cells" in benchmark && Array.isArray(benchmark.cells));
  for (const persona of PERSONA_IDS) {
    for (const archetype of ARCHETYPE_IDS) {
      assert.ok(
        benchmark.cells.some(
          (cell) =>
            cell &&
            typeof cell === "object" &&
            "persona" in cell &&
            "archetype" in cell &&
            cell.persona === persona &&
            cell.archetype === archetype,
        ),
        `Missing ${persona} x ${archetype}`,
      );
    }
  }
  process.stdout.write(
    `PASS ${benchmark.totalMatches} seeded matches across ${benchmark.cells.length} persona/archetype cells\n`,
  );
}

void main();
