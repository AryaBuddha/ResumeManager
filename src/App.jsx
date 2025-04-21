import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ResumeDetail from "./components/ResumeDetail";
import Settings from "./components/Settings";
import "./styles/global.css";

export default function App() {
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("resume"); // 'resume' or 'settings'

  useEffect(() => {
    window.api.invoke("get-resumes").then(setResumes);
  }, []);

  const selectedResume = resumes.find((r) => r.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        resumes={resumes}
        onSelect={(id) => {
          setView("resume");
          setSelectedId(id);
        }}
        onSettings={() => setView("settings")}
      />

      {view === "settings" ? (
        <Settings />
      ) : (
        <ResumeDetail id={selectedId} tag={selectedResume?.tag} />
      )}
    </div>
  );
}
