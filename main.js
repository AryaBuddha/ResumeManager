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
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

// IPC Handlers: Resumes & Versions
ipcMain.handle("get-resumes", () => db.getResumes());
ipcMain.handle("create-resume", (_, tag) => db.createResume(tag));
ipcMain.handle("get-versions", (_, resumeId) => db.getVersions(resumeId));

ipcMain.handle("select-version-file", async (_, resumeId) => {
  // Open file dialog
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Resume Files", extensions: ["pdf", "tex"] }],
  });
  if (canceled || !filePaths.length) return { canceled: true };

  const srcPath = filePaths[0];
  // Create DB entry with placeholder
  const { lastInsertRowid: versionId } = db.createVersion(resumeId, "", "pdf");

  // Determine destination directory
  const destDir = path.join(
    __dirname,
    "data",
    "resumes",
    String(resumeId),
    String(versionId)
  );
  await fs.ensureDir(destDir);

  // Copy file to destination
  const ext = path.extname(srcPath).toLowerCase();
  const fileName = `resume${ext}`;
  const destPath = path.join(destDir, fileName);
  await fs.copy(srcPath, destPath);

  // Update DB with actual path
  db.updateVersionPath(versionId, destPath);

  return { canceled: false, versionId };
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
