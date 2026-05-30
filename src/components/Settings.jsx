import React, { useState, useEffect } from "react";

export default function Settings() {
  const [importStatus, setImportStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerToast = msg => setToast({ show: true, message: msg });

  const exportData = () => {
    const saved = localStorage.getItem("growth_os_v1");
    if (!saved) {
      triggerToast("There's no data to save yet.");
      return;
    }
    const blob = new Blob([saved], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my_story_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    triggerToast("Backup downloaded.");
    setExportStatus("✅ Your backup file has been downloaded.");
    setTimeout(() => setExportStatus(""), 4000);
  };

  const importData = e => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmImport = window.confirm(
      "Wait! Restoring from a backup will overwrite everything currently here. Are you sure you want to continue?"
    );
    if (!confirmImport) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        localStorage.setItem("growth_os_v1", JSON.stringify(parsed));
        triggerToast("Welcome back.");
        setImportStatus("✅ Data restored! Refreshing page...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        triggerToast("Hmm, that file didn't work.");
        setImportStatus("❌ We couldn't read that file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em" }}>Settings</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.95rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            Under the hood.
          </p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "600" }}>
            Your Data & Backups
          </h3>
          <p style={{ fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 1.5rem 0", color: "var(--text-secondary)" }}>
            Everything you enter in this app stays directly on your device. We don't have access to your data.
            If you're switching devices or just want to be safe, you can download a backup file of your story.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button onClick={exportData} className="btn-primary" style={{ width: "100%", padding: "1rem" }}>
              Download a backup
            </button>

            {exportStatus && (
              <div style={{ padding: "1rem", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", background: "rgba(255,255,255,0.05)" }}>
                {exportStatus}
              </div>
            )}

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Restore from a backup:
              </label>
              <input
                type="file"
                accept="application/json"
                onChange={importData}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", fontSize: "0.9rem" }}
              />
            </div>

            {importStatus && (
              <div style={{ padding: "1rem", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", background: "rgba(255,255,255,0.05)" }}>
                {importStatus}
              </div>
            )}
          </div>
        </div>

      </div>

      {toast.show && <div className="toast-notification">{toast.message}</div>}
    </div>
  );
}
