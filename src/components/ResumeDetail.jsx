import React, { useState, useEffect } from "react";
export default function ResumeDetail({ id }) {
  const [versions, setVersions] = useState([]);
  useEffect(() => {
    if (id) {
      window.api.invoke("get-versions", id).then(setVersions);
    }
  }, [id]);

  if (!id) {
    return <div style={{ flex: 1, padding: "1rem" }}>Select a resume.</div>;
  }

  const addVersion = async () => {
    const res = await window.api.invoke("select-version-file", id);
    if (!res.canceled) {
      const updated = await window.api.invoke("get-versions", id);
      setVersions(updated);
    }
  };

  return (
    <div style={{ flex: 1, padding: "1rem" }}>
      <h2>Versions for Resume ID {id}</h2>
      <ul>
        {versions.map((v) => (
          <li key={v.id}>
            {v.source_type.toUpperCase()} -{" "}
            {new Date(v.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
      <button onClick={addVersion}>+ Add Version</button>
    </div>
  );
}
