const $ = (id) => document.getElementById(id);
const state = { folders: [], editId: null };

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function bytes(n) {
  n = Number(n || 0);
  const units = ["B","KB","MB","GB","TB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return n.toFixed(i ? 1 : 0) + " " + units[i];
}

function renderStats() {
  const totalFiles = state.folders.reduce((a, x) => a + Number(x.file_count || 0), 0);
  const totalBytes = state.folders.reduce((a, x) => a + Number(x.size_bytes || 0), 0);
  $("stats").innerHTML = [
    ["Folders", state.folders.length],
    ["Indexed files", totalFiles.toLocaleString()],
    ["Indexed size", bytes(totalBytes)]
  ].map(([label, value]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join("");
}

function render() {
  renderStats();
  const list = $("list");
  if (!state.folders.length) {
    list.innerHTML = '<div class="empty">No folders found. Add one manually or run the Windows scanner.</div>';
    return;
  }
  list.innerHTML = state.folders.map(f => `
    <article class="card">
      <div class="cardTop">
        <h3>📁 ${escapeHtml(f.name)}</h3>
        ${f.category ? `<span class="badge">${escapeHtml(f.category)}</span>` : ""}
      </div>
      <div class="path">${escapeHtml(f.path)}</div>
      <div class="meta">${escapeHtml(f.description || "No description")}<br>
        ${Number(f.file_count || 0).toLocaleString()} files · ${Number(f.folder_count || 0).toLocaleString()} folders · ${bytes(f.size_bytes)}
      </div>
      ${f.tags ? `<div class="meta"># ${escapeHtml(f.tags)}</div>` : ""}
      <div class="cardActions">
        <button onclick="openFolder(${JSON.stringify(f.path)})">Open</button>
        <button onclick="editFolder(${f.id})">Edit</button>
        <button class="danger" onclick="deleteFolder(${f.id})">Delete</button>
      </div>
    </article>
  `).join("");
}

async function loadCategories() {
  const categories = await fetch("/api/categories").then(r => r.json());
  $("category").innerHTML = '<option value="">All categories</option>' +
    categories.map(c => `<option value="${escapeHtml(c.category)}">${escapeHtml(c.category)} (${c.count})</option>`).join("");
}

async function load() {
  const params = new URLSearchParams();
  if ($("search").value.trim()) params.set("q", $("search").value.trim());
  if ($("category").value) params.set("category", $("category").value);

  state.folders = await fetch("/api/folders?" + params.toString()).then(r => r.json());
  render();
}

function openFolder(path) {
  window.location.href = "file:///" + path.replaceAll("\\", "/");
}

function resetForm() {
  state.editId = null;
  $("dialogTitle").textContent = "Add Folder";
  $("folderForm").reset();
  $("file_count").value = 0; $("folder_count").value = 0; $("size_bytes").value = 0;
}

function editFolder(id) {
  const f = state.folders.find(x => x.id === id);
  if (!f) return;
  state.editId = id;
  $("dialogTitle").textContent = "Edit Folder";
  $("name").value = f.name;
  $("path").value = f.path;
  $("cat").value = f.category || "";
  $("tags").value = f.tags || "";
  $("description").value = f.description || "";
  $("file_count").value = f.file_count || 0;
  $("folder_count").value = f.folder_count || 0;
  $("size_bytes").value = f.size_bytes || 0;
  $("dialog").showModal();
}

async function save(event) {
  event.preventDefault();
  const payload = {
    name: $("name").value,
    path: $("path").value,
    category: $("cat").value,
    tags: $("tags").value,
    description: $("description").value,
    file_count: Number($("file_count").value || 0),
    folder_count: Number($("folder_count").value || 0),
    size_bytes: Number($("size_bytes").value || 0)
  };
  const url = state.editId ? "/api/folders/" + state.editId : "/api/folders";
  const method = state.editId ? "PUT" : "POST";
  const response = await fetch(url, { method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
  if (!response.ok) return alert((await response.json()).error || "Could not save");
  $("dialog").close();
  await loadCategories();
  await load();
}

async function deleteFolder(id) {
  if (!confirm("Delete this folder entry from the database?")) return;
  await fetch("/api/folders/" + id, { method: "DELETE" });
  await loadCategories();
  await load();
}

$("newFolderBtn").onclick = () => { resetForm(); $("dialog").showModal(); };
$("refreshBtn").onclick = load;
$("search").oninput = load;
$("category").onchange = load;
$("folderForm").onsubmit = save;

loadCategories().then(load);