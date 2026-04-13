"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";

export default function DashboardPage() {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasInProgress, setHasInProgress] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?returnUrl=/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && profile?.has_paid) {
      fetch("/api/assessment/status")
        .then((res) => res.json())
        .then((data) => setHasInProgress(data.hasInProgress))
        .catch(() => setHasInProgress(false));
    }
  }, [isAuthenticated, profile?.has_paid]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading) {
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

  if (!isAuthenticated) return null;

  const hasPaid = profile?.has_paid ?? false;
  const onboarded = profile?.onboarded ?? false;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/assessment", label: "Assessment", icon: "📋" },
    { href: "/results", label: "My Results", icon: "📊" },
    { href: "/teams", label: "My Teams", icon: "👥" },
    { href: "/pulse", label: "Weekly Pulse", icon: "📡" },
  ];

  const assessmentCard = hasPaid
    ? {
        href: "/assessment",
        title: onboarded ? "Retake Assessment" : "Take Assessment",
        desc: "Discover your Change Genius™ role",
        badge: null,
      }
    : {
        href: "/payment?plan=individual",
        title: "Unlock Assessment",
        desc: "$24 one-time · Lifetime access",
        badge: "🔒",
      };

  const quickCards = [
    assessmentCard,
    {
      href: "/results",
      title: "My Results",
      desc: "View your ADAPTS stage profile",
      badge: hasPaid ? null : "🔒",
    },
    {
      href: "/teams",
      title: "My Teams",
      desc: "Build your Team Change Map™",
      badge: null,
    },
    {
      href: "/pulse",
      title: "Weekly Pulse",
      desc: "This week's check-in",
      badge: hasPaid ? null : "🔒",
    },
  ];

  // Determine assessment status text
  let assessmentStatusText = "Not yet purchased";
  if (hasPaid) {
    if (onboarded) {
      assessmentStatusText = "Completed";
    } else if (hasInProgress) {
      assessmentStatusText = "Started — in progress";
    } else {
      assessmentStatusText = "Purchased — not started";
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sage)" }}>
      {/* Top nav */}
      <div
        style={{
          background: "var(--navy)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 20px",
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              textDecoration: "none",
              letterSpacing: "-0.4px",
              marginRight: 20,
            }}
          >
            changegenius™
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.6)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.6)",
                background: "none",
                border: "1px solid rgba(255,255,255,.15)",
                padding: "6px 14px",
                borderRadius: "100px",
                cursor: "pointer",
                fontFamily: "Inter,sans-serif",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="page">
        {/* Welcome header */}
        <div
          style={{
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            padding: "44px 52px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(26,107,250,.12)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.36)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              Dashboard
            </div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.15,
                letterSpacing: "-0.8px",
                marginBottom: 8,
              }}
            >
              Welcome back
              {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
              .
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.55)",
                lineHeight: 1.65,
              }}
            >
              {!hasPaid
                ? "Your account is ready. Complete your payment to unlock the assessment and all platform features."
                : profile?.change_genius_role
                  ? `Your Change Genius™ role: ${profile.change_genius_role}. Continue building your team or review your results.`
                  : "Your assessment is unlocked. Begin when you're ready — it takes 8–10 minutes."}
            </p>
          </div>
        </div>

        {/* Persistent Invite Team CTA */}
        {hasPaid && onboarded && (
          <div
            style={{
              background: "var(--blue-light)",
              borderRadius: 16,
              padding: "20px 28px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <strong style={{ fontSize: 16 }}>
                Transformation is not individual.
              </strong>
              <p style={{ margin: 0, fontSize: 14 }}>
                Invite your team to unlock real insight.
              </p>
            </div>
            <Link
              href="/teams/create"
              style={{
                background: "var(--blue)",
                color: "white",
                padding: "8px 24px",
                borderRadius: 100,
                textDecoration: "none",
              }}
            >
              Invite Your Team →
            </Link>
          </div>
        )}

        {/* Payment CTA — shown only if not paid */}
        {!hasPaid && (
          <div
            style={{
              background: "var(--blue)",
              borderRadius: "var(--radius)",
              padding: "28px 40px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 34, flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Unlock your assessment to access all features
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                60 questions · 8–10 minutes · Instant results · Lifetime access
              </div>
            </div>
            <Link
              href="/payment?plan=individual"
              style={{
                background: "white",
                color: "var(--navy)",
                fontSize: 14,
                fontWeight: 800,
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Unlock — $24 →
            </Link>
          </div>
        )}

        {/* Assessment CTA — shown only if paid but not yet taken */}
        {hasPaid && !onboarded && !hasInProgress && (
          <div
            style={{
              background: "var(--blue)",
              borderRadius: "var(--radius)",
              padding: "28px 40px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 34, flexShrink: 0 }}>🎯</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Start your assessment — you&apos;re all set
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                60 questions · 8–10 minutes · Results appear instantly
              </div>
            </div>
            <Link
              href="/assessment"
              style={{
                background: "white",
                color: "var(--navy)",
                fontSize: 14,
                fontWeight: 800,
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Begin Assessment →
            </Link>
          </div>
        )}

        {/* Resume assessment CTA — shown if in progress */}
        {hasPaid && !onboarded && hasInProgress && (
          <div
            style={{
              background: "var(--blue)",
              borderRadius: "var(--radius)",
              padding: "28px 40px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 34, flexShrink: 0 }}>📝</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Resume your assessment
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                You left off — continue where you stopped.
              </div>
            </div>
            <Link
              href="/assessment/take"
              style={{
                background: "white",
                color: "var(--navy)",
                fontSize: 14,
                fontWeight: 800,
                padding: "12px 28px",
                borderRadius: "100px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Resume Assessment →
            </Link>
          </div>
        )}

        {/* Quick action cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
          }}
        >
          {quickCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                background: "white",
                borderRadius: 12,
                padding: "22px 18px",
                border: "1px solid var(--border)",
                textDecoration: "none",
                display: "block",
                position: "relative",
                transition: "box-shadow .15s",
              }}
            >
              {card.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontSize: 16,
                  }}
                >
                  {card.badge}
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: 4,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-3)",
                  lineHeight: 1.5,
                }}
              >
                {card.desc}
              </div>
            </Link>
          ))}
        </div>

        {/* Account info */}
        <div className="card" style={{ padding: 36 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-4)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 20,
            }}
          >
            Account
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {[
              { label: "Name", value: profile?.full_name || "—" },
              { label: "Email", value: user?.email || "—" },
              { label: "Assessment status", value: assessmentStatusText },
              {
                label: "Change Genius™ Role",
                value:
                  profile?.change_genius_role ||
                  (hasPaid ? "Complete your assessment" : "Unlock to discover"),
              },
              {
                label: "Payment status",
                value: hasPaid ? "✓ Paid — lifetime access" : "Not yet paid",
              },
              {
                label: "Member since",
                value: profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-4)",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--text-1)",
                    fontWeight: 500,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          {hasPaid && onboarded && !hasInProgress && (
            <div style={{ marginTop: 16 }}>
              <Link
                href="/payment?plan=individual&retake=true"
                style={{
                  fontSize: 13,
                  color: "var(--blue)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Retake assessment ($24)
              </Link>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Link
              href="/assessment-history"
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                textDecoration: "underline",
              }}
            >
              View all your assessment results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
