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

  const triggerToast = msg => setToast({ show: true, message: msg.toUpperCase() });

  const exportData = () => {
    const saved = localStorage.getItem("growth_os_v1");
    if (!saved) {
      triggerToast("database empty");
      return;
    }
    const blob = new Blob([saved], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth_os_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    triggerToast("backup downloaded");
    setExportStatus("✅ BACKUP FILE DOWNLOADED SUCCESSFULLY.");
    setTimeout(() => setExportStatus(""), 4000);
  };

  const importData = e => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmImport = window.confirm(
      "⚠️ WARNING: Importing this backup file will completely overwrite all current timeline chapters, objective checklists, and radar balance metrics in your database.\n\nAre you sure you want to proceed?"
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
        triggerToast("database restored");
        setImportStatus("✅ RESTORATION SUCCESSFUL! REBOOTING SYSTEM...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        triggerToast("restoration failed");
        setImportStatus("❌ INVALID FILE FORMAT. TRANSACTION ABORTED.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid #222222", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>⚙️</span> System Settings Console
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888888", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
          LOCAL STORAGE MAINTENANCE // BACKUP &amp; DISASTER RECOVERY
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Data & Backup Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            📥 Database Backup
          </h3>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6", margin: "0 0 1.5rem 0", color: "#888888" }}>
            Export the localized Growth OS SQL-JSON database as a standard structured snapshot file. Restore this snapshot on any browser console to fully recover active checklist and timeline records.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button onClick={exportData} className="btn-primary" style={{ width: "100%", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📥 Export backup snapshot
            </button>

            {exportStatus && (
              <div style={{
                padding: "0.8rem",
                borderRadius: "0px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textAlign: "center",
                background: "#050505",
                border: "1px dashed #ffffff",
                color: "#ffffff",
                fontFamily: "var(--font-mono)"
              }}>
                {exportStatus}
              </div>
            )}

            {/* Import Action */}
            <div style={{ borderTop: "1px dashed #222222", paddingTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#888888", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                Restore Backup Snapshot:
              </label>
              <input
                type="file"
                accept="application/json"
                onChange={importData}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  boxSizing: "border-box",
                  background: "#050505",
                  borderRadius: "0px",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontSize: "0.8rem"
                }}
              />
            </div>

            {importStatus && (
              <div style={{
                marginTop: "0.5rem",
                padding: "0.8rem",
                borderRadius: "0px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textAlign: "center",
                background: "#050505",
                border: "1px dashed #ffffff",
                color: "#ffffff",
                fontFamily: "var(--font-mono)"
              }}>
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Database Sandbox Integrity Card */}
        <div className="stationery-card" style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            🔒 Storage Sandbox Isolation
          </h3>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6", margin: "0 0 1.5rem 0", color: "#888888" }}>
            Your operational database is locked entirely inside local browser sandbox isolation. Transactions occur strictly offline, offering complete sovereign anonymity and trackless data privacy.
          </p>
          <div style={{ background: "#050505", border: "1px dashed #222222", padding: "1rem", borderRadius: "0px", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "#888888" }}>
            <strong style={{ color: "#ffffff" }}>Active DB Sandbox Schema:</strong>
            <pre style={{ margin: "0.5rem 0 0 0", overflowX: "auto", color: "#c5c5c5" }}>
              Key: growth_os_v1
              Type: LocalStorage Sandbox
            </pre>
          </div>
        </div>
      </div>

      {toast.show && <div className="toast-notification"><span>⚡</span> {toast.message}</div>}
    </div>
  );
}
