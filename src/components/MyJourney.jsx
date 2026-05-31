import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGamification } from "../contexts/GamificationContext";

export default function MyJourney() {
  const { progress } = useGamification();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("growth_os_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sort goals: completed first (to be at the bottom of the journey), then incomplete
        const sorted = (parsed.goals || []).sort((a, b) => {
          if (a.completed && !b.completed) return -1;
          if (!a.completed && b.completed) return 1;
          return 0;
        });
        setGoals(sorted);
      } catch(e) {}
    }
  }, []);

  if (goals.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
        <h2 style={{ margin: "0 0 1rem 0", color: "#FFF", fontSize: "1.5rem", fontWeight: "400" }}>Your journey starts with one goal.</h2>
        <Link to="/goals" className="btn-primary" style={{ padding: "1rem 2rem" }}>
          + Set your first goal
        </Link>
      </div>
    );
  }

  // Calculate SVG height based on nodes
  const nodeSpacing = 160;
  const svgHeight = Math.max(800, goals.length * nodeSpacing + 200);

  // Generate path data
  // Start from bottom (svgHeight) to top (100)
  // Winding path using Bezier curves
  let pathD = `M 200 ${svgHeight}`;
  const nodes = goals.map((goal, i) => {
    // Reverse index so the first goal is at the bottom
    const reversedIndex = goals.length - 1 - i;
    const cy = svgHeight - (i * nodeSpacing) - 150;
    
    // Alternate left/right winding
    const cx = 200 + Math.sin(i * 1.5) * 80;
    
    if (i === 0) {
      pathD = `M ${cx} ${cy + 100} Q ${cx} ${cy + 50} ${cx} ${cy}`;
    } else {
      const prevCy = svgHeight - ((i - 1) * nodeSpacing) - 150;
      const prevCx = 200 + Math.sin((i - 1) * 1.5) * 80;
      // Control points for smooth curve
      pathD += ` C ${prevCx} ${prevCy - 60}, ${cx} ${cy + 60}, ${cx} ${cy}`;
    }

    return { ...goal, cx, cy, reversedIndex };
  });

  // Split path into completed and incomplete portions
  // A rough approximation is styling the nodes, but SVG stroke is one solid element unless we use two paths.
  // For simplicity, we use one path and drop stroke opacity near the top.

  return (
    <div style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "sticky", top: "0", zIndex: 10, background: "linear-gradient(to bottom, var(--bg-page) 60%, transparent)", paddingTop: "1rem" }}>
        <div>
          <h2 style={{ margin: "0", fontSize: "2.5rem", fontWeight: "400", letterSpacing: "-0.02em" }}>My Journey</h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "1rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
            Every step you've taken so far.
          </p>
        </div>
        <Link to="/goals" className="btn-secondary">Back to Goals</Link>
      </header>

      <div style={{ position: "relative", width: "100%", height: `${svgHeight}px`, overflow: "hidden" }}>
        
        {/* Floating background particles */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: "4px", height: "4px",
            background: "rgba(167,139,250,0.4)",
            borderRadius: "50%",
            animation: `floatY ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}

        <svg width="100%" height={svgHeight} style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Base dashed path for upcoming */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="3" 
            strokeDasharray="8 8" 
          />
          
          {/* Solid gradient path overlay (would theoretically mask to completed nodes only) */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#journeyGrad)" 
            strokeWidth="4"
            className="journey-path-anim"
            style={{ strokeDasharray: 4000, strokeDashoffset: 4000, animation: "dash 2.5s ease-out forwards" }}
          />
          
          <defs>
            <linearGradient id="journeyGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            
            <style>
              {`
                @keyframes dash {
                  to { stroke-dashoffset: 0; }
                }
                .node-anim {
                  animation: bounceScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
              `}
            </style>
          </defs>

          {nodes.map((node, i) => (
            <g key={node.id} className="node-anim" style={{ animationDelay: `${0.2 * i}s` }}>
              <circle 
                cx={node.cx} 
                cy={node.cy} 
                r="24" 
                fill={node.completed ? "url(#journeyGrad)" : "rgba(255,255,255,0.05)"}
                stroke={node.completed ? "transparent" : "rgba(255,255,255,0.2)"}
                strokeWidth="2"
                strokeDasharray={node.completed ? "0" : "4 4"}
                style={{ cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.transformOrigin = `${node.cx}px ${node.cy}px`;
                  if (node.completed) e.target.style.filter = "drop-shadow(0 0 15px rgba(167,139,250,0.6))";
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.filter = "none";
                }}
              />
              {/* Text labels */}
              <text x={node.cx} y={node.cy + 45} textAnchor="middle" fill="#FFFFFF" fontSize="13px" fontWeight="600">
                {node.text}
              </text>
              {node.completed && (
                <text x={node.cx} y={node.cy + 65} textAnchor="middle" fill="#9B93BC" fontSize="11px">
                  {node.dueDate || "Completed"}
                </text>
              )}
            </g>
          ))}
        </svg>

      </div>
    </div>
  );
}
