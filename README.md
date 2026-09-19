# Windows Folder Manager

Local Windows folder indexer with SQLite, Express REST API, PowerShell scanner, and browser dashboard.

## Install

Requirements: Node.js 18+ and PowerShell 5.1+ / 7.

```powershell
.\\scripts\\install.ps1
```

## Run

```powershell
.\\scripts\\start.ps1
```

Open http://localhost:3080

## Index folders

```powershell
.\\scripts\\scan.ps1 -Path "D:\\Projects" -Category "Projects"
.\\scripts\\scan.ps1 -Path "D:\\Projects","E:\\Media" -Category "Library"
```

SQLite is created at `data/folders.db` and ignored by Git; folder contents remain local to your Windows machine.