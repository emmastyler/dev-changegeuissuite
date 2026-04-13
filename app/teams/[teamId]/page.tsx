"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Member {
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
  members: Member[];
  diagnostic: any;
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!teamId || !isAuthenticated) return;
    fetch(`/api/teams/report?teamId=${teamId}`)
      .then((res) => res.json())
      .then((data) => {
        setTeam(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teamId, isAuthenticated]);

  const copyInviteLink = () => {
    if (team?.inviteLink) {
      navigator.clipboard.writeText(team.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const purchaseTeamReport = async () => {
    setPurchasing(true);
    const res = await fetch("/api/team-report/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPurchasing(false);
  };

  if (loading || authLoading)
    return <div style={{ padding: 40 }}>Loading...</div>;
  if (!team) return <div style={{ padding: 40 }}>Team not found</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)", padding: 24 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/teams"
          style={{ color: "var(--blue)", textDecoration: "none" }}
        >
          ← Back to Teams
        </Link>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 16 }}>
          {team.name}
        </h1>
        {team.organization && (
          <p style={{ color: "var(--text-3)" }}>{team.organization}</p>
        )}

        {team.isOwner && (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              marginTop: 24,
            }}
          >
            <h3>Invite Team Members</h3>
            <p style={{ marginBottom: 12 }}>
              Share this link – anyone who clicks will be added to your team (no
              payment required).
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <code
                style={{
                  background: "var(--off)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  wordBreak: "break-all",
                  flex: 1,
                }}
              >
                {team.inviteLink}
              </code>
              <button
                onClick={copyInviteLink}
                style={{
                  background: "var(--blue)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 100,
                  cursor: "pointer",
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 12 }}>
              Invite code: <strong>{team.inviteCode}</strong>
            </p>
          </div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            marginTop: 24,
          }}
        >
          <h3>Members ({team.totalMembers})</h3>
          <div style={{ marginTop: 12 }}>
            {team.members.map((m) => (
              <div
                key={m.userId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>{m.fullName}</span>
                <span
                  style={{
                    color:
                      m.status === "completed" ? "#16a34a" : "var(--text-4)",
                  }}
                >
                  {m.status === "completed"
                    ? "✓ Completed"
                    : m.status === "joined"
                      ? "Joined"
                      : "Invited"}
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            {team.completedCount}/{team.totalMembers} completed assessment
          </p>
        </div>

        {team.fullUnlocked && team.diagnostic ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              marginTop: 24,
            }}
          >
            <h3>Team Diagnostic Report</h3>
            <p>
              Risk Score: {team.diagnostic.riskScore} (
              {team.diagnostic.riskLevel})
            </p>
            <pre style={{ fontSize: 12, overflow: "auto", maxHeight: 300 }}>
              {JSON.stringify(team.diagnostic, null, 2)}
            </pre>
          </div>
        ) : team.unlocked ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              marginTop: 24,
              textAlign: "center",
            }}
          >
            <h3>Unlock Full Team Report</h3>
            <p>
              Your team has {team.completedCount} completed members. Upgrade to
              see friction patterns, change pods, and 90-day plan.
            </p>
            <button
              onClick={purchaseTeamReport}
              disabled={purchasing}
              style={{
                background: "var(--blue)",
                color: "white",
                padding: "10px 24px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
              }}
            >
              {purchasing ? "Redirecting..." : "Upgrade – $99"}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "#fef2f2",
              borderRadius: 16,
              padding: 24,
              marginTop: 24,
            }}
          >
            <p>
              Need {3 - team.completedCount} more completed members to unlock
              basic team insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
