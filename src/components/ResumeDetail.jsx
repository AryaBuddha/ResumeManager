import React, { useState, useEffect } from "react";
import PdfPreview from "./PdfPreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faTrash,
  faDownload,
  faPlus,
  faSave,
  faBuilding,
  faFile,
  faFileCode,
  faFilePdf,
  faCheck,
  faNoteSticky,
  faHandshake,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";

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

  if (!id)
    return (
      <div className="empty-state">
        <FontAwesomeIcon icon={faFileAlt} className="empty-state-icon" />
        <h2>No Resume Selected</h2>
        <p>Please select a resume from the sidebar or create a new one.</p>
      </div>
    );

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h2>
          <FontAwesomeIcon icon={faFileAlt} />
          {tag} Resume
        </h2>
        <button className="btn btn-danger" onClick={deleteResume}>
          <FontAwesomeIcon icon={faTrash} />
          Delete Resume
        </button>
      </div>

      {/* Versions Section */}
      <section className="card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={faFile} />
            Versions
          </h3>
          <button className="btn" onClick={addVersion}>
            <FontAwesomeIcon icon={faPlus} />
            Add Version
          </button>
        </div>

        {versions.length > 0 ? (
          <ul className="list">
            {versions.map((v) => (
              <li key={v.id} className="list-item">
                <span
                  onClick={() => setSelectedVersion(v)}
                  className={v.id === selectedVersion?.id ? "active" : ""}
                >
                  <FontAwesomeIcon
                    icon={v.source_type === "pdf" ? faFilePdf : faFileCode}
                  />
                  {v.source_type.toUpperCase()} -{" "}
                  {new Date(v.created_at).toLocaleString()}
                </span>
                <button
                  className="btn btn-danger small"
                  onClick={() => deleteVersion(v.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-empty-message">
            No versions added yet. Click "Add Version" to upload a resume file.
          </p>
        )}

        {selectedVersion && selectedVersion.source_type === "pdf" && (
          <div className="pdf-preview">
            <h4>
              <FontAwesomeIcon icon={faFilePdf} />
              Preview (v{selectedVersion.id})
            </h4>
            <PdfPreview filePath={selectedVersion.file_path} />
          </div>
        )}
      </section>

      {/* Download Section */}
      <section className="card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={faDownload} />
            Download
          </h3>
        </div>
        <div className="card-actions">
          <button
            className="btn"
            onClick={downloadLatest}
            disabled={!!downloadPath || versions.length === 0}
          >
            <FontAwesomeIcon icon={faDownload} />
            Download Latest Version
          </button>
          <button
            className="btn btn-secondary"
            onClick={doneWithDownload}
            disabled={!downloadPath}
          >
            <FontAwesomeIcon icon={faCheck} />
            Done
          </button>
        </div>
        {downloadPath && (
          <div className="download-info">
            <p>
              <strong>Downloaded to:</strong> {downloadPath}
            </p>
          </div>
        )}
      </section>

      {/* Notes Section */}
      <section className="card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={faNoteSticky} />
            Notes
          </h3>
        </div>

        {notes.length > 0 ? (
          <ul className="list">
            {notes.map((n) => (
              <li key={n.id} className="list-item">
                <div>
                  <strong>{new Date(n.created_at).toLocaleString()}:</strong>
                  <p>{n.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-empty-message">No notes added yet.</p>
        )}

        <div className="input-group">
          <textarea
            className="form-control"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
          />
          <button className="btn" onClick={addNote} disabled={!noteText.trim()}>
            <FontAwesomeIcon icon={faSave} />
            Save Note
          </button>
        </div>
      </section>

      {/* Applications Section */}
      <section className="card">
        <div className="card-header">
          <h3>
            <FontAwesomeIcon icon={faHandshake} />
            Applications
          </h3>
        </div>

        {applications.length > 0 ? (
          <ul className="application-list">
            {applications.map((app) => (
              <li
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`application-item ${
                  app.id === selectedApp?.id ? "active" : ""
                }`}
              >
                <FontAwesomeIcon icon={faBuilding} />
                {app.company_name} (
                {new Date(app.applied_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-empty-message">No applications added yet.</p>
        )}

        <div className="input-group">
          <div className="form-row">
            <input
              type="text"
              className="form-control"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Company name"
            />
            <button
              className="btn"
              onClick={addApplication}
              disabled={!newCompany.trim()}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Application
            </button>
          </div>
        </div>
      </section>

      {/* Cover Letters Section */}
      {selectedApp && (
        <section className="card">
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faFileSignature} />
              Cover Letters for {selectedApp.company_name}
            </h3>
          </div>

          {coverLetters.length > 0 ? (
            <div className="cover-letters-container">
              {coverLetters.map((letter) => (
                <div key={letter.id} className="cover-letter">
                  {letter.file_path ? (
                    <>
                      <div className="cover-letter-header">
                        <FontAwesomeIcon icon={faFilePdf} />
                        PDF (v{letter.id})
                      </div>
                      <div className="cover-letter-content">
                        <PdfPreview filePath={letter.file_path} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="cover-letter-header">
                        <FontAwesomeIcon icon={faFileAlt} />
                        Text (v{letter.id})
                      </div>
                      <div className="cover-letter-content">
                        <pre className="cover-letter-text">
                          {letter.text_content}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="card-empty-message">
              No cover letters added yet for this application.
            </p>
          )}

          <div className="input-group">
            <button className="btn" onClick={addCoverLetterFile}>
              <FontAwesomeIcon icon={faFilePdf} />
              Upload Cover Letter File
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <textarea
              className="form-control"
              value={newLetterText}
              onChange={(e) => setNewLetterText(e.target.value)}
              placeholder="Write cover letter text..."
            />

            <button
              className="btn"
              onClick={addCoverLetterText}
              disabled={!newLetterText.trim()}
            >
              <FontAwesomeIcon icon={faSave} />
              Save Cover Letter Text
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
