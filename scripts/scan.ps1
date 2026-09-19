param([Parameter(Mandatory=$true)][string]$Path)
$root=Split-Path $PSScriptRoot -Parent
powershell -NoProfile -ExecutionPolicy Bypass -File "$root\scanner\scan.ps1" -Path $Path -Api 'http://127.0.0.1:3000/api/folders/upsert'