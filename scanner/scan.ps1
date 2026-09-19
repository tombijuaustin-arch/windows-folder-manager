param([string]$Path,[string]$Api)
$ErrorActionPreference='Stop'
if(-not(Test-Path -LiteralPath $Path -PathType Container)){throw 'Folder does not exist'}
$files=0;$folders=0;[Int64]$size=0
Get-ChildItem -LiteralPath $Path -File -Force -Recurse -ErrorAction SilentlyContinue|ForEach-Object{$files++;$size+=[Int64]$_.Length}
Get-ChildItem -LiteralPath $Path -Directory -Force -Recurse -ErrorAction SilentlyContinue|ForEach-Object{$folders++}
$clean=$Path.TrimEnd('\')
$payload=@{name=(Split-Path -Leaf $clean);path=$Path;category='';description='';tags=@();file_count=$files;folder_count=$folders;size_bytes=$size}|ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri $Api -Method Post -ContentType 'application/json' -Body $payload|Out-Null
Write-Host "Indexed $Path"