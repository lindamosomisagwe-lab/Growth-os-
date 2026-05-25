// src/App.jsx
import React, { useState, useEffect } from "react";

// Default data schema
const DEFAULT_DATA = {
  projects: [],
  creativeLog: [],
  growthAudit: { career: 0, fun: 0, health: 0 },
};

// Simple hook to sync state with localStorage
function useLocalGrowth() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("growth_os_data");
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch (e) {
      console.error("Failed to parse localStorage", e);
      return DEFAULT_DATA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("growth_os_data", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to write to localStorage", e);
    }
  }, [data]);

  return [data, setData];
}

function App() {
  const [data, setData] = useLocalGrowth();

  const handleAuditChange = (field, value) => {
    setData({
      ...data,
      growthAudit: { ...data.growthAudit, [field]: Number(value) },
    });
  };

  // Export / Import handlers
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "growth_os_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setData(imported);
      } catch (err) {
        console.error("Invalid JSON file", err);
        alert("Failed to import data – invalid JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app p-6 font-nunito">
      <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "Nunito" }}>
        Individual Growth OS
      </h1>
      <div className="flex gap-4 mb-4">
        <button onClick={exportData} className="px-4 py-2 bg-beige border-3 border-clay rounded">
          Export Data
        </button>
        <label className="px-4 py-2 bg-beige border-3 border-clay rounded cursor-pointer">
          Import Data
          <input type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
        </label>
      </div>
      <section className="audit mb-6">
        <h2 className="text-xl font-semibold mb-2">Growth Audit</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(data.growthAudit).map(([key, val]) => (
            <div key={key} className="flex flex-col items-center">
              <label className="capitalize">{key}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={val}
                onChange={(e) => handleAuditChange(key, e.target.value)}
                className="w-16 text-center border-2 border-clay rounded"
              />
            </div>
          ))}
        </div>
      </section>
      {/* Placeholder sections for future Projects and R&D Log */}
      <section className="projects mb-6">
        <h2 className="text-xl font-semibold mb-2">Projects</h2>
        <p className="text-gray-600">(Add project tracking UI here)</p>
      </section>
      <section className="creativeLog mb-6">
        <h2 className="text-xl font-semibold mb-2">R&amp;D Log</h2>
        <p className="text-gray-600">(Add creative log UI here)</p>
      </section>
    </div>
  );
}

export default App;
