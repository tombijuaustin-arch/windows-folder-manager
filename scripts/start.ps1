$root=Split-Path $PSScriptRoot -Parent
Start-Process powershell -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command',"Set-Location '$root'; npm start"
Start-Sleep 2
Start-Process 'http://127.0.0.1:3000'