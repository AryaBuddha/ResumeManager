import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("React starting...");

// Add this line to check if the DOM element exists
const rootElement = document.getElementById("root");
console.log("Root element found:", !!rootElement);

try {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React rendered successfully");
} catch (err) {
  console.error("React render error:", err);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Error Rendering App</h1>
      <pre>${err.message}</pre>
    </div>
  `;
}
