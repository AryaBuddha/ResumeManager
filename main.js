// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const Store = require("electron-store");
const db = require("./src/db");
const Database = require("better-sqlite3");

// Configuration store
const store = new Store({
  defaults: {
    dataPath: path.join(__dirname, "data"),
    defaultPrefix: "Aryadeep_Buddha",
  },
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:9090");
  } else {
    win.loadFile(
      path.join(__dirname, ".webpack", "renderer", "main_window.html")
    );
  }
}

// Settings IPC
ipcMain.handle("get-settings", () => ({
  dataPath: store.get("dataPath"),
  defaultPrefix: store.get("defaultPrefix"),
}));
ipcMain.handle("set-setting", (_, key, value) => {
  store.set(key, value);
  return store.get(key);
});
ipcMain.handle("select-data-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled || !filePaths.length) return { canceled: true };
  store.set("dataPath", filePaths[0]);
  return { canceled: false, path: filePaths[0] };
});

// Resumes & Versions
ipcMain.handle("get-resumes", () => db.getResumes());
ipcMain.handle("create-resume", (_, tag) => db.createResume(tag));
ipcMain.handle("delete-resume", async (_, resumeId) => {
  const metadataDb = new Database(
    path.join(store.get("dataPath"), "metadata.db")
  );
  metadataDb
    .prepare(
      "DELETE FROM cover_letters WHERE application_id IN (" +
        "SELECT id FROM applications WHERE version_id IN (" +
        "SELECT id FROM resume_versions WHERE resume_id=?))"
    )
    .run(resumeId);
  metadataDb
    .prepare(
      "DELETE FROM applications WHERE version_id IN (" +
        "SELECT id FROM resume_versions WHERE resume_id=?)"
    )
    .run(resumeId);
  metadataDb
    .prepare(
      "DELETE FROM notes WHERE version_id IN (" +
        "SELECT id FROM resume_versions WHERE resume_id=?)"
    )
    .run(resumeId);
  metadataDb
    .prepare("DELETE FROM resume_versions WHERE resume_id=?")
    .run(resumeId);
  metadataDb.prepare("DELETE FROM resumes WHERE id=?").run(resumeId);
  metadataDb.close();
  await fs.remove(
    path.join(store.get("dataPath"), "resumes", String(resumeId))
  );
  return true;
});

ipcMain.handle("get-versions", (_, resumeId) => db.getVersions(resumeId));
ipcMain.handle("select-version-file", async (_, resumeId) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Resumes", extensions: ["pdf", "tex"] }],
  });
  if (canceled || !filePaths.length) return { canceled: true };
  const src = filePaths[0];
  const sourceType = src.toLowerCase().endsWith(".tex") ? "latex" : "pdf";
  const { lastInsertRowid: versionId } = db.createVersion(
    resumeId,
    "",
    sourceType
  );
  const destDir = path.join(
    store.get("dataPath"),
    "resumes",
    String(resumeId),
    String(versionId)
  );
  await fs.ensureDir(destDir);
  const ext = path.extname(src);
  const dest = path.join(destDir, `resume${ext}`);
  await fs.copy(src, dest);
  db.updateVersionPath(versionId, dest);
  return { canceled: false, versionId };
});

ipcMain.handle("delete-version", async (_, resumeId, versionId) => {
  const metadataDb = new Database(
    path.join(store.get("dataPath"), "metadata.db")
  );
  metadataDb
    .prepare(
      "DELETE FROM cover_letters WHERE application_id IN (SELECT id FROM applications WHERE version_id=?)"
    )
    .run(versionId);
  metadataDb
    .prepare("DELETE FROM applications WHERE version_id=?")
    .run(versionId);
  metadataDb.prepare("DELETE FROM notes WHERE version_id=?").run(versionId);
  metadataDb.prepare("DELETE FROM resume_versions WHERE id=?").run(versionId);
  metadataDb.close();
  const versions = db.getVersions(resumeId);
  const v = versions.find((x) => x.id === versionId);
  if (v) await fs.remove(path.dirname(v.file_path));
  return true;
});

// Notes
ipcMain.handle("get-notes", (_, resumeId) => db.getNotesByResume(resumeId));
ipcMain.handle("add-note", (_, resumeId, content) =>
  db.createNoteForResume(resumeId, content)
);
ipcMain.handle("delete-note", async (_, noteId) => {
  const metadataDb = new Database(
    path.join(store.get("dataPath"), "metadata.db")
  );
  metadataDb.prepare("DELETE FROM notes WHERE id=?").run(noteId);
  metadataDb.close();
  return true;
});

// Applications
ipcMain.handle("get-applications", (_, resumeId) =>
  db.getApplicationsByResume(resumeId)
);
ipcMain.handle("add-application", (_, resumeId, companyName) =>
  db.createApplicationForResume(resumeId, companyName)
);

// Cover Letters
ipcMain.handle("get-cover-letters", (_, applicationId) =>
  db.getCoverLetters(applicationId)
);
ipcMain.handle("select-cover-letter-file", async (_, applicationId) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Cover Letters", extensions: ["pdf", "txt"] }],
  });
  if (canceled || !filePaths.length) return { canceled: true };
  const src = filePaths[0];
  const { lastInsertRowid: letterId } = db.createCoverLetterFile(
    applicationId,
    ""
  );
  const destDir = path.join(store.get("dataPath"), "cover_letters");
  await fs.ensureDir(destDir);
  const ext = path.extname(src);
  const dest = path.join(destDir, `${letterId}${ext}`);
  await fs.copy(src, dest);
  db.updateCoverLetterPath(letterId, dest);
  return { canceled: false, letterId };
});
ipcMain.handle("add-cover-letter-text", (_, applicationId, text) =>
  db.createCoverLetterText(applicationId, text)
);
ipcMain.handle("delete-cover-letter", async (_, letterId) => {
  const metadataDb = new Database(
    path.join(store.get("dataPath"), "metadata.db")
  );
  metadataDb.prepare("DELETE FROM cover_letters WHERE id=?").run(letterId);
  metadataDb.close();
  return true;
});

// Download/Cleanup
ipcMain.handle("download-resume", async (_, resumeId) => {
  const latest = db.getLatestVersion(resumeId);
  if (!latest) throw new Error("No versions found");
  const filePath = latest.file_path;
  const downloadsDir = app.getPath("downloads");
  const ext = path.extname(filePath);
  const prefix = store.get("defaultPrefix");
  const dest = path.join(downloadsDir, `${prefix}${ext}`);
  await fs.copy(filePath, dest);
  return dest;
});
ipcMain.handle("delete-resume-download", (_, destPath) => {
  fs.removeSync(destPath);
  return true;
});

// App lifecycle
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
