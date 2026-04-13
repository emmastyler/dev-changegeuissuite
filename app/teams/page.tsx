"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface TeamMember {
  userId: string;
  fullName: string;
  status: string;
  role: string | null;
}
interface Team {
  id: string;
  name: string;
  organization: string | null;
  inviteCode: string;
  inviteLink: string;
  isOwner: boolean;
  totalMembers: number;
  completedCount: number;
  unlocked: boolean;
  fullUnlocked: boolean;
  nextThreshold: number | null;
  members: TeamMember[];
  diagnostic: {
    riskScore: number;
    riskLevel: string;
    roleDistribution: Record<string, number>;
    stageScores: Record<string, number>;
    stageHealth: Record<string, string>;
    missingRoles: string[];
    frictionPatterns: string[];
    rollout90Days: string[];
    changePods: { name: string; focus: string; reason: string }[];
  } | null;
}

const ROLES = [
  "Innovator",
  "Achiever",
  "Organizer",
  "Unifier",
  "Builder",
  "Refiner",
];
const STAGES = [
  "Alert the System",
  "Diagnose the Gaps",
  "Access Readiness",
  "Participate Through Dialogue",
  "Transform Through Alignment",
  "Scale and Sustain",
];
const STAGE_SHORT: Record<string, string> = {
  "Alert the System": "Alert",
  "Diagnose the Gaps": "Diagnose",
  "Access Readiness": "Readiness",
  "Participate Through Dialogue": "Dialogue",
  "Transform Through Alignment": "Alignment",
  "Scale and Sustain": "Scale",
};
const HEALTH_COLORS: Record<string, string> = {
  Strong: "#16a34a",
  Adequate: "#2563eb",
  "At Risk": "#d97706",
  Critical: "#dc2626",
};
const STATUS_COLORS: Record<string, string> = {
  invited: "var(--text-4)",
  joined: "var(--blue)",
  completed: "#16a34a",
};

export default function TeamsPage() {
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [teamName, setTeamName] = useState("");
  const [teamOrg, setTeamOrg] = useState("");
  const [creating, setCreating] = useState(false);

  // Invite form
  const [emailInput, setEmailInput] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.push("/login?returnUrl=/teams");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadTeams();
  }, [authLoading, isAuthenticated]);

  async function loadTeams() {
    setLoading(true);
    try {
      const res = await fetch("/api/teams/list");
      const data = (await res.json()) as { owned: any[] };
      const owned = data.owned ?? [];
      // Load full report for each team
      const enriched = await Promise.all(
        owned.map(async (t: any) => {
          const r = await fetch(`/api/teams/report?teamId=${t.id}`);
          return r.ok ? r.json() : t;
        }),
      );
      setTeams(enriched);
    } catch {
      setError("Failed to load teams");
    }
    setLoading(false);
  }

  async function createTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    setError("");
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: teamName,
        organization: teamOrg || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      setCreating(false);
      return;
    }
    // Redirect to payment with teamId and default team size (e.g., 3)
    router.push(
      `/payment?plan=team&teamId=${data.teamId}&teamName=${encodeURIComponent(teamName)}&teamSize=3`,
    );
  }

  async function sendInvites() {
    if (!activeTeam) return;
    const emails = emailInput
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
    if (!emails.length) return;
    setInviting(true);
    const res = await fetch("/api/teams/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: (activeTeam as any).team?.id ?? activeTeam.id,
        emails,
      }),
    });
    const data = (await res.json()) as any;
    setInviteResult(`Sent to ${emails.length} address(es).`);
    setEmailInput("");
    setInviting(false);
    setTimeout(() => setInviteResult(""), 4000);
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
        <div style={{ fontSize: 14, color: "var(--text-3)" }}>
          Loading teams…
        </div>
      </div>
    );

  if (!isAuthenticated) return null;

  // ✅ FIX: Only require payment, not assessment completion
  const canCreate = profile?.has_paid === true;

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)" }}>
      {/* Nav */}
      <div style={{ background: "var(--navy)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 20,
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
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.55)",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/results"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.55)",
              textDecoration: "none",
            }}
          >
            My Results
          </Link>
          <span style={{ fontSize: 13, color: "white", fontWeight: 600 }}>
            Teams
          </span>
        </div>
      </div>

      <div className="page">
        {/* Header */}
        <div
          style={{
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            padding: "44px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.35)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              Team Change Map™
            </div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.8px",
                marginBottom: 8,
              }}
            >
              Your Teams
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)" }}>
              Invite your team, unlock collective change intelligence.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setView(view === "create" ? "list" : "create")}
              style={{
                background: "var(--blue)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter,sans-serif",
              }}
            >
              {view === "create" ? "← Cancel" : "+ Create Team"}
            </button>
          )}
        </div>

        {/* Gate: not paid */}
        {!canCreate && (
          <div className="card" style={{ padding: 52, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 10,
              }}
            >
              Purchase required
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-3)",
                lineHeight: 1.65,
                marginBottom: 24,
              }}
            >
              You need to complete a payment before creating a team.
            </p>
            <Link
              href="/payment?plan=individual"
              style={{
                background: "var(--blue)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
              }}
            >
              Unlock Assessment →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "12px 18px",
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Create team form */}
        {view === "create" && canCreate && (
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
              New Team
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 480,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Team Name *
                </label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Leadership Team Q3"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1.5px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "Inter,sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Organisation (optional)
                </label>
                <input
                  value={teamOrg}
                  onChange={(e) => setTeamOrg(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1.5px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "Inter,sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={createTeam}
                disabled={creating || !teamName.trim()}
                style={{
                  background:
                    creating || !teamName.trim()
                      ? "var(--border)"
                      : "var(--blue)",
                  color:
                    creating || !teamName.trim() ? "var(--text-4)" : "white",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "12px 28px",
                  borderRadius: "100px",
                  border: "none",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontFamily: "Inter,sans-serif",
                  width: "fit-content",
                }}
              >
                {creating ? "Creating…" : "Create Team →"}
              </button>
            </div>
          </div>
        )}

        {/* Team list */}
        {canCreate && teams.length === 0 && view === "list" && (
          <div className="card" style={{ padding: 52, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>👥</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--navy)",
                marginBottom: 10,
              }}
            >
              No teams yet
            </h2>
            <p
              style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.65 }}
            >
              Create your first team and invite colleagues to unlock your Team
              Change Map™.
            </p>
          </div>
        )}

        {teams.map((teamData: any) => {
          const t = teamData.team ?? teamData;
          const d = teamData.diagnostic;
          const members: TeamMember[] = teamData.members ?? [];
          const completed = teamData.completedCount ?? 0;
          const total = teamData.totalMembers ?? 0;
          const unlocked = teamData.unlocked ?? false;
          const fullUnlocked = teamData.fullUnlocked ?? false;
          const next = teamData.nextThreshold;

          return (
            <div key={t.id} className="card" style={{ overflow: "hidden" }}>
              {/* Team header */}
              <div
                style={{
                  background: "var(--navy-mid)",
                  padding: "28px 36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.35)",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      marginBottom: 6,
                    }}
                  >
                    Team
                  </div>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    {t.name}
                  </h2>
                  {t.organization && (
                    <div
                      style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}
                    >
                      {t.organization}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    <div
                      style={{
                        background: "rgba(255,255,255,.1)",
                        borderRadius: "100px",
                        padding: "4px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {completed}/{total} completed
                    </div>
                    <div
                      style={{
                        background: fullUnlocked
                          ? "#16a34a"
                          : unlocked
                            ? "var(--blue)"
                            : "rgba(255,255,255,.15)",
                        borderRadius: "100px",
                        padding: "4px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {fullUnlocked
                        ? "✓ Full Report"
                        : unlocked
                          ? "✓ Basic View"
                          : `🔒 ${next} needed`}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: 200,
                      height: 4,
                      background: "rgba(255,255,255,.15)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "var(--blue)",
                        width: `${Math.min(100, (completed / 5) * 100)}%`,
                        transition: "width .4s ease",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: "28px 36px" }}>
                {/* Invite section */}
                <div
                  style={{
                    background: "var(--off)",
                    borderRadius: 10,
                    padding: "18px 20px",
                    marginBottom: 24,
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-2)",
                        marginBottom: 8,
                      }}
                    >
                      Invite link
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        background: "white",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "7px 12px",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {t.inviteLink}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <button
                      onClick={() => copyLink(t.inviteLink)}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "7px 16px",
                        background: copied ? "#16a34a" : "white",
                        color: copied ? "white" : "var(--navy)",
                        border: "1.5px solid var(--border)",
                        borderRadius: "100px",
                        cursor: "pointer",
                        fontFamily: "Inter,sans-serif",
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy link"}
                    </button>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-3)",
                      }}
                    >
                      Code:{" "}
                      <strong
                        style={{ color: "var(--navy)", letterSpacing: 2 }}
                      >
                        {t.inviteCode}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Email invite */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-2)",
                      marginBottom: 8,
                    }}
                  >
                    Invite by email
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="email@example.com, another@example.com"
                      onKeyDown={(e) => e.key === "Enter" && sendInvites()}
                      style={{
                        flex: 1,
                        minWidth: 220,
                        padding: "9px 14px",
                        border: "1.5px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 13,
                        fontFamily: "Inter,sans-serif",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={sendInvites}
                      disabled={inviting || !emailInput.trim()}
                      style={{
                        padding: "9px 20px",
                        background: "var(--blue)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Inter,sans-serif",
                        opacity: inviting ? 0.6 : 1,
                      }}
                    >
                      {inviting ? "Sending…" : "Send invites"}
                    </button>
                  </div>
                  {inviteResult && (
                    <div
                      style={{ fontSize: 12, color: "#16a34a", marginTop: 6 }}
                    >
                      ✓ {inviteResult}
                    </div>
                  )}
                </div>

                {/* Members list */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-2)",
                      marginBottom: 10,
                    }}
                  >
                    Members ({total})
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {members.map((m: TeamMember) => (
                      <div
                        key={m.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "9px 14px",
                          background: "var(--off)",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              STATUS_COLORS[m.status] ?? "var(--border)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-1)",
                            flex: 1,
                          }}
                        >
                          {m.fullName}
                        </span>
                        {m.role && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--blue)",
                              fontWeight: 600,
                            }}
                          >
                            {m.role}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            color: STATUS_COLORS[m.status],
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locked state */}
                {!unlocked && (
                  <div
                    style={{
                      background: "var(--blue-tint)",
                      border: "1px solid var(--blue-light)",
                      borderRadius: 10,
                      padding: "18px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>🔓</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--navy)",
                        marginBottom: 4,
                      }}
                    >
                      {next! - completed} more member
                      {next! - completed !== 1 ? "s" : ""} needed to unlock
                      insights
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                      Basic team view unlocks at 3 · Full diagnostics at 5
                    </div>
                  </div>
                )}

                {/* Diagnostic — basic view (3+ completed) */}
                {unlocked && d && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Risk score */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          background:
                            d.riskLevel === "Low"
                              ? "#f0fdf4"
                              : d.riskLevel === "Moderate"
                                ? "#fff7ed"
                                : "#fef2f2",
                          border: `1px solid ${d.riskLevel === "Low" ? "#bbf7d0" : d.riskLevel === "Moderate" ? "#fed7aa" : "#fecaca"}`,
                          borderRadius: 10,
                          padding: "18px 20px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "var(--text-4)",
                            marginBottom: 6,
                          }}
                        >
                          Team Risk
                        </div>
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: 900,
                            color:
                              HEALTH_COLORS[
                                d.riskLevel === "Low"
                                  ? "Strong"
                                  : d.riskLevel === "Moderate"
                                    ? "Adequate"
                                    : "Critical"
                              ],
                          }}
                        >
                          {d.riskScore}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--text-2)",
                          }}
                        >
                          {d.riskLevel}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "white",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: "18px 20px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "var(--text-4)",
                            marginBottom: 8,
                          }}
                        >
                          Missing Roles
                        </div>
                        {d.missingRoles.length === 0 ? (
                          <div
                            style={{
                              fontSize: 13,
                              color: "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            ✓ All roles covered
                          </div>
                        ) : (
                          d.missingRoles.map((r: string) => (
                            <div
                              key={r}
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#dc2626",
                                marginBottom: 2,
                              }}
                            >
                              ✗ {r}
                            </div>
                          ))
                        )}
                      </div>
                      <div
                        style={{
                          background: "white",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: "18px 20px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "var(--text-4)",
                            marginBottom: 8,
                          }}
                        >
                          Friction Patterns
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color:
                              d.frictionPatterns.length === 0
                                ? "#16a34a"
                                : "#d97706",
                          }}
                        >
                          {d.frictionPatterns.length}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                          detected
                        </div>
                      </div>
                    </div>

                    {/* ADAPTS stage health */}
                    <div
                      style={{
                        background: "white",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "20px 24px",
                      }}
                    >
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
                        ADAPTS Stage Coverage
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {STAGES.map((s) => {
                          const score = d.stageScores[s] ?? 0;
                          const health = d.stageHealth[s] ?? "Adequate";
                          return (
                            <div key={s}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "var(--text-2)",
                                  }}
                                >
                                  {STAGE_SHORT[s]}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color:
                                        HEALTH_COLORS[health] ?? "var(--blue)",
                                      background: `${HEALTH_COLORS[health]}18`,
                                      padding: "2px 8px",
                                      borderRadius: "100px",
                                    }}
                                  >
                                    {health}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 700,
                                      color: "var(--navy)",
                                      width: 28,
                                      textAlign: "right",
                                    }}
                                  >
                                    {score}
                                  </span>
                                </div>
                              </div>
                              <div
                                style={{
                                  height: 6,
                                  background: "var(--border)",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${score}%`,
                                    background:
                                      HEALTH_COLORS[health] ?? "var(--blue)",
                                    borderRadius: 3,
                                    transition: "width .6s ease",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Friction patterns — full unlock only */}
                    {fullUnlocked && d.frictionPatterns.length > 0 && (
                      <div
                        style={{
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          borderRadius: 10,
                          padding: "20px 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#ea580c",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            marginBottom: 14,
                          }}
                        >
                          Friction Patterns Detected
                        </div>
                        {d.frictionPatterns.map((p: string, i: number) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: 10,
                              marginBottom: 10,
                              paddingBottom: 10,
                              borderBottom:
                                i < d.frictionPatterns.length - 1
                                  ? "1px solid #fed7aa"
                                  : "none",
                            }}
                          >
                            <div style={{ fontSize: 16, flexShrink: 0 }}>⚠</div>
                            <p
                              style={{
                                fontSize: 13,
                                color: "#92400e",
                                lineHeight: 1.6,
                              }}
                            >
                              {p}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 90-day rollout — full unlock only */}
                    {fullUnlocked && (
                      <div
                        style={{
                          background: "var(--navy)",
                          borderRadius: 10,
                          padding: "24px 28px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "rgba(255,255,255,.4)",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            marginBottom: 14,
                          }}
                        >
                          90-Day Rollout Plan
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          {d.rollout90Days.map((item: string, i: number) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                gap: 12,
                                padding: "12px 16px",
                                background: "rgba(255,255,255,.06)",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "var(--blue)",
                                  color: "white",
                                  fontSize: 11,
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
                                }}
                              >
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
