param(
  [Parameter(Mandatory=$true)]
  [string[]]$Path,
  [string]$Category = ""
)

& "$PSScriptRoot\..\scanner\scan.ps1" -Path $Path -Category $Category