import React, { useState, useEffect } from "react";

export default function Settings() {
  const [dataPath, setDataPath] = useState("");
  const [prefix, setPrefix] = useState("");

  // Load current settings on mount
  useEffect(() => {
    window.api.invoke("get-settings").then(({ dataPath, defaultPrefix }) => {
      setDataPath(dataPath);
      setPrefix(defaultPrefix);
    });
  }, []);

  // Change data folder
  const changeFolder = async () => {
    const res = await window.api.invoke("select-data-folder");
    if (!res.canceled) {
      setDataPath(res.path);
    }
  };

  // Save prefix (and folder if desired)
  const save = async () => {
    await window.api.invoke("set-setting", "defaultPrefix", prefix);
    // you could also persist dataPath if you allowed editing it directly
    alert("Settings saved.");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Settings</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Data Folder:
        </label>
        <div style={{ marginBottom: 8 }}>{dataPath}</div>
        <button onClick={changeFolder}>Choose Folder…</button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Default Filename Prefix:
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <button onClick={save}>Save Settings</button>
    </div>
  );
}
