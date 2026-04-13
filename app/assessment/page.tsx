"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function AssessmentPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/assessment");
      return;
    }
    // If profile exists but has_paid is false, refresh session once
    if (profile && !profile.has_paid && !refreshing) {
      const refreshAndCheck = async () => {
        setRefreshing(true);
        await getSupabase().auth.refreshSession();
        window.location.reload();
      };
      refreshAndCheck();
      return;
    }
  }, [loading, isAuthenticated, profile, router, refreshing]);

  if (loading || refreshing) {
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
        <div style={{ fontSize: 14, color: "var(--text-3)" }}>Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  if (!profile.has_paid) {
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
            borderRadius: "var(--radius)",
            padding: "52px 48px",
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--navy)",
              marginBottom: 10,
            }}
          >
            Assessment locked
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-3)",
              lineHeight: 1.65,
              marginBottom: 28,
            }}
          >
            A one-time payment of $24 unlocks your assessment.
          </p>
          <Link
            href="/payment?plan=individual"
            style={{
              display: "inline-flex",
              background: "var(--blue)",
              color: "white",
              padding: "12px 28px",
              borderRadius: "100px",
              textDecoration: "none",
            }}
          >
            Unlock Assessment — $24 →
          </Link>
        </div>
      </div>
    );
  }

  // Rest of your assessment page (already existing)
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
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.6)",
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
        </div>
      </div>
      <div className="page">
        <div className="card" style={{ padding: 52 }}>
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
            Change Genius™ Assessment
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "var(--text-1)",
              letterSpacing: "-1px",
              marginBottom: 14,
            }}
          >
            Discover Your Change Genius™ Role
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-2)",
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 560,
            }}
          >
            60 behavioural questions. 8–10 minutes.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            {[
              ["📋", "60 Questions"],
              ["⏱️", "8–10 Minutes"],
              ["🔒", "Private results"],
              ["📥", "Download & share"],
            ].map(([icon, label]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-2)",
                  background: "var(--off)",
                  padding: "7px 14px",
                  borderRadius: "100px",
                  border: "1px solid var(--border)",
                }}
              >
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </div>
          <Link
            href="/assessment/take"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--blue)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              padding: "14px 32px",
              borderRadius: "100px",
              textDecoration: "none",
            }}
          >
            Begin Assessment →
          </Link>
          <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 14 }}>
            ✓ Paid · Lifetime access to your results
          </p>
        </div>
      </div>
    </div>
  );
}
