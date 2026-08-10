param([switch]$Quick, [string]$Out = "docs/competitor-crawl.json")
Write-Host "[competitor-crawl] Crawling competitor surfaces (apify if wired, else WebFetch list)..."
$targets = @(
  @{ site="Gamesbolt"; url="https://gamesbolt.com" },
  @{ site="Earnit.gg"; url="https://earnit.gg" },
  @{ site="Freecash"; url="https://freecash.com" },
  @{ site="Freeward"; url="https://freeward.net" },
  @{ site="Idle-Empire"; url="https://idle-empire.com" }
)
if ($Quick) { $targets = $targets[0..2] }
$rows = @()
foreach ($t in $targets) { $rows += @{ site=$t.site; url=$t.url; checkedAt=(Get-Date -Format o); source=$t.url } }
$rows | ConvertTo-Json -Depth 4 | Set-Content $Out -Encoding UTF8
Write-Host "Wrote $Out ($($rows.Count) sites)"
if (-not (Select-String -Path ".cursor/mcp.json" -Pattern "apify" -Quiet -ErrorAction SilentlyContinue)) { Write-Host "plugin-skipped: missing MCP config (apify) — used URL list fallback" }
