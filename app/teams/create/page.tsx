"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function CreateTeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [memberCount, setMemberCount] = useState(3);
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!teamName || memberCount < 3) return;
    setLoading(true);
    router.push(
      `/payment?plan=team&teamName=${encodeURIComponent(teamName)}&teamSize=${memberCount}&organization=${encodeURIComponent(organization)}`,
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sage)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: 40,
          maxWidth: 500,
          width: "100%",
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Create a Team
        </h2>
        <p style={{ marginBottom: 24 }}>
          Your team will be created immediately after payment.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Team Name *
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
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
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Organization (optional)
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
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
          disabled={loading || !teamName}
          style={{
            width: "100%",
            background: "var(--blue)",
            color: "white",
            padding: 12,
            borderRadius: 100,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading
            ? "Redirecting..."
            : `Continue to Payment – $${memberCount * 24}`}
        </button>
      </div>
    </div>
  );
}
