const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT || 3080);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

function normalize(input) {
  return {
    name: String(input.name || "").trim(),
    path: String(input.path || "").trim(),
    category: String(input.category || "").trim(),
    description: String(input.description || "").trim(),
    tags: String(input.tags || "").trim(),
    file_count: Number(input.file_count || 0),
    folder_count: Number(input.folder_count || 0),
    size_bytes: Number(input.size_bytes || 0)
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "windows-folder-manager" });
});

app.get("/api/folders", (req, res) => {
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();

  let sql = "SELECT * FROM folders WHERE 1=1";
  const params = {};

  if (q) {
    sql += " AND (name LIKE @q OR path LIKE @q OR category LIKE @q OR tags LIKE @q OR description LIKE @q)";
    params.q = "%" + q + "%";
  }
  if (category) {
    sql += " AND category = @category";
    params.category = category;
  }

  sql += " ORDER BY name COLLATE NOCASE";
  res.json(db.prepare(sql).all(params));
});

app.get("/api/categories", (_req, res) => {
  res.json(db.prepare(
    "SELECT category, COUNT(*) AS count FROM folders WHERE category <> '' GROUP BY category ORDER BY category"
  ).all());
});

app.post("/api/folders", (req, res) => {
  const folder = normalize(req.body);
  if (!folder.name || !folder.path) {
    return res.status(400).json({ error: "name and path are required" });
  }

  try {
    const result = db.prepare(`
      INSERT INTO folders
      (name, path, category, description, tags, file_count, folder_count, size_bytes, updated_at)
      VALUES (@name, @path, @category, @description, @tags, @file_count, @folder_count, @size_bytes, CURRENT_TIMESTAMP)
    `).run(folder);
    res.status(201).json(db.prepare("SELECT * FROM folders WHERE id = ?").get(result.lastInsertRowid));
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "A folder with this path already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/folders/:id", (req, res) => {
  const id = Number(req.params.id);
  const folder = normalize(req.body);
  if (!folder.name || !folder.path) {
    return res.status(400).json({ error: "name and path are required" });
  }

  const result = db.prepare(`
    UPDATE folders SET
      name=@name, path=@path, category=@category, description=@description,
      tags=@tags, file_count=@file_count, folder_count=@folder_count,
      size_bytes=@size_bytes, updated_at=CURRENT_TIMESTAMP
    WHERE id=@id
  `).run({ ...folder, id });

  if (!result.changes) return res.status(404).json({ error: "Folder not found" });
  res.json(db.prepare("SELECT * FROM folders WHERE id = ?").get(id));
});

app.delete("/api/folders/:id", (req, res) => {
  const result = db.prepare("DELETE FROM folders WHERE id = ?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Folder not found" });
  res.status(204).end();
});

app.post("/api/scan/upsert", (req, res) => {
  const folder = normalize(req.body);
  if (!folder.name || !folder.path) {
    return res.status(400).json({ error: "name and path are required" });
  }

  const existing = db.prepare("SELECT id FROM folders WHERE path = ?").get(folder.path);

  if (existing) {
    db.prepare(`
      UPDATE folders SET
        name=@name, category=@category, description=@description, tags=@tags,
        file_count=@file_count, folder_count=@folder_count, size_bytes=@size_bytes,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=@id
    `).run({ ...folder, id: existing.id });
  } else {
    db.prepare(`
      INSERT INTO folders
      (name, path, category, description, tags, file_count, folder_count, size_bytes, updated_at)
      VALUES (@name,@path,@category,@description,@tags,@file_count,@folder_count,@size_bytes,CURRENT_TIMESTAMP)
    `).run(folder);
  }

  res.json(db.prepare("SELECT * FROM folders WHERE path = ?").get(folder.path));
});

app.listen(PORT, () => {
  console.log(`Windows Folder Manager running at http://localhost:${PORT}`);
});