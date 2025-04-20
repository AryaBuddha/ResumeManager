const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs-extra");
const dbPath = path.join(__dirname, "../data/metadata.db");
fs.ensureFileSync(dbPath);
const db = new Database(dbPath);

// Initialize tables
const initSQL = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
db.exec(initSQL);

// Prepared statements
const insertVersion = db.prepare(
  "INSERT INTO resume_versions (resume_id, file_path, source_type) VALUES (?, ?, ?)"
);
const updateVersion = db.prepare(
  "UPDATE resume_versions SET file_path = ? WHERE id = ?"
);

module.exports = {
  // Resumes
  getResumes: () =>
    db.prepare("SELECT * FROM resumes ORDER BY created_at DESC").all(),
  createResume: (tag) =>
    db.prepare("INSERT INTO resumes (tag) VALUES (?)").run(tag),
  // Versions
  getVersions: (resumeId) =>
    db
      .prepare(
        "SELECT * FROM resume_versions WHERE resume_id = ? ORDER BY created_at DESC"
      )
      .all(resumeId),
  createVersion: (resumeId, filePath, sourceType) =>
    insertVersion.run(resumeId, filePath, sourceType),
  updateVersionPath: (versionId, filePath) =>
    updateVersion.run(filePath, versionId),
  // TODO: notes, applications, cover letters methods
};
