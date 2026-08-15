param(
  [switch]$Help,
  [switch]$ProbeProd,
  [switch]$SeedLocal,
  [string]$BaseUrl = "http://localhost:3000"
)
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")
Set-Location $Root

if ($Help) {
  Write-Host "postback-tester — HMAC + click → pending VP smoke (issue #15)"
  Write-Host "Cases: offline HMAC, prod probe (no secrets), optional localhost live credit"
  Write-Host "Usage: pwsh .cursor/skills/postback-tester/scripts/test.ps1 [-Help] [-ProbeProd] [-SeedLocal] [-BaseUrl http://localhost:3000]"
  Write-Host "Env names (never commit values): POSTBACK_SECRET, BITLABS_APP_SECRET or AYET_HMAC_SECRET, CPX_SECURE_HASH, DATABASE_URL"
  Write-Host "Never sends secrets to vaultquest.io. --help needs no server."
  if (Test-Path "web/scripts/postback-smoke.ts") {
    Push-Location web
    npx tsx scripts/postback-smoke.ts --help
    Pop-Location
  }
  exit 0
}

if (-not (Select-String -Path ".cursor/mcp.json" -Pattern "datadog" -Quiet -ErrorAction SilentlyContinue)) {
  Write-Host "plugin-skipped: missing MCP config (datadog) — local log only"
}

$argsList = @()
if ($ProbeProd) { $argsList += "--probe-prod" }
if ($SeedLocal) { $argsList += "--seed-local" }
if ($BaseUrl) { $argsList += @("--base-url", $BaseUrl) }

Write-Host "[postback-tester] running web/scripts/postback-smoke.ts $($argsList -join ' ')"
Push-Location web
try {
  npx tsx scripts/postback-smoke.ts @argsList
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
