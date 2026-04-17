"use client";

import { STAGES } from "@/lib/assessment/questions";

const STAGE_SHORT: Record<string, string> = {
  "Alert the System": "Alert",
  "Diagnose the Gaps": "Diagnose",
  "Access Readiness": "Readiness",
  "Participate Through Dialogue": "Dialogue",
  "Transform Through Alignment": "Transform",
  "Scale and Sustain": "Scale",
};

const STAGE_COLORS: Record<string, string> = {
  "Alert the System": "#0a2540",
  "Diagnose the Gaps": "#0d3060",
  "Access Readiness": "#1557d4",
  "Participate Through Dialogue": "#1a6bfa",
  "Transform Through Alignment": "#4d8ef8",
  "Scale and Sustain": "#93b8fb",
};

interface RadarChartProps {
  stageScores: Record<string, number>;
}

export function RadarChart({ stageScores }: RadarChartProps) {
  const n = STAGES.length,
    cx = 160,
    cy = 160,
    r = 115;
  const TWO_PI = Math.PI * 2;

  function pt(radius: number, i: number) {
    const a = -Math.PI / 2 + (TWO_PI * i) / n;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  function ring(frac: number) {
    return (
      STAGES.map((_, i) => {
        const p = pt(r * frac, i);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ") + " Z"
    );
  }

  const scorePath =
    STAGES.map((s, i) => {
      const p = pt(r * Math.max(0.05, (stageScores[s] ?? 0) / 100), i);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ") + " Z";

  return (
    <svg
      viewBox="0 0 320 320"
      style={{ width: "100%", maxWidth: 300, height: "auto" }}
    >
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <path
          key={f}
          d={ring(f)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={f === 1 ? 1.5 : 0.8}
          opacity={0.5}
        />
      ))}

      {/* Spokes */}
      {STAGES.map((_, i) => {
        const p = pt(r, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--border)"
            strokeWidth={0.8}
            opacity={0.4}
          />
        );
      })}

      {/* Score polygon */}
      <path
        d={scorePath}
        fill="rgba(26,107,250,.15)"
        stroke="var(--blue)"
        strokeWidth={2}
      />

      {/* Stage labels */}
      {STAGES.map((s, i) => {
        const p = pt(r + 22, i),
          a = -Math.PI / 2 + (TWO_PI * i) / n;
        const anchor = (
          Math.abs(Math.cos(a)) < 0.15
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end"
        ) as "middle" | "start" | "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="central"
            fontSize={9}
            fontWeight={600}
            fontFamily="Inter,sans-serif"
            fill="var(--text-3)"
          >
            {STAGE_SHORT[s]}
          </text>
        );
      })}

      {/* Score dots */}
      {STAGES.map((s, i) => {
        const p = pt(r * Math.max(0.05, (stageScores[s] ?? 0) / 100), i);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={STAGE_COLORS[s] ?? "var(--blue)"}
          />
        );
      })}

      {/* Center label */}
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fontSize={9}
        fontFamily="Inter,sans-serif"
        fill="var(--text-4)"
        letterSpacing={1}
      >
        ADAPTS
      </text>
    </svg>
  );
}
