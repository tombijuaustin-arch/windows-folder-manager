$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$true)]
  [string[]]$Path,

  [string]$ApiUrl = "http://localhost:3080/api/scan/upsert",

  [string]$Category = ""
)

function Get-FolderStats {
  param([string]$Root)

  if (!(Test-Path -LiteralPath $Root -PathType Container)) {
    throw "Folder does not exist: $Root"
  }

  $files = Get-ChildItem -LiteralPath $Root -File -Recurse -Force -ErrorAction SilentlyContinue
  $folders = Get-ChildItem -LiteralPath $Root -Directory -Recurse -Force -ErrorAction SilentlyContinue

  $size = 0L
  foreach ($file in $files) { $size += [int64]$file.Length }

  [pscustomobject]@{
    name = (Split-Path $Root -Leaf)
    path = (Resolve-Path -LiteralPath $Root).Path
    category = $Category
    description = ""
    tags = ""
    file_count = @($files).Count
    folder_count = @($folders).Count
    size_bytes = $size
  }
}

foreach ($root in $Path) {
  Write-Host "Scanning: $root"
  $payload = Get-FolderStats -Root $root | ConvertTo-Json -Depth 5
  $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -ContentType "application/json" -Body $payload
  Write-Host ("Indexed: {0} | files={1} | folders={2}" -f $response.path, $response.file_count, $response.folder_count)
}