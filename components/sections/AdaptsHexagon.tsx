"use client";
import { useState } from "react";

const STAGES = [
  {
    letter: "A",
    label: "Alert",
    color: "#0a2540",
    stage: "Stage 1",
    title: "Alert — Sensing disruption early",
    desc: "Spot warning signals before they become crises",
    expand:
      "Leaders with Alert strength recognize disruption before others do. They read weak signals in the market, culture, and operations — giving organizations the crucial head-start needed to respond rather than react.",
  },
  {
    letter: "D",
    label: "Diagnose",
    color: "#0d3060",
    stage: "Stage 2",
    title: "Diagnose — Framing the real challenge",
    desc: "Analyze root causes before deploying resources",
    expand:
      "Leaders with Diagnose strength prevent organizations from solving the wrong problem. They ask the harder questions and ensure teams understand what is actually breaking before action begins.",
  },
  {
    letter: "A",
    label: "Alignment",
    color: "#1557d4",
    stage: "Stage 3",
    title: "Alignment — Building shared direction",
    desc: "Create the shared purpose teams need to move",
    expand:
      "Leaders with Alignment strength eliminate competing agendas. They build the shared understanding that allows large, complex organizations to pull in one direction — even through ambiguity.",
  },
  {
    letter: "P",
    label: "Readiness",
    color: "#1a6bfa",
    stage: "Stage 4",
    title: "Readiness — Preparing for action",
    desc: "Equip people and systems before change launches",
    expand:
      "Leaders with Readiness strength ensure the organization is genuinely prepared before change is deployed. They identify gaps in capability, capacity, and confidence — reducing execution risk.",
  },
  {
    letter: "T",
    label: "Dialogue",
    color: "#4d8ef8",
    stage: "Stage 5",
    title: "Dialogue — Keeping conversation open",
    desc: "Drive feedback loops and early course-correction",
    expand:
      "Leaders with Dialogue strength prevent silent failures. They create environments where it is safe to surface problems early — keeping communication flowing and course-correcting in real time.",
  },
  {
    letter: "S",
    label: "Scale",
    color: "#93b8fb",
    stage: "Stage 6",
    title: "Scale — Embedding lasting change",
    desc: "Expand impact and make transformation stick",
    expand:
      "Leaders with Scale strength ensure transformation goes beyond the initial pilot. They institutionalize new behaviors, expand impact, and build systems that make change self-sustaining.",
  },
];

const TWO_PI = Math.PI * 2;
const CX = 220;
const CY = 220;
const R = 140; // inner hex radius (segments)
const LABEL_R = R + 44; // label ring

function pt(r: number, i: number, n: number) {
  const angle = -Math.PI / 2 + (TWO_PI * i) / n;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function hexPath(r: number, n: number) {
  return (
    Array.from({ length: n }, (_, i) => pt(r, i, n))
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + " Z"
  );
}

// One coloured wedge from center to outer edge
function wedge(i: number, n: number, r: number) {
  const a = pt(r, i, n);
  const b = pt(r, (i + 1) % n, n);
  const am = pt(r * 0.5, i, n);
  const bm = pt(r * 0.5, (i + 1) % n, n);
  // Slightly inset each side so gaps show between segments
  const gap = 2;
  const dx = ((CX - a.x) / r) * gap;
  const dy = ((CY - a.y) / r) * gap;
  return `M${(CX + dx).toFixed(1)},${(CY + dy).toFixed(1)} L${(a.x + dx).toFixed(1)},${(a.y + dy).toFixed(1)} L${(b.x + dx).toFixed(1)},${(b.y + dy).toFixed(1)} Z`;
}

// Label anchor — push text a bit further for readability
function labelAnchor(i: number, n: number) {
  const angle = -Math.PI / 2 + (TWO_PI * i) / n;
  const x = CX + LABEL_R * Math.cos(angle);
  const y = CY + LABEL_R * Math.sin(angle);
  const anchor = (
    Math.abs(Math.cos(angle)) < 0.1
      ? "middle"
      : Math.cos(angle) > 0
        ? "start"
        : "end"
  ) as "middle" | "start" | "end";
  return { x, y, anchor };
}

export default function AdaptsHexagon() {
  const [active, setActive] = useState<number | null>(null);
  const n = STAGES.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        alignItems: "start",
      }}
    >
      {/* ── SVG ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg
          viewBox="0 0 440 440"
          style={{
            width: "100%",
            maxWidth: 440,
            height: "auto",
            userSelect: "none",
          }}
          aria-label="ADAPTS framework hexagon"
        >
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <path
              key={f}
              d={hexPath(R * f, n)}
              fill="none"
              stroke={f === 1 ? "var(--border)" : "var(--border)"}
              strokeWidth={f === 1 ? 1.5 : 0.8}
              opacity={0.6}
            />
          ))}

          {/* Spokes */}
          {Array.from({ length: n }, (_, i) => {
            const p = pt(R, i, n);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke="var(--border)"
                strokeWidth={0.8}
                opacity={0.5}
              />
            );
          })}

          {/* ── ALWAYS-VISIBLE COLOURED SEGMENTS ── */}
          {STAGES.map((s, i) => {
            const isActive = active === i;
            return (
              <path
                key={i}
                d={wedge(i, n, R)}
                fill={s.color}
                opacity={isActive ? 0.95 : 0.55}
                onClick={() => setActive(active === i ? null : i)}
                style={{ cursor: "pointer", transition: "opacity .22s" }}
              >
                <title>{s.label}</title>
              </path>
            );
          })}

          {/* Radar fill overlay */}
          <path
            d={hexPath(R * 0.72, n)}
            fill="rgba(255,255,255,.06)"
            stroke="rgba(255,255,255,.25)"
            strokeWidth={1}
            pointerEvents="none"
          />

          {/* Active segment bright ring */}
          {active !== null && (
            <path
              d={hexPath(R, n)}
              fill="none"
              stroke={STAGES[active].color}
              strokeWidth={2.5}
              opacity={0.7}
              pointerEvents="none"
              style={{
                filter: `drop-shadow(0 0 6px ${STAGES[active].color}88)`,
              }}
            />
          )}

          {/* Center text */}
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fontFamily="Inter,sans-serif"
            fill="white"
            opacity={0.7}
            letterSpacing={2}
          >
            ADAPTS
          </text>
          <text
            x={CX}
            y={CY + 10}
            textAnchor="middle"
            fontSize={9}
            fontFamily="Inter,sans-serif"
            fill="white"
            opacity={0.45}
          >
            framework
          </text>

          {/* ── ALWAYS-VISIBLE LABELS outside each vertex ── */}
          {STAGES.map((s, i) => {
            const { x, y, anchor } = labelAnchor(i, n);
            const isActive = active === i;
            return (
              <g
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                style={{ cursor: "pointer" }}
              >
                {/* Connector dot at vertex */}
                <circle
                  cx={pt(R + 6, i, n).x}
                  cy={pt(R + 6, i, n).y}
                  r={4}
                  fill={s.color}
                  opacity={isActive ? 1 : 0.7}
                />
                {/* Stage label */}
                <text
                  x={x}
                  y={y - 7}
                  textAnchor={anchor}
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="Inter, sans-serif"
                  fill={s.color}
                  opacity={isActive ? 1 : 0.85}
                  style={{ transition: "opacity .2s" }}
                >
                  {s.label}
                </text>
                {/* Short desc under label */}
                <text
                  x={x}
                  y={y + 8}
                  textAnchor={anchor}
                  fontSize={9}
                  fontFamily="Inter, sans-serif"
                  fill="var(--text-3)"
                  opacity={isActive ? 1 : 0.65}
                  style={{ transition: "opacity .2s" }}
                >
                  {s.stage}
                </text>
              </g>
            );
          })}
        </svg>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-4)",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Click any segment to explore
        </p>
      </div>

      {/* ── RIGHT PANEL — all stages always visible ── */}
      <div style={{ paddingTop: 4 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--blue)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: 10,
          }}
        >
          What is Change Genius?
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text-1)",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            marginBottom: 12,
          }}
        >
          The ADAPTS Framework
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 22,
          }}
        >
          Six stages that map how leaders and teams navigate the full arc of
          organizational transformation. Each stage represents a distinct change
          capability.
        </p>

        {/* All 6 stages always expanded */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STAGES.map((s, i) => {
            const isActive = active === i;
            return (
              <div
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  borderRadius: 10,
                  border: `1.5px solid ${isActive ? s.color : "var(--border)"}`,
                  background: isActive ? `${s.color}0d` : "white",
                  padding: isActive ? "14px 16px" : "10px 16px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {/* Always-visible header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: s.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {s.letter}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isActive ? s.color : "var(--text-1)",
                        }}
                      >
                        {s.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-4)",
                          fontWeight: 500,
                        }}
                      >
                        {s.stage}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        marginTop: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: isActive ? s.color : "var(--text-4)",
                      transition: "transform .2s",
                      transform: isActive ? "rotate(180deg)" : "none",
                      flexShrink: 0,
                    }}
                  >
                    ⌄
                  </div>
                </div>
                {/* Expanded detail — only when active */}
                {isActive && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-2)",
                      lineHeight: 1.65,
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: `1px solid ${s.color}22`,
                    }}
                  >
                    {s.expand}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button className="outline-btn" style={{ marginTop: 20 }}>
          <span className="outline-btn-text">Explore all six stages</span>
          <span className="outline-btn-arr">›</span>
        </button>
      </div>
    </div>
  );
}

export { STAGES };
