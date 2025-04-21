const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const db = require("./src/db");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  const htmlPath = path.join(
    __dirname,
    ".webpack",
    "renderer",
    "main_window.html"
  );
  console.log("Loading HTML from:", htmlPath);
  console.log("File exists:", fs.existsSync(htmlPath));
  win.loadFile(htmlPath);

  win.webContents.openDevTools();
}

// IPC Handlers
ipcMain.handle("get-resumes", () => db.getResumes());
ipcMain.handle("create-resume", (_, tag) => db.createResume(tag));
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
    __dirname,
    "data",
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
ipcMain.handle("download-resume", (_, { filePath, tag }) => {
  const downloadsDir = app.getPath("downloads");
  const dest = path.join(
    downloadsDir,
    `${tag}_resume${path.extname(filePath)}`
  );
  fs.copySync(filePath, dest);
  return dest;
});

ipcMain.handle("delete-resume-download", (_, destPath) => {
  fs.removeSync(destPath);
  return true;
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
