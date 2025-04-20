import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ResumeDetail from "./components/ResumeDetail";
import "./styles/global.css";
export default function App() {
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    window.api.invoke("get-resumes").then(setResumes);
  }, []);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar resumes={resumes} onSelect={setSelectedId} />
      <ResumeDetail id={selectedId} />
    </div>
  );
}
