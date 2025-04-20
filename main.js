const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
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

// IPC Handlers
ipcMain.handle("get-resumes", () => db.getResumes());
ipcMain.handle("create-resume", (_, tag) => db.createResume(tag));
ipcMain.handle("get-versions", (_, resumeId) => db.getVersions(resumeId));
ipcMain.handle("create-version", (_, resumeId, filePath, sourceType) =>
  db.createVersion(resumeId, filePath, sourceType)
);
// TODO: handlers for notes, applications, cover letters

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
