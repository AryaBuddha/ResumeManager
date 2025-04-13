import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faSearch,
  faCog,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ resumes, onSelect, onSettings }) {
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [selectedId, setSelectedId] = useState(null);

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

  const handleSelect = (id) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="sidebar">
      <h2>
        <FontAwesomeIcon icon={faFileAlt} />
        Resumes
      </h2>

      {/* Search box */}
      <div className="sidebar-search">
        <FontAwesomeIcon icon={faSearch} className="sidebar-search-icon" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search resumes..."
          className="form-control"
        />
      </div>

      {/* List of filtered resumes */}
      <ul className="resume-list">
        {filteredResumes.map((r) => (
          <li
            key={r.id}
            onClick={() => handleSelect(r.id)}
            className={`resume-item ${r.id === selectedId ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={faFileAlt} className="resume-item-icon" />
            {r.tag}
          </li>
        ))}
      </ul>

      {/* Add-new-resume form */}
      {adding ? (
        <div className="input-group" style={{ marginTop: "1rem" }}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Resume tag"
            className="form-control"
            style={{ marginBottom: "0.5rem" }}
          />
          <div>
            <button className="btn btn-success" onClick={saveTag}>
              <FontAwesomeIcon icon={faSave} />
              Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={cancelAdd}
              style={{ marginLeft: "0.5rem" }}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn"
          onClick={startAdd}
          style={{ marginTop: "1rem" }}
        >
          <FontAwesomeIcon icon={faPlus} />
          New Resume
        </button>
      )}

      <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
        <button className="btn btn-secondary" onClick={onSettings}>
          <FontAwesomeIcon icon={faCog} />
          Settings
        </button>
      </div>
    </div>
  );
}
