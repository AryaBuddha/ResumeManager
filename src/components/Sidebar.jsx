import React from "react";
export default function Sidebar({ resumes, onSelect }) {
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
      <button
        onClick={async () => {
          const tag = prompt("New resume tag:");
          if (tag) {
            await window.api.invoke("create-resume", tag);
            window.location.reload();
          }
        }}
      >
        + New Resume
      </button>
    </div>
  );
}
