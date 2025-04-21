import React, { useState } from "react";

export default function Sidebar({ resumes, onSelect }) {
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

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
    // refresh list
    const updated = await window.api.invoke("get-resumes");
    onSelect(null);
    // onSelect resets selection
    // Ideally, parent should refetch; we can emit an event or pass a setter
    window.location.reload();
  };

  return (
    <div
      style={{ width: "300px", borderRight: "1px solid #ccc", padding: "1rem" }}
    >
      <h2>Resumes</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {resumes.map((r) => (
          <li
            key={r.id}
            onClick={() => onSelect(r.id)}
            style={{ cursor: "pointer", margin: "0.5rem 0" }}
          >
            📄 {r.tag}
          </li>
        ))}
      </ul>
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
    </div>
  );
}
