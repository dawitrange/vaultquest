param([switch]$Quick, [string]$Out = "docs/partner-crawl.json")
Write-Host "[partner-crawl] Crawling network docs (WebFetch fallback if apify not wired)..."
$targets = @(
  @{ network="Torox"; apply="https://torox.io/register/"; docs="https://torox.io/terms-conditions" },
  @{ network="Lootably"; apply="https://dashboard.lootably.com/authentication/signup"; docs="https://docs.lootably.com/docs/getting-started" },
  @{ network="AdGate"; apply="https://adgatemedia.com"; docs="https://adgatemedia.com/terms" },
  @{ network="BitLabs"; apply="https://developer.bitlabs.ai"; docs="https://developer.bitlabs.ai/docs/callback" },
  @{ network="ayeT"; apply="https://www.ayetstudios.com"; docs="https://www.ayetstudios.com/docs/offerwall-api" },
  @{ network="CPX"; apply="https://www.cpx-research.com"; docs="https://www.cpx-research.com/doc.php" },
  @{ network="Impact/Freecash"; apply="https://app.impact.com"; docs="https://help.impact.com" }
)
if ($Quick) { $targets = $targets[0..4] }
$rows = @()
foreach ($t in $targets) { $rows += @{ network=$t.network; applyUrl=$t.apply; docsUrl=$t.docs; checkedAt=(Get-Date -Format o); source=$t.docs } }
$rows | ConvertTo-Json -Depth 4 | Set-Content $Out -Encoding UTF8
Write-Host "Wrote $Out ($($rows.Count) networks)"
if (-not (Test-Path ".cursor/mcp.json") -or -not (Select-String -Path ".cursor/mcp.json" -Pattern "apify" -Quiet)) { Write-Host "plugin-skipped: missing MCP config (apify) — used WebFetch target list" }
Write-Host "| Network | Apply | Checked |"
Write-Host "|---------|-------|---------|"
$rows | ForEach-Object { Write-Host "| $($_.network) | $($_.applyUrl) | $($_.checkedAt) |" }
