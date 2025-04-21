const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs-extra");

try {
  // Make sure data directory exists
  const dbDir = path.join(__dirname, "../data");
  fs.ensureDirSync(dbDir);

  const dbPath = path.join(dbDir, "metadata.db");
  console.log("Database path:", dbPath);

  const db = new Database(dbPath);
  const initSQL = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
  db.exec(initSQL);

  console.log("Database initialized successfully");

  // Prepared statements
  const insertResume = db.prepare("INSERT INTO resumes(tag) VALUES(?)");
  const selectResumes = db.prepare(
    "SELECT * FROM resumes ORDER BY created_at DESC"
  );
  const insertVersion = db.prepare(
    "INSERT INTO resume_versions(resume_id,file_path,source_type) VALUES(?,?,?)"
  );
  const selectVersions = db.prepare(
    "SELECT * FROM resume_versions WHERE resume_id=? ORDER BY created_at DESC"
  );
  const updateVersion = db.prepare(
    "UPDATE resume_versions SET file_path = ? WHERE id = ?"
  );
  const selectNotes = db.prepare(
    "SELECT * FROM notes WHERE version_id = ? ORDER BY created_at DESC"
  );
  const insertNote = db.prepare(
    "INSERT INTO notes(version_id,content) VALUES(?,?)"
  );
  const selectApplications = db.prepare(
    "SELECT * FROM applications WHERE version_id = ? ORDER BY applied_at DESC"
  );
  const insertApplication = db.prepare(
    "INSERT INTO applications(version_id,company_name) VALUES(?,?)"
  );
  const selectCoverLetters = db.prepare(
    "SELECT * FROM cover_letters WHERE application_id = ? ORDER BY created_at DESC"
  );
  const insertCoverLetterFile = db.prepare(
    "INSERT INTO cover_letters(application_id,file_path) VALUES(?,?)"
  );
  const updateCoverLetter = db.prepare(
    "UPDATE cover_letters SET file_path = ? WHERE id = ?"
  );
  const insertCoverLetterText = db.prepare(
    "INSERT INTO cover_letters(application_id,text_content) VALUES(?,?)"
  );

  module.exports = {
    // Resumes
    getResumes: () => selectResumes.all(),
    createResume: (tag) => insertResume.run(tag),
    // Versions
    getVersions: (resumeId) => selectVersions.all(resumeId),
    createVersion: (resumeId, filePath, sourceType) =>
      insertVersion.run(resumeId, filePath, sourceType),
    updateVersionPath: (versionId, filePath) =>
      updateVersion.run(filePath, versionId),
    // Notes
    getNotes: (versionId) => selectNotes.all(versionId),
    createNote: (versionId, content) => insertNote.run(versionId, content),
    // Applications
    getApplications: (versionId) => selectApplications.all(versionId),
    createApplication: (versionId, companyName) =>
      insertApplication.run(versionId, companyName),
    // Cover Letters
    getCoverLetters: (applicationId) => selectCoverLetters.all(applicationId),
    createCoverLetterFile: (applicationId, filePath) =>
      insertCoverLetterFile.run(applicationId, filePath),
    updateCoverLetterPath: (letterId, filePath) =>
      updateCoverLetter.run(filePath, letterId),
    createCoverLetterText: (applicationId, text) =>
      insertCoverLetterText.run(applicationId, text),
  };

  // Continue with the rest of your code...
} catch (err) {
  console.error("Database initialization error:", err);
}
