"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { buildNarrative } from "@/lib/assessment/narratives";
import {
  STAGES,
  type Role,
  type AdaptsStage,
  type Energy,
} from "@/lib/assessment/questions";

interface ResultsData {
  assessmentId: string;
  completedAt: string;
  roleScores: Record<Role, number>;
  stageScores: Record<AdaptsStage, number>;
  energyScores: Record<Energy, number>;
  derived: {
    primary_role: Role;
    secondary_role: Role;
    role_pair_title: string;
    primary_energy: Energy;
    top_adapts_stages: AdaptsStage[];
    bottom_adapts_stages: AdaptsStage[];
  };
  profile: { full_name: string | null };
}

const ROLE_COLORS: Record<string, string> = {
  Innovator: "#0a2540",
  Achiever: "#1557d4",
  Organizer: "#1a6bfa",
  Unifier: "#4d8ef8",
  Builder: "#0d3060",
  Refiner: "#93b8fb",
};
const STAGE_COLORS: Record<string, string> = {
  "Alert the System": "#0a2540",
  "Diagnose the Gaps": "#0d3060",
  "Access Readiness": "#1557d4",
  "Participate Through Dialogue": "#1a6bfa",
  "Transform Through Alignment": "#4d8ef8",
  "Scale and Sustain": "#93b8fb",
};
const ENERGY_COLORS: Record<string, string> = {
  Spark: "#0a2540",
  Build: "#1557d4",
  Polish: "#1a6bfa",
  Bond: "#4d8ef8",
};

function BarChart({
  scores,
  colors,
}: {
  scores: Record<string, number>;
  colors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([name, score]) => (
          <div key={name}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-2)",
                }}
              >
                {name}
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}
              >
                {score}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--border)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${score}%`,
                  background: colors[name] ?? "var(--blue)",
                  borderRadius: 4,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}

function RadarChart({ stageScores }: { stageScores: Record<string, number> }) {
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
  const SHORT: Record<string, string> = {
    "Alert the System": "Alert",
    "Diagnose the Gaps": "Diagnose",
    "Access Readiness": "Readiness",
    "Participate Through Dialogue": "Dialogue",
    "Transform Through Alignment": "Transform",
    "Scale and Sustain": "Scale",
  };
  return (
    <svg
      viewBox="0 0 320 320"
      style={{ width: "100%", maxWidth: 300, height: "auto" }}
    >
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
      <path
        d={scorePath}
        fill="rgba(26,107,250,.15)"
        stroke="var(--blue)"
        strokeWidth={2}
      />
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
            {SHORT[s]}
          </text>
        );
      })}
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

export default function ResultsPage() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.push("/login?returnUrl=/results");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (profile && !profile.has_paid) {
      router.push("/payment?plan=individual");
      return;
    }
    fetch("/api/results")
      .then((r) => r.json())
      .then((d: ResultsData | { error: string }) => {
        if ("error" in d) {
          setError(d.error);
          setLoading(false);
          return;
        }
        setData(d as ResultsData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, [authLoading, isAuthenticated, profile, router]);

  const Nav = (
    <div style={{ background: "var(--navy)", padding: "0 24px" }}>
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "white",
            textDecoration: "none",
          }}
        >
          changegenius™
        </Link>
        <div style={{ display: "flex", gap: 20 }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.6)",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/teams"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.6)",
              textDecoration: "none",
            }}
          >
            Teams
          </Link>
        </div>
      </div>
    </div>
  );

  if (authLoading || loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 8 }}
          >
            Loading your results…
          </div>
          <div
            style={{
              width: 200,
              height: 3,
              background: "var(--border)",
              borderRadius: 2,
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--blue)",
                width: "60%",
                animation: "loadbar 1.2s ease infinite",
                borderRadius: 2,
              }}
            />
          </div>
        </div>
        <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      </div>
    );

  if (profile && !profile.has_paid) return null;

  if (!data) {
    const notTaken = error === "No completed assessment found";
    return (
      <div style={{ minHeight: "100vh", background: "var(--sage)" }}>
        {Nav}
        <div className="page">
          <div className="card" style={{ padding: 52, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {notTaken ? "📋" : "⚠️"}
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 12,
              }}
            >
              {notTaken ? "No results yet" : "Could not load results"}
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-3)",
                lineHeight: 1.65,
                marginBottom: 28,
              }}
            >
              {notTaken
                ? "Complete your assessment to see your Change Genius™ profile."
                : error}
            </p>
            <Link
              href="/assessment"
              style={{
                display: "inline-flex",
                background: "var(--blue)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
              }}
            >
              {notTaken ? "Take the Assessment →" : "Try Again"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { derived, roleScores, stageScores, energyScores } = data;
  const narrative = buildNarrative(derived);
  const roleColor = ROLE_COLORS[derived.primary_role] ?? "var(--navy)";
  const date = new Date(data.completedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)" }}>
      {Nav}
      <div className="page">
        {/* HERO */}
        <div
          style={{
            background: roleColor,
            borderRadius: "var(--radius)",
            padding: 52,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(255,255,255,.07)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.45)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 16,
              }}
            >
              Your Change Genius™ Profile · {date}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 32,
                alignItems: "flex-end",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(32px,5vw,56px)",
                    fontWeight: 900,
                    color: "white",
                    letterSpacing: "-2px",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {derived.primary_role}
                </h1>
                <div
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,.65)",
                    marginBottom: 14,
                  }}
                >
                  Secondary:{" "}
                  <strong style={{ color: "rgba(255,255,255,.88)" }}>
                    {derived.secondary_role}
                  </strong>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,.18)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: "100px",
                    marginBottom: 18,
                  }}
                >
                  {derived.role_pair_title}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,.7)",
                    lineHeight: 1.7,
                    maxWidth: 520,
                  }}
                >
                  {narrative.executive_summary}
                </p>
              </div>
              <div
                style={{
                  textAlign: "center",
                  background: "rgba(255,255,255,.1)",
                  borderRadius: 12,
                  padding: "20px 28px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.4)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 8,
                  }}
                >
                  Primary Energy
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "white" }}>
                  {derived.primary_energy}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MANDATORY UPSELL: Invite Your Team */}
        {!profile?.change_genius_role_2 && ( // show only if not already in a team? You can show always
          <div
            style={{
              background: "linear-gradient(135deg, #0a2540, #1a6bfa)",
              borderRadius: 24,
              padding: 40,
              marginTop: 32,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                marginBottom: 12,
              }}
            >
              Your Results Are Just the Beginning
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 24,
              }}
            >
              You now understand how you contribute to change.
              <br />
              The real breakthrough happens when your team is aligned.
            </p>
            <Link
              href="/teams/create"
              style={{
                display: "inline-block",
                background: "white",
                color: "#0a2540",
                fontSize: 16,
                fontWeight: 700,
                padding: "12px 32px",
                borderRadius: 100,
                textDecoration: "none",
              }}
            >
              Build Your Team Change Map™ →
            </Link>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 16,
              }}
            >
              Invite your team – $24 per person
            </p>
          </div>
        )}

        {/* ADAPTS RADAR + STAGES */}
        <div className="card" style={{ padding: 40 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 52,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--blue)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 16,
                }}
              >
                ADAPTS Stage Map
              </div>
              <RadarChart stageScores={stageScores} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--blue)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 16,
                }}
              >
                Stage Scores
              </div>
              <BarChart scores={stageScores} colors={STAGE_COLORS} />
              <div
                style={{
                  marginTop: 20,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "var(--blue-light)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    borderLeft: "3px solid var(--blue)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--blue)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 8,
                    }}
                  >
                    Top Strengths
                  </div>
                  {derived.top_adapts_stages.map((s) => (
                    <div
                      key={s}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--navy)",
                        marginBottom: 3,
                      }}
                    >
                      ✓ {s}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "#fff7ed",
                    borderRadius: 10,
                    padding: "14px 16px",
                    borderLeft: "3px solid #f97316",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#ea580c",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 8,
                    }}
                  >
                    Growth Areas
                  </div>
                  {derived.bottom_adapts_stages.map((s) => (
                    <div
                      key={s}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--navy)",
                        marginBottom: 3,
                      }}
                    >
                      ↑ {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROLE SCORES */}
        <div className="card" style={{ padding: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--blue)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 20,
            }}
          >
            All Role Scores
          </div>
          <BarChart scores={roleScores} colors={ROLE_COLORS} />
        </div>

        {/* ENERGY */}
        <div className="card" style={{ padding: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--blue)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 20,
            }}
          >
            Productivity Energy
          </div>
          <BarChart scores={energyScores} colors={ENERGY_COLORS} />
          <div
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: "var(--blue-tint)",
              borderRadius: 10,
              border: "1px solid var(--blue-light)",
            }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}
            >
              {derived.primary_energy} —{" "}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>
              {narrative.energy_profile}
            </span>
          </div>
        </div>

        {/* NARRATIVE 2x2 */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div className="card" style={{ padding: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--blue)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 12,
              }}
            >
              Role Profile
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 12,
              }}
            >
              The {derived.primary_role}
            </h3>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.role_profile}
            </p>
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--blue)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 12,
              }}
            >
              Energy Profile
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 12,
              }}
            >
              {derived.primary_energy} Energy
            </h3>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.energy_profile}
            </p>
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--blue)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 12,
              }}
            >
              ADAPTS Strengths
            </div>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.adapts_strengths}
            </p>
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#ea580c",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 12,
              }}
            >
              Growth Areas
            </div>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.adapts_growth}
            </p>
          </div>
        </div>

        {/* IN TEAM */}
        <div className="card" style={{ padding: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--blue)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 12,
            }}
          >
            You in a Team Context
          </div>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-2)",
              lineHeight: 1.75,
              maxWidth: 720,
            }}
          >
            {narrative.individual_in_team}
          </p>
        </div>

        {/* 30-DAY PLAN */}
        <div
          style={{
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,.4)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 12,
            }}
          >
            Your Next 30 Days
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 28,
              letterSpacing: "-0.5px",
            }}
          >
            Four actions to apply your strengths
          </h2>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {narrative.next_30_days.map((action, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--blue)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.72)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <Link
            href="/share"
            style={{
              background: "white",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              padding: "28px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>🪪</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: 6,
              }}
            >
              Share Card
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}
            >
              Generate your professional Change Genius™ identity card for
              LinkedIn.
            </div>
          </Link>
          <a
            href="/api/pdf/individual"
            style={{
              background: "white",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              padding: "28px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: 6,
              }}
            >
              Download PDF
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}
            >
              Download your full individual report as a professional PDF.
            </div>
          </a>
          <Link
            href="/teams"
            style={{
              background: "var(--blue)",
              borderRadius: "var(--radius)",
              padding: "28px 24px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>👥</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "white",
                marginBottom: 6,
              }}
            >
              Build Your Team Map
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.7)",
                lineHeight: 1.5,
              }}
            >
              Invite your team and unlock collective change intelligence.
            </div>
          </Link>
        </div>
        {/* UPSELL: Invite Your Team – MANDATORY */}
        <div
          style={{
            background: "linear-gradient(135deg, #0a2540 0%, #1a6bfa 100%)",
            borderRadius: "var(--radius)",
            padding: "48px 40px",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "white",
              marginBottom: 12,
            }}
          >
            Your Results Are Just the Beginning
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 24,
            }}
          >
            You now understand how you contribute to change.
            <br />
            The real breakthrough happens when your team is aligned.
          </p>
          <Link
            href="/teams/create"
            style={{
              display: "inline-block",
              background: "white",
              color: "#0a2540",
              fontSize: 18,
              fontWeight: 700,
              padding: "14px 40px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            Build Your Team Change Map™ →
          </Link>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              marginTop: 16,
            }}
          >
            Invite your team – $24 per person
          </p>
        </div>

        {/* UPSELL: Advanced Report */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius)",
            border: "2px solid var(--blue)",
            padding: "32px 40px",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--navy)",
              marginBottom: 8,
            }}
          >
            Unlock Your Full Leadership Blueprint
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20 }}>
            Deeper ADAPTS breakdown · Blind spot analysis · Leadership growth
            plan · Role interaction insights
          </p>
          <Link
            href="/payment?plan=advanced_report"
            style={{
              display: "inline-block",
              background: "var(--blue)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              padding: "12px 32px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            Upgrade – $15
          </Link>
        </div>
      </div>
    </div>
  );
}
