$ErrorActionPreference='Stop'
if(-not(Get-Command node -ErrorAction SilentlyContinue)){throw 'Node.js LTS is required.'}
Set-Location (Split-Path $PSScriptRoot -Parent)
npm install