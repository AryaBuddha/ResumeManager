import React, { useState, useEffect } from "react";
import PdfPreview from "./PdfPreview";

export default function ResumeDetail({ id }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (id) window.api.invoke("get-versions", id).then(setVersions);
  }, [id]);

  const addVersion = async () => {
    const res = await window.api.invoke("select-version-file", id);
    if (!res.canceled) {
      const updated = await window.api.invoke("get-versions", id);
      setVersions(updated);
    }
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
              onClick={() => setSelectedVersion(v)}
              style={{ cursor: "pointer", margin: "0.5rem 0" }}
            >
              {v.source_type.toUpperCase()} -{" "}
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
    </div>
  );
}
