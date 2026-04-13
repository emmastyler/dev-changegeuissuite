"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface AssessmentHistory {
  id: string;
  completed_at: string;
  derived: {
    primary_role: string;
    secondary_role: string;
    role_pair_title: string;
  };
}

export default function AssessmentHistoryPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/assessment/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.assessments || []);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, [isAuthenticated]);

  if (loading || loadingHistory) {
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
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)", padding: 40 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/dashboard"
          style={{ color: "var(--blue)", textDecoration: "none" }}
        >
          ← Dashboard
        </Link>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          Assessment History
        </h1>
        <p style={{ color: "var(--text-3)", marginBottom: 32 }}>
          All the assessments you've completed.
        </p>

        {history.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 48,
              textAlign: "center",
            }}
          >
            <p>No past assessments found.</p>
            <Link
              href="/assessment"
              style={{ color: "var(--blue)", textDecoration: "underline" }}
            >
              Take your first assessment →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {history.map((assessment, idx) => (
              <div
                key={assessment.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 24,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 20,
                        color: "var(--navy)",
                      }}
                    >
                      {assessment.derived.primary_role} +{" "}
                      {assessment.derived.secondary_role}
                    </div>
                    <div
                      style={{
                        color: "var(--text-3)",
                        fontSize: 14,
                        marginTop: 4,
                      }}
                    >
                      {assessment.derived.role_pair_title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-4)",
                        marginTop: 8,
                      }}
                    >
                      Completed:{" "}
                      {new Date(assessment.completed_at).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/results/${assessment.id}`}
                    style={{
                      background: "var(--blue)",
                      color: "white",
                      padding: "8px 20px",
                      borderRadius: 100,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    View Full Results →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
