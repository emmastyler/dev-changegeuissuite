import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { buildNarrative } from "@/lib/assessment/narratives";
import { BarChart } from "@/components/results/BarChart";
import { RadarChart } from "@/components/results/RadarChart";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPageById({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*, scores(*)")
    .eq("id", id)
    .single();

  if (error || !assessment || assessment.status !== "completed") {
    notFound();
  }

  const scores = assessment.scores;
  if (!scores) notFound();

  const derived = scores.derived;
  const narrative = buildNarrative(derived);
  const roleColor = ROLE_COLORS[derived.primary_role] ?? "#0a2540";
  const date = new Date(assessment.completed_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)" }}>
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
              <RadarChart stageScores={scores.stage_scores} />
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
              <BarChart scores={scores.stage_scores} colors={STAGE_COLORS} />
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
                  {derived.top_adapts_stages.map((s: string) => (
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
                  {derived.bottom_adapts_stages.map((s: string) => (
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
          <BarChart scores={scores.role_scores} colors={ROLE_COLORS} />
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
          <BarChart scores={scores.energy_scores} colors={ENERGY_COLORS} />
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
              {narrative.energy_summary}
            </span>
          </div>
        </div>

        {/* NARRATIVE 2x2 - using correct properties */}
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
              The {narrative.role_name}
            </h3>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.role_summary}
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-2)",
                lineHeight: 1.75,
                marginTop: 12,
              }}
            >
              {narrative.role_detailed}
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
              {narrative.energy_name} Energy
            </h3>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}
            >
              {narrative.energy_summary}
            </p>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-2)",
                lineHeight: 1.75,
                marginTop: 12,
              }}
            >
              {narrative.energy_detailed}
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
              {narrative.adapts_strengths_detailed}
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
              {narrative.adapts_growth_detailed}
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
            {narrative.next_30_days.map((action: string, i: number) => (
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
            href={`/share?aid=${assessment.id}`}
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
            href={`/api/pdf/individual?aid=${assessment.id}`}
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
      </div>
    </div>
  );
}
