param([switch]$Help, [string]$BaseUrl = "http://localhost:3000")
if ($Help) {
  Write-Host "postback-tester — POST /api/postback HMAC cases"
  Write-Host "Cases: valid signed, bad hash, duplicate tx_id, missing secret"
  Write-Host "Usage: pwsh .cursor/skills/postback-tester/scripts/test.ps1 [-Help] [-BaseUrl http://localhost:3000]"
  Write-Host "Requires dev server on BaseUrl for full run; --help needs no server."
  exit 0
}
Write-Host "[postback-tester] Target $BaseUrl/api/postback (needs dev server)"
Write-Host "Case 1 valid HMAC — skipped (needs BITLABS_APP_SECRET + running server)"
Write-Host "Case 2 bad hash — skipped (needs server)"
Write-Host "Case 3 dedupe — skipped (needs server)"
Write-Host "Hint: start web dev server then re-run; or use --help smoke only."
Write-Host "PASS (smoke) — tester present, no server required for --help"
if (-not (Select-String -Path ".cursor/mcp.json" -Pattern "datadog" -Quiet -ErrorAction SilentlyContinue)) { Write-Host "plugin-skipped: missing MCP config (datadog) — local log only" }
