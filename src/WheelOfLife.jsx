import React, { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// ─── Theme tokens ───────────────────────────────────────────────────────────
const T = {
  bg:           '#1a1033',
  bgCard:       'rgba(255,255,255,0.04)',
  cream:        '#F5F0E8',
  creamMuted:   'rgba(245,240,232,0.55)',
  creamSubtle:  'rgba(245,240,232,0.12)',
  border:       'rgba(245,240,232,0.13)',
  accent:       '#7C5CFC',
  accentFill:   'rgba(124,92,252,0.22)',
  accentGlow:   'rgba(124,92,252,0.45)',
};

// ─── Dimensions ──────────────────────────────────────────────────────────────
const DIMENSIONS = [
  { key: 'career',        label: 'Career',        emoji: '💼' },
  { key: 'business',      label: 'Business',      emoji: '🏢' },
  { key: 'fun',           label: 'Fun',           emoji: '🎉' },
  { key: 'creativity',    label: 'Creativity',    emoji: '🎨' },
  { key: 'health',        label: 'Health',        emoji: '💪' },
  { key: 'academics',     label: 'Academics',     emoji: '📚' },
  { key: 'finance',       label: 'Finance',       emoji: '💰' },
  { key: 'relationships', label: 'Relationships', emoji: '🤝' },
];

const INITIAL_VALUES = Object.fromEntries(DIMENSIONS.map(d => [d.key, 5]));

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { subject, value } = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(26,16,51,0.96)',
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${T.accent}`,
      borderRadius: 10,
      padding: '8px 14px',
      color: T.cream,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5)`,
    }}>
      {subject}: <span style={{ color: T.accent }}>{value}/10</span>
    </div>
  );
};

// ─── Custom Polar Angle Label ────────────────────────────────────────────────
const CustomAxisTick = ({ x, y, payload }) => {
  const dim = DIMENSIONS.find(d => d.label === payload.value);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={T.creamMuted}
      fontSize={11}
      fontWeight={600}
      fontFamily="Inter, system-ui, sans-serif"
      letterSpacing="0.04em"
    >
      {dim ? `${dim.emoji} ${dim.label}` : payload.value}
    </text>
  );
};

// ─── Slider Row ──────────────────────────────────────────────────────────────
const SliderRow = ({ dimension, value, onChange }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}>
    {/* Label */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      width: 140,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 16 }}>{dimension.emoji}</span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: T.creamMuted,
        fontFamily: 'Inter, system-ui, sans-serif',
        letterSpacing: '0.02em',
      }}>
        {dimension.label}
      </span>
    </div>

    {/* Track + Thumb */}
    <div style={{ flex: 1, position: 'relative' }}>
      {/* Filled track overlay */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${value * 10}%`,
        height: 6,
        borderRadius: 3,
        background: `linear-gradient(90deg, ${T.accent}, #A78BFA)`,
        pointerEvents: 'none',
        transition: 'width 0.15s ease',
        zIndex: 1,
      }} />
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={e => onChange(dimension.key, Number(e.target.value))}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: T.creamSubtle,
          outline: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2,
          // Thumb styles via inline CSS vars — see <style> below
        }}
      />
    </div>

    {/* Score badge */}
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      background: value >= 7
        ? `rgba(124,92,252,0.22)`
        : value >= 4
        ? `rgba(245,240,232,0.07)`
        : `rgba(240,90,126,0.12)`,
      border: `1px solid ${value >= 7 ? T.accent : T.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s ease',
    }}>
      <span style={{
        fontSize: 13,
        fontWeight: 800,
        color: value >= 7 ? T.accent : value >= 4 ? T.cream : '#F05A7E',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WheelOfLife = () => {
  const [values, setValues] = useState(INITIAL_VALUES);

  const handleChange = (key, val) =>
    setValues(prev => ({ ...prev, [key]: val }));

  const chartData = DIMENSIONS.map(d => ({
    subject: d.label,
    value:   values[d.key],
    fullMark: 10,
  }));

  const average = (
    Object.values(values).reduce((a, b) => a + b, 0) / DIMENSIONS.length
  ).toFixed(1);

  return (
    <>
      {/* Global slider thumb styles — scoped to this component's class */}
      <style>{`
        .wol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${T.cream};
          border: 3px solid ${T.accent};
          box-shadow: 0 0 10px ${T.accentGlow};
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative;
          z-index: 3;
        }
        .wol-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 0 18px ${T.accentGlow};
        }
        .wol-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${T.cream};
          border: 3px solid ${T.accent};
          cursor: pointer;
        }
      `}</style>

      <div style={{
        background: T.bg,
        borderRadius: 24,
        padding: 32,
        border: `1px solid ${T.border}`,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: 860,
        margin: '0 auto',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{
              margin: '0 0 4px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: T.creamMuted,
            }}>
              Wheel of Life
            </p>
            <h2 style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: T.cream,
              letterSpacing: '-0.01em',
            }}>
              Life Balance Assessment
            </h2>
          </div>

          {/* Average score ring */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: 900,
              color: T.accent,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {average}
            </span>
            <span style={{ fontSize: 11, color: T.creamMuted, fontWeight: 600 }}>
              avg / 10
            </span>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{
          background: T.bgCard,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: '24px 16px 16px',
        }}>
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <PolarGrid
                stroke={T.border}
                strokeWidth={1}
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={<CustomAxisTick />}
                tickLine={false}
                axisLine={{ stroke: T.border }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fill: T.creamMuted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickCount={6}
              />
              <Radar
                name="Life Balance"
                dataKey="value"
                stroke={T.accent}
                strokeWidth={2.5}
                fill={T.accentFill}
                dot={{ fill: T.cream, r: 4, strokeWidth: 2, stroke: T.accent }}
                activeDot={{ fill: T.cream, r: 6, stroke: T.accent, strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="ease-out"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Sliders — 2-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px 32px',
        }}>
          {DIMENSIONS.map(dim => (
            <SliderRow
              key={dim.key}
              dimension={dim}
              value={values[dim.key]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Apply the thumb class to every slider */}
        {/* (done by patching the DOM via useEffect — or just add the class directly) */}
        <ApplySliderClass />

      </div>
    </>
  );
};

// Tiny helper — adds wol-slider class to every range input inside this tree
const ApplySliderClass = () => {
  React.useEffect(() => {
    document
      .querySelectorAll('input[type="range"]')
      .forEach(el => el.classList.add('wol-slider'));
  });
  return null;
};

export default WheelOfLife;
