"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

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
  members: Array<{
    userId: string;
    fullName: string;
    status: string;
    role: string | null;
  }>;
  diagnostic: any;
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
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
        <p style={{ color: "var(--text-3)" }}>
          {team.organization || "No organization"}
        </p>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            marginTop: 24,
          }}
        >
          <h3>Team Members</h3>
          <p>
            {team.completedCount}/{team.totalMembers} completed assessment
          </p>
          <ul>
            {team.members.map((m) => (
              <li key={m.userId}>
                {m.fullName} – {m.status}
              </li>
            ))}
          </ul>
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
            <pre style={{ fontSize: 12, overflow: "auto" }}>
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
