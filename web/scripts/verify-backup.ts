/**
 * verify-backup.ts — DB Guardian smoke check
 * Read-only: counts tables, validates ledger invariants, exits 0 even if DATABASE_URL missing (CI-safe).
 * Usage: npx tsx web/scripts/verify-backup.ts  (or npm run backup:verify)
 */
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "web/.env") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[verify-backup] DATABASE_URL not set — skipping DB checks (build-only mode). PASS (skipped).");
    process.exit(0);
  }
  const { verifyBackup } = await import("../src/lib/backup");
  const result = await verifyBackup();
  console.log("[verify-backup]", JSON.stringify(result, null, 2));
  if (!result.ok) {
    console.error("[verify-backup] FAIL:", result.error);
    process.exit(1);
  }
  // Fail if any table count is unexpectedly zero in prod? Here warn only.
  if (result.counts.ledgerEntries === 0) {
    console.warn("[verify-backup] WARN: ledgerEntries=0 — expected >0 after seed/traffic");
  }
  console.log("[verify-backup] PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
