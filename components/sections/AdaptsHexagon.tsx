"use client";
import { useState } from "react";

const STAGES = [
  {
    letter: "A",
    label: "Alert the System",
    color: "#0a2540",
    stage: "Stage 1",
    tagline: "👉 See what is changing early",
    title: "Alert the System",
    desc: "Recognize problems, opportunities, or shifts before they become crises.",
    expand:
      "Leaders with Alert the System strength recognize disruption before others do. They read weak signals in the market, culture, and operations — giving organizations the crucial head-start needed to respond rather than react.",
  },
  {
    letter: "D",
    label: "Diagnose the Gaps",
    color: "#0d3060",
    stage: "Stage 2",
    tagline: "👉 Understand what is really wrong",
    title: "Diagnose the Gaps",
    desc: "Identify the difference between where you are and where you need to be.",
    expand:
      "Leaders with Diagnose the Gaps strength prevent organizations from solving the wrong problem. They ask harder questions, challenge assumptions, and ensure teams understand what is actually breaking before action begins.",
  },
  {
    letter: "A",
    label: "Access Readiness",
    color: "#1557d4",
    stage: "Stage 3",
    tagline: "👉 Check if you are truly prepared",
    title: "Access Readiness",
    desc: "Evaluate your people, systems, resources, and willingness to change.",
    expand:
      "Leaders with Access Readiness strength ensure the organization is genuinely prepared before change is deployed. They identify gaps in capability, capacity, and confidence — reducing execution risk.",
  },
  {
    letter: "P",
    label: "Participate Through Dialogue",
    color: "#1a6bfa",
    stage: "Stage 4",
    tagline: "👉 Align people through conversation",
    title: "Participate Through Dialogue",
    desc: "Create shared understanding, trust, and clarity across everyone involved.",
    expand:
      "Leaders with Participate Through Dialogue strength prevent silent failures. They create environments where it is safe to surface problems early — keeping communication flowing and course-correcting in real time.",
  },
  {
    letter: "T",
    label: "Transform Through Alignment",
    color: "#4d8ef8",
    stage: "Stage 5",
    tagline: "👉 Execute with the right structure",
    title: "Transform Through Alignment",
    desc: "Align people, roles, priorities, and actions to drive real results.",
    expand:
      "Leaders with Transform Through Alignment strength eliminate competing agendas. They build shared understanding that allows large, complex organizations to pull in one direction — even through ambiguity.",
  },
  {
    letter: "S",
    label: "Scale and Sustain",
    color: "#93b8fb",
    stage: "Stage 6",
    tagline: "👉 Make it last and grow",
    title: "Scale and Sustain",
    desc: "Embed the change into systems, culture, and daily operations so it continues.",
    expand:
      "Leaders with Scale and Sustain strength ensure transformation goes beyond the initial pilot. They institutionalize new behaviors, expand impact, and build systems that make change self-sustaining.",
  },
];

const TWO_PI = Math.PI * 2;
const CX = 220;
const CY = 220;
const R = 140;
const LABEL_R = R + 48;

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

function wedge(i: number, n: number, r: number) {
  const a = pt(r, i, n);
  const b = pt(r, (i + 1) % n, n);
  const gap = 2;
  const dx = ((CX - a.x) / r) * gap;
  const dy = ((CY - a.y) / r) * gap;
  return `M${(CX + dx).toFixed(1)},${(CY + dy).toFixed(1)} L${(a.x + dx).toFixed(1)},${(a.y + dy).toFixed(1)} L${(b.x + dx).toFixed(1)},${(b.y + dy).toFixed(1)} Z`;
}

function labelAnchor(i: number, n: number) {
  const angle = -Math.PI / 2 + (TWO_PI * i) / n;
  const x = CX + LABEL_R * Math.cos(angle);
  const y = CY + LABEL_R * Math.sin(angle);
  const anchor = (
    Math.abs(Math.cos(angle)) < 0.15
      ? "middle"
      : Math.cos(angle) > 0
        ? "start"
        : "end"
  ) as "middle" | "start" | "end";
  return { x, y, anchor };
}

const SHORT: Record<string, string> = {
  "Alert the System": "Alert",
  "Diagnose the Gaps": "Diagnose",
  "Access Readiness": "Readiness",
  "Participate Through Dialogue": "Dialogue",
  "Transform Through Alignment": "Transform",
  "Scale and Sustain": "Scale",
};

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
      {/* ── SVG HEXAGON ── */}
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
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <path
              key={f}
              d={hexPath(R * f, n)}
              fill="none"
              stroke="var(--border)"
              strokeWidth={f === 1 ? 1.5 : 0.8}
              opacity={0.6}
            />
          ))}

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

          {STAGES.map((s, i) => (
            <path
              key={i}
              d={wedge(i, n, R)}
              fill={s.color}
              opacity={active === i ? 0.95 : 0.55}
              onClick={() => setActive(active === i ? null : i)}
              style={{ cursor: "pointer", transition: "opacity .22s" }}
            >
              <title>{s.label}</title>
            </path>
          ))}

          <path
            d={hexPath(R * 0.72, n)}
            fill="rgba(255,255,255,.06)"
            stroke="rgba(255,255,255,.25)"
            strokeWidth={1}
            pointerEvents="none"
          />

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

          {STAGES.map((s, i) => {
            const { x, y, anchor } = labelAnchor(i, n);
            const isActive = active === i;
            return (
              <g
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pt(R + 6, i, n).x}
                  cy={pt(R + 6, i, n).y}
                  r={4}
                  fill={s.color}
                  opacity={isActive ? 1 : 0.7}
                />
                <text
                  x={x}
                  y={y - 6}
                  textAnchor={anchor}
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="Inter, sans-serif"
                  fill={s.color}
                  opacity={isActive ? 1 : 0.85}
                  style={{ transition: "opacity .2s" }}
                >
                  {SHORT[s.label]}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor={anchor}
                  fontSize={8.5}
                  fontFamily="Inter, sans-serif"
                  fill="var(--text-3)"
                  opacity={isActive ? 1 : 0.6}
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

      {/* ── RIGHT PANEL ── */}
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
          The ADAPTS Framework
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
          Six stages of organizational change
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: 22,
          }}
        >
          Every transformation moves through six distinct stages. Understanding
          which stage your team is in — and what it needs — is the difference
          between change that stalls and change that scales.
        </p>

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
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: s.color,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    {s.letter}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--text-4)",
                        }}
                      >
                        {s.stage}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: isActive ? s.color : "var(--text-3)",
                          fontWeight: 600,
                        }}
                      >
                        {s.tagline}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive ? s.color : "var(--text-1)",
                        marginBottom: 2,
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        lineHeight: 1.45,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: isActive ? s.color : "var(--text-4)",
                      transition: "transform .2s",
                      transform: isActive ? "rotate(180deg)" : "none",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ⌄
                  </div>
                </div>

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
