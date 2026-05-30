import React, { useState } from "react";

const playlists = [
  { name: "Lofi Beats (Focus)", id: "37i9dQZF1DWWQRwui0ExPn", icon: "☕" },
  { name: "Chill Lofi Study",   id: "0vvXsWCC3xrXsKd4IYS3ui", icon: "📚" },
  { name: "Peaceful Meditation",id: "37i9dQZF1DWZqd5JICOIwS", icon: "🧘" }
];

export default function SpotifyWidget() {
  const [activePlaylist, setActivePlaylist] = useState(playlists[0]);

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h2 style={{ margin: "0", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          Focus Music
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          CURATED PLAYLISTS FOR DEEP WORK SESSIONS
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

        {/* Playlist selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{
            margin: "0 0 0.75rem 0", fontSize: "0.78rem", fontWeight: "700",
            fontFamily: "var(--font-mono)", color: "var(--text-secondary)",
            letterSpacing: "0.06em", fontStyle: "normal"
          }}>
            SELECT FOCUS MODE:
          </p>
          {playlists.map(p => {
            const isAct = activePlaylist.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlaylist(p)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem 1.25rem",
                  border: isAct
                    ? "1px solid rgba(201,168,76,0.5)"
                    : "1px solid rgba(0,0,0,0.09)",
                  background: isAct
                    ? "linear-gradient(135deg, #2A235C 0%, #1A1535 100%)"
                    : "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(8px)",
                  color: isAct ? "#ffffff" : "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: "600", fontSize: "0.9rem",
                  letterSpacing: "0.02em", textAlign: "left",
                  fontStyle: "normal",
                  transition: "all 0.18s ease",
                  boxShadow: isAct
                    ? "0 2px 12px rgba(26,21,53,0.30)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                  borderLeft: isAct ? "3px solid rgba(201,168,76,0.8)" : "3px solid transparent"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                <span style={{ color: "inherit", fontStyle: "normal" }}>{p.name}</span>
              </button>
            );
          })}
          <p style={{
            margin: "1rem 0 0 0", fontSize: "0.78rem",
            color: "var(--text-secondary)", lineHeight: "1.6", fontStyle: "italic"
          }}>
            Log in to Spotify in this browser to stream full tracks directly within the widget.
          </p>
        </div>

        {/* Embedded player — dark card to match sidebar tone */}
        <div style={{
          background: "linear-gradient(145deg, #1C1640 0%, #0F0D28 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTop: "2px solid rgba(201,168,76,0.40)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "0",
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Dot-grid texture to match sidebar */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            pointerEvents: "none", zIndex: 0
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <iframe
              src={`https://open.spotify.com/embed/playlist/${activePlaylist.id}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ border: "none", display: "block" }}
              title="Spotify Focus Player"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
