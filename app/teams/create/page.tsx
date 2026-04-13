"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function CreateTeamPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [memberCount, setMemberCount] = useState(3);
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState("");

  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) {
    router.push("/login?returnUrl=/teams/create");
    return null;
  }

  const total = memberCount * 24;

  const handleSubmit = () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (memberCount < 3) {
      setError("Minimum 3 members required");
      return;
    }
    const params = new URLSearchParams({
      plan: "team",
      teamName: teamName.trim(),
      teamSize: String(memberCount),
      organization: organization.trim(),
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sage)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Link
          href="/dashboard"
          style={{ color: "var(--blue)", textDecoration: "none" }}
        >
          ← Dashboard
        </Link>
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: 40,
            marginTop: 24,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Create a Team
          </h2>
          <p style={{ marginBottom: 24, color: "var(--text-3)" }}>
            You pay once for all members. They get free access.
          </p>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                color: "#dc2626",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
            >
              Team Name *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Leadership Team Q3"
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
            >
              Number of Members (min. 3)
            </label>
            <input
              type="number"
              min={3}
              value={memberCount}
              onChange={(e) =>
                setMemberCount(Math.max(3, parseInt(e.target.value) || 3))
              }
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
            >
              Organization (optional)
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Acme Corp"
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              background: "var(--blue)",
              color: "white",
              padding: 12,
              borderRadius: 100,
              border: "none",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Continue to Payment – ${total}
          </button>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-4)",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            One-time payment · No subscription
          </p>
        </div>
      </div>
    </div>
  );
}
