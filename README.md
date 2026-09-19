# Windows Folder Manager

Local Windows folder indexer using Node.js, Express, SQLite and PowerShell.

## Install

1. Install Node.js LTS.
2. Open PowerShell in this repository.
3. Run `Set-ExecutionPolicy -Scope Process Bypass`.
4. Run `./scripts/install.ps1`.
5. Run `./scripts/start.ps1`.

Dashboard: http://127.0.0.1:3000

## Scan
Use **Scan Folder** in the dashboard, or run `./scripts/scan.ps1 -Path "D:\Projects"`.

The application indexes metadata only. The SQLite database is created locally at `data/folders.db` and ignored by Git.

## API
GET `/api/health`, `/api/stats`, `/api/folders`; POST `/api/folders`, `/api/scan`; PUT/DELETE `/api/folders/:id`; POST `/api/folders/:id/open`.