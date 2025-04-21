// src/components/Sidebar.jsx
import React, { useState } from "react";

export default function Sidebar({ resumes, onSelect, onSettings }) {
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Only show resumes whose tag includes the filter text (case‑insensitive)
  const filteredResumes = resumes.filter((r) =>
    r.tag.toLowerCase().includes(filter.toLowerCase())
  );

  const startAdd = () => {
    setAdding(true);
    setNewTag("");
  };
  const cancelAdd = () => {
    setAdding(false);
    setNewTag("");
  };
  const saveTag = async () => {
    if (!newTag.trim()) return;
    await window.api.invoke("create-resume", newTag.trim());
    setAdding(false);
    // Ideally re-fetch the list, but you can reload for now:
    window.location.reload();
  };

  return (
    <div
      style={{ width: "300px", borderRight: "1px solid #ccc", padding: "1rem" }}
    >
      <h2>Resumes</h2>

      {/* Search box */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search resumes..."
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {/* List of filtered resumes */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredResumes.map((r) => (
          <li
            key={r.id}
            onClick={() => onSelect(r.id)}
            style={{ cursor: "pointer", margin: "0.5rem 0" }}
          >
            📄 {r.tag}
          </li>
        ))}
      </ul>

      {/* Add-new-resume form */}
      {adding ? (
        <div style={{ marginTop: "1rem" }}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Resume tag"
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button onClick={saveTag} style={{ marginRight: "0.5rem" }}>
            Save
          </button>
          <button onClick={cancelAdd}>Cancel</button>
        </div>
      ) : (
        <button onClick={startAdd} style={{ marginTop: "1rem" }}>
          + New Resume
        </button>
      )}

      <hr style={{ margin: "1.5rem 0" }} />

      {/* Settings */}
      <button onClick={onSettings}>⚙️ Settings</button>
    </div>
  );
}
