param([string]$Local = "", [string]$Out = "docs/site-audit.json", [switch]$Quick)
$base = if ($Local) { $Local.TrimEnd("/") } else { "https://vaultquest.io" }
Write-Host "[site-audit] Auditing $base ..."
$paths = @("/", "/about", "/how-it-works", "/earn", "/rewards", "/giveaways", "/proof", "/terms", "/privacy", "/contact")
if ($Quick) { $paths = @("/", "/about", "/proof", "/earn") }
$rows = @()
foreach ($p in $paths) {
  $url = "$base$p"
  $status = "WARN"; $note = "fetch skipped (use WebFetch in agent turn)"
  try { $r = Invoke-WebRequest -Uri $url -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop; $status = if ($r.StatusCode -eq 200) { "PASS" } else { "FAIL" }; $note = "HTTP $($r.StatusCode)" } catch { $note = $_.Exception.Message.Substring(0,[Math]::Min(120,$_.Exception.Message.Length)) }
  $rows += @{ url=$url; status=$status; note=$note; checkedAt=(Get-Date -Format o) }
}
$rows | ConvertTo-Json -Depth 4 | Set-Content $Out -Encoding UTF8
Write-Host "Wrote $Out"
$rows | ForEach-Object { Write-Host "$($_.status) $($_.url) — $($_.note)" }
if (-not (Select-String -Path ".cursor/mcp.json" -Pattern "apify" -Quiet -ErrorAction SilentlyContinue)) { Write-Host "plugin-skipped: missing MCP config (apify) — used Invoke-WebRequest" }
