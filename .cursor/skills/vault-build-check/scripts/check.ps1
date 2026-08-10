param([switch]$Help, [switch]$Quick)
if ($Help) {
  Write-Host "vault-build-check — Vaultquest local build gate"
  Write-Host "Usage: pwsh .cursor/skills/vault-build-check/scripts/check.ps1 [-Help] [-Quick]"
  Write-Host "  -Help   Show this help (no build)"
  Write-Host "  -Quick  Smoke only: prisma generate --help + next --help"
  Write-Host "  (default) npx prisma generate && npm run build in web/"
  exit 0
}
if ($Quick) {
  Write-Host "[vault-build-check] Quick smoke — checking CLIs are present..."
  Push-Location web
  try {
    npx prisma generate --help | Out-Null; if ($LASTEXITCODE -ne 0) { throw "prisma not found" }
    npx next --help | Out-Null; if ($LASTEXITCODE -ne 0) { throw "next not found" }
    Write-Host "PASS — prisma + next CLIs present"
  } finally { Pop-Location }
  exit 0
}
Write-Host "[vault-build-check] Full build: prisma generate && next build"
Push-Location web
try {
  npx prisma generate
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL — prisma generate"; exit 1 }
  npm run build 2>&1 | Tee-Object -FilePath .vault-build.log
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL — next build"; exit 1 }
  Write-Host "PASS — build succeeded — log web/.vault-build.log"
} finally { Pop-Location }
