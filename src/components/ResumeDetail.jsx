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
    if (!id) return;
    window.api.invoke("get-versions", id).then((vs) => {
      setVersions(vs);
      setSelectedVersion(vs[0] || null);
    });
    window.api.invoke("get-notes", id).then(setNotes);
    window.api.invoke("get-applications", id).then((apps) => {
      setApplications(apps);
      setSelectedApp(apps[0] || null);
    });
    setCoverLetters([]);
    setDownloadPath(null);
    setNoteText("");
    setNewCompany("");
    setNewLetterText("");
  }, [id]);

  useEffect(() => {
    if (selectedApp)
      window.api
        .invoke("get-cover-letters", selectedApp.id)
        .then(setCoverLetters);
    else setCoverLetters([]);
  }, [selectedApp]);

  const addVersion = async () => {
    const res = await window.api.invoke("select-version-file", id);
    if (!res.canceled) {
      const vs = await window.api.invoke("get-versions", id);
      setVersions(vs);
      setSelectedVersion(vs[0] || null);
    }
  };
  const deleteVersion = async (vid) => {
    if (confirm("Delete this version?")) {
      await window.api.invoke("delete-version", id, vid);
      const vs = await window.api.invoke("get-versions", id);
      setVersions(vs);
      setSelectedVersion(vs[0] || null);
    }
  };
  const deleteResume = async () => {
    if (confirm("Delete this resume and all versions?")) {
      await window.api.invoke("delete-resume", id);
      window.location.reload();
    }
  };

  const downloadLatest = async () => {
    const dest = await window.api.invoke("download-resume", id);
    setDownloadPath(dest);
  };
  const doneWithDownload = async () => {
    await window.api.invoke("delete-resume-download", downloadPath);
    setDownloadPath(null);
  };
  const addNote = async () => {
    if (!noteText) return;
    await window.api.invoke("add-note", id, noteText);
    setNoteText("");
    setNotes(await window.api.invoke("get-notes", id));
  };
  const addApplication = async () => {
    if (!newCompany) return;
    await window.api.invoke("add-application", id, newCompany);
    const apps = await window.api.invoke("get-applications", id);
    setApplications(apps);
    setSelectedApp(apps[0] || null);
    setNewCompany("");
  };
  const addCoverLetterFile = async () => {
    if (!selectedApp) return;
    const res = await window.api.invoke(
      "select-cover-letter-file",
      selectedApp.id
    );
    if (!res.canceled)
      setCoverLetters(
        await window.api.invoke("get-cover-letters", selectedApp.id)
      );
  };
  const addCoverLetterText = async () => {
    if (!newLetterText || !selectedApp) return;
    await window.api.invoke(
      "add-cover-letter-text",
      selectedApp.id,
      newLetterText
    );
    setNewLetterText("");
    setCoverLetters(
      await window.api.invoke("get-cover-letters", selectedApp.id)
    );
  };

  if (!id) return <div className="empty-state">Select a resume.</div>;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h2>
          {tag} Resume{" "}
          <button onClick={deleteResume} style={{ color: "red" }}>
            Delete Resume
          </button>
        </h2>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Versions</h3>
          <button onClick={addVersion} style={{ marginBottom: 8 }}>
            + Add Version
          </button>
        </div>
        <ul className="list">
          {versions.map((v) => (
            <li key={v.id} className="list-item">
              <span
                onClick={() => setSelectedVersion(v)}
                style={{
                  cursor: "pointer",
                  fontWeight: v.id === selectedVersion?.id ? "bold" : "normal",
                }}
              >
                {v.source_type.toUpperCase()} -{" "}
                {new Date(v.created_at).toLocaleString()}
              </span>
              <button
                className="btn btn-danger small"
                onClick={() => deleteVersion(v.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {selectedVersion && selectedVersion.source_type === "pdf" && (
          <div className="pdf-preview">
            <h4>Preview (v{selectedVersion.id})</h4>
            <PdfPreview filePath={selectedVersion.file_path} />
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <button onClick={downloadLatest} disabled={!!downloadPath}>
          Download Latest Version
        </button>
        <button
          onClick={doneWithDownload}
          disabled={!downloadPath}
          style={{ marginLeft: 8 }}
        >
          Done
        </button>
        {downloadPath && <p>Downloaded to: {downloadPath}</p>}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Notes</h3>
        <ul>
          {notes.map((n) => (
            <li key={n.id}>
              {new Date(n.created_at).toLocaleString()}: {n.content}
            </li>
          ))}
        </ul>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
          placeholder="Add a note..."
        />
        <button onClick={addNote} style={{ marginTop: 8 }}>
          Save Note
        </button>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Applications</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {applications.map((app) => (
            <li
              key={app.id}
              onClick={() => setSelectedApp(app)}
              style={{
                cursor: "pointer",
                fontWeight: app.id === selectedApp?.id ? "bold" : "normal",
              }}
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
          style={{ marginRight: 8 }}
        />
        <button onClick={addApplication}>+ Add Application</button>
      </section>

      {selectedApp && (
        <section style={{ marginBottom: 24 }}>
          <h3>Cover Letters for {selectedApp.company_name}</h3>
          {coverLetters.map((letter) => (
            <div
              key={letter.id}
              style={{
                marginBottom: 16,
                padding: "0.5rem",
                border: "1px solid #ddd",
              }}
            >
              {letter.file_path ? (
                <>
                  <h4>PDF (v{letter.id})</h4>
                  <PdfPreview filePath={letter.file_path} />
                </>
              ) : (
                <>
                  <h4>Text (v{letter.id})</h4>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      background: "#f9f9f9",
                      padding: "0.5rem",
                    }}
                  >
                    {letter.text_content}
                  </pre>
                </>
              )}
            </div>
          ))}
          <button onClick={addCoverLetterFile} style={{ marginRight: 8 }}>
            Upload Cover Letter File
          </button>
          <textarea
            value={newLetterText}
            onChange={(e) => setNewLetterText(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Or write cover letter text..."
          />
          <button onClick={addCoverLetterText} style={{ marginTop: 8 }}>
            Save Cover Letter Text
          </button>
        </section>
      )}
    </div>
  );
}
