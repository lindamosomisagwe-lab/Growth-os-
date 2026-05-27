import React, { useState } from "react";

const playlists = [
  { name: "Lofi Beats (Focus)", id: "37i9dQZF1DWWQRwui0ExPn", icon: "☕" },
  { name: "Chill Lofi Study", id: "0vvXsWCC3xrXsKd4IYS3ui", icon: "📚" },
  { name: "Peaceful Meditation", id: "37i9dQZF1DWZqd5JICOIwS", icon: "🧘" }
];

export default function SpotifyWidget() {
  const [activePlaylist, setActivePlaylist] = useState(playlists[0]);

  return (
    <div style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.6rem", borderBottom: "1px solid #222222", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>🎵</span> Spotify Focus Playlists
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
        {/* Playlist Selection Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", textTransform: "uppercase", fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.05em" }}>
            Select Focus Mode:
          </p>
          {playlists.map(p => {
            const isAct = activePlaylist.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlaylist(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "0px",
                  border: isAct ? "1px solid #ffffff" : "1px solid #222222",
                  background: isAct ? "#ffffff" : "transparent",
                  color: isAct ? "#000000" : "#ffffff",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  textAlign: "left",
                  transition: "all 0.15s ease-in-out"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                <span style={{ color: isAct ? "#000000" : "#ffffff" }}>{p.name}</span>
              </button>
            );
          })}
          <p style={{ margin: "1rem 0 0 0", fontSize: "0.8rem", color: "#888888", lineHeight: "1.5" }}>
            💡 Log in to your Spotify account in this browser to listen to full tracks directly inside the widget command console.
          </p>
        </div>

        {/* Embedded Iframe Player */}
        <div className="stationery-card" style={{ padding: "1rem", borderRadius: "0px", border: "1px solid #222222", background: "#0a0a0a" }}>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${activePlaylist.id}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: "0px", border: "none" }}
            title="Spotify Focus Player"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
