import React, { useState, useEffect } from "react";
import PdfPreview from "./PdfPreview";

function getFileName(filePath) {
  return filePath ? filePath.split(/[/\\]/).pop() : "";
}

export default function ResumeDetail({ id, tag }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [applications, setApplications] = useState([]);
  const [newCompany, setNewCompany] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [coverLetters, setCoverLetters] = useState([]);
  const [newLetterText, setNewLetterText] = useState("");
  const [downloadPath, setDownloadPath] = useState(null);

  useEffect(() => {
    if (id) window.api.invoke("get-versions", id).then(setVersions);
    setSelectedVersion(null);
    setNotes([]);
    setApplications([]);
    setSelectedApp(null);
    setCoverLetters([]);
    setDownloadPath(null);
  }, [id]);

  useEffect(() => {
    if (selectedVersion) {
      window.api.invoke("get-notes", selectedVersion.id).then(setNotes);
      window.api
        .invoke("get-applications", selectedVersion.id)
        .then(setApplications);
    }
  }, [selectedVersion]);

  useEffect(() => {
    if (selectedApp) {
      window.api
        .invoke("get-cover-letters", selectedApp.id)
        .then(setCoverLetters);
    }
  }, [selectedApp]);

  const addVersion = async () => {
    const res = await window.api.invoke("select-version-file", id);
    if (!res.canceled) {
      const updated = await window.api.invoke("get-versions", id);
      setVersions(updated);
    }
  };

  const addNote = async () => {
    if (!noteText || !selectedVersion) return;
    await window.api.invoke("add-note", selectedVersion.id, noteText);
    const updated = await window.api.invoke("get-notes", selectedVersion.id);
    setNotes(updated);
    setNoteText("");
  };

  const addApplication = async () => {
    if (!newCompany || !selectedVersion) return;
    await window.api.invoke("add-application", selectedVersion.id, newCompany);
    const updated = await window.api.invoke(
      "get-applications",
      selectedVersion.id
    );
    setApplications(updated);
    setNewCompany("");
  };

  const addCoverLetterFile = async () => {
    if (!selectedApp) return;
    const res = await window.api.invoke(
      "select-cover-letter-file",
      selectedApp.id
    );
    if (!res.canceled) {
      const updated = await window.api.invoke(
        "get-cover-letters",
        selectedApp.id
      );
      setCoverLetters(updated);
    }
  };

  const addCoverLetterText = async () => {
    if (!newLetterText || !selectedApp) return;
    await window.api.invoke(
      "add-cover-letter-text",
      selectedApp.id,
      newLetterText
    );
    const updated = await window.api.invoke(
      "get-cover-letters",
      selectedApp.id
    );
    setCoverLetters(updated);
    setNewLetterText("");
  };

  const downloadResume = async () => {
    if (!selectedVersion) return;
    const dest = await window.api.invoke("download-resume", {
      filePath: selectedVersion.file_path,
      tag,
    });
    setDownloadPath(dest);
  };

  const doneWithDownload = async () => {
    if (!downloadPath) return;
    await window.api.invoke("delete-resume-download", downloadPath);
    setDownloadPath(null);
  };

  if (!id) {
    return <div style={{ flex: 1, padding: "1rem" }}>Select a resume.</div>;
  }

  return (
    <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
      <h2>Versions for Resume ID {id}</h2>
      <div style={{ marginBottom: 16 }}>
        <ul>
          {versions.map((v) => (
            <li
              key={v.id}
              onClick={() => {
                setSelectedVersion(v);
                setNoteText("");
                setNewCompany("");
                setSelectedApp(null);
              }}
              style={{ cursor: "pointer", margin: "0.5rem 0" }}
            >
              📄 {v.source_type.toUpperCase()} -{" "}
              {new Date(v.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
        <button onClick={addVersion}>+ Add Version</button>
      </div>

      {selectedVersion &&
        selectedVersion.file_path &&
        selectedVersion.source_type === "pdf" && (
          <div>
            <h3>Preview (v{selectedVersion.id})</h3>
            <PdfPreview filePath={selectedVersion.file_path} />
          </div>
        )}

      {selectedVersion && (
        <>
          <div style={{ marginTop: 24 }}>
            <h3>Notes</h3>
            <ul>
              {notes.map((n) => (
                <li key={n.id} style={{ margin: "0.5rem 0" }}>
                  {new Date(n.created_at).toLocaleString()}: {n.content}
                </li>
              ))}
            </ul>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Add a note..."
            />
            <button onClick={addNote} style={{ marginTop: 8 }}>
              Save Note
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Applications</h3>
            <ul>
              {applications.map((app) => (
                <li
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{ cursor: "pointer", margin: "0.5rem 0" }}
                >
                  🏢 {app.company_name} (
                  {new Date(app.applied_at).toLocaleDateString()})
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Company name"
              style={{ width: "60%", marginRight: 8 }}
            />
            <button onClick={addApplication}>+ Add Application</button>
          </div>

          {selectedApp && (
            <div style={{ marginTop: 24 }}>
              <h3>Cover Letters for {selectedApp.company_name}</h3>
              <ul>
                {coverLetters.map((letter) => (
                  <li key={letter.id} style={{ margin: "0.5rem 0" }}>
                    {letter.file_path
                      ? `File: ${getFileName(letter.file_path)}`
                      : `Text: ${letter.text_content.slice(0, 30)}...`}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 8 }}>
                <button onClick={addCoverLetterFile}>
                  Upload Cover Letter File
                </button>
              </div>
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={newLetterText}
                  onChange={(e) => setNewLetterText(e.target.value)}
                  rows={4}
                  style={{ width: "100%" }}
                  placeholder="Or write cover letter text..."
                />
                <button onClick={addCoverLetterText} style={{ marginTop: 8 }}>
                  Save Cover Letter Text
                </button>
              </div>
            </div>
          )}

          {/* Download/Done controls */}
          <div style={{ marginTop: 24 }}>
            <button onClick={downloadResume} disabled={!!downloadPath}>
              Download Resume
            </button>
            <button
              onClick={doneWithDownload}
              disabled={!downloadPath}
              style={{ marginLeft: 8 }}
            >
              Done
            </button>
            {downloadPath && <p>Downloaded to: {downloadPath}</p>}
          </div>
        </>
      )}
    </div>
  );
}
