"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdaptsHexagon from "@/components/sections/AdaptsHexagon";
import TrustedSlider from "@/components/sections/TrustedSlider";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.06 },
    );
    document.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const nums = document.querySelectorAll<HTMLElement>(".si-num");
    nums.forEach((el) => {
      const target = parseInt(el.dataset.target || "0");
      const prefix = el.dataset.prefix || "";
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = prefix + current;
        if (current >= target) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    });
  }, []);

  const btnWhite: React.CSSProperties = {
    background: "white",
    color: "var(--navy)",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px 24px",
    borderRadius: "100px",
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter,sans-serif",
  };
  const btnBlue: React.CSSProperties = {
    background: "var(--blue)",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px 24px",
    borderRadius: "100px",
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter,sans-serif",
  };
  const navLink: React.CSSProperties = {
    fontSize: "13.5px",
    fontWeight: 400,
    color: "rgba(255,255,255,.78)",
    textDecoration: "none",
  };

  const NAV_LINKS: [string, string][] = [
    ["About Us", "#"],
    ["Assessment", "/assessment"],
    ["Framework", "#adapts"],
    ["For Teams", "#pricing"],
    ["Pricing", "#pricing"],
  ];

  return (
    <>
      {/* MOBILE MENU */}
      {mobOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--navy)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            padding: "24px 28px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 36,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>
              changegenius™
            </div>
            <button
              onClick={() => setMobOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                color: "white",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobOpen(false)}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,.8)",
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,.08)",
                display: "block",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => {
              router.push("/signup");
              setMobOpen(false);
            }}
            style={{
              ...btnBlue,
              marginTop: 28,
              display: "block",
              textAlign: "center",
              fontSize: 16,
              padding: 16 as unknown as string,
            }}
          >
            Get Started
          </button>
        </div>
      )}

      <div className="page">
        {/* ════════════ HERO ════════════ */}
        <div
          className="fade-up"
          style={{
            position: "relative",
            height: "clamp(480px,65vh,680px)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&fit=crop"
            alt="Leaders collaborating"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 28%",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top,rgba(10,37,64,.95) 0%,rgba(10,37,64,.6) 42%,rgba(10,37,64,.12) 100%),linear-gradient(to right,rgba(10,37,64,.8) 0%,rgba(10,37,64,.1) 65%,transparent 100%)",
            }}
          />

          {/* NAV */}
          <nav
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              padding: "22px 36px",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.4px",
                flexShrink: 0,
                marginRight: 44,
              }}
            >
              changegenius™
            </div>
            <div className="hnav-links" style={{ display: "flex", gap: 26 }}>
              {NAV_LINKS.map(([label, href]) => (
                <Link key={label} href={href} style={navLink}>
                  {label}
                </Link>
              ))}
            </div>
            <div
              className="hnav-right"
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {isAuthenticated ? (
                <Link href="/dashboard" style={{ ...navLink, fontWeight: 500 }}>
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  style={
                    {
                      ...navLink,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                    } as React.CSSProperties
                  }
                >
                  Login
                </button>
              )}
              <button
                onClick={() => router.push("/signup")}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  background: "var(--blue)",
                  padding: "9px 22px",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Get started
              </button>
            </div>
            <button
              className="hnav-burger"
              onClick={() => setMobOpen(true)}
              style={{
                display: "none",
                flexDirection: "column",
                gap: 5,
                background: "none",
                border: "none",
                padding: 4,
                marginLeft: "auto",
                cursor: "pointer",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 22,
                    height: 2,
                    background: "white",
                    borderRadius: 1,
                    display: "block",
                  }}
                />
              ))}
            </button>
          </nav>

          {/* HERO CONTENT */}
          <div
            className="hero-bottom-grid"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0 36px 48px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "flex-end",
              gap: 48,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,.44)",
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  marginBottom: 12,
                  animation: "fadeIn .8s ease .2s both",
                }}
              >
                Change Genius™ &nbsp;·&nbsp; Leadership Intelligence
              </div>
              <h1
                className="hero-h1"
                style={{
                  fontSize: "clamp(36px,5vw,68px)",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.04,
                  letterSpacing: "-2px",
                  animation: "slideUp .8s ease .3s both",
                }}
              >
                Intelligence That
                <br />
                Drives Change.
              </h1>
            </div>
            <div
              className="hero-right-hide"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
                paddingBottom: 3,
                animation: "slideUp .8s ease .5s both",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 300,
                  color: "rgba(255,255,255,.72)",
                  lineHeight: 1.72,
                  maxWidth: 380,
                }}
              >
                Understand how you and your team navigate transformation. Reveal
                your Change Genius™ role, build your Team Change Map™, and lead
                with clarity — not instinct.
              </p>
              <button
                onClick={() => router.push("/signup")}
                style={{
                  ...btnWhite,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Take the Assessment &nbsp;→
              </button>
            </div>
          </div>
        </div>

        {/* ════════════ TRUSTED BY SLIDER ════════════ */}
        <TrustedSlider />

        {/* ════════════ ADAPTS HEXAGON ════════════ */}
        <div id="adapts" className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              className="adapts-intro-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1px 1fr",
                gap: 48,
                alignItems: "center",
                marginBottom: 56,
              }}
            >
              <div
                style={{
                  fontSize: "clamp(24px,3vw,38px)",
                  fontWeight: 800,
                  color: "var(--text-1)",
                  lineHeight: 1.12,
                  letterSpacing: "-1px",
                }}
              >
                Unlock the potential of your leaders
              </div>
              <div
                className="adapts-intro-div"
                style={{ background: "var(--border)", alignSelf: "stretch" }}
              />
              <div
                style={{
                  fontSize: 16,
                  color: "var(--text-2)",
                  lineHeight: 1.72,
                }}
              >
                Leaders are the most valuable asset of any organization. We
                provide the tools and intelligence you need to help every leader
                understand how they drive change — and how to do it better.
              </div>
            </div>
            <div className="adapts-body-grid">
              <AdaptsHexagon />
            </div>
          </div>
        </div>

        {/* ════════════ STATS ════════════ */}
        <div
          className="fade-up"
          style={{
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "rgba(255,255,255,.03)",
              width: 240,
              height: 240,
              left: "-60px",
              top: "-60px",
            }}
          />
          <div
            className="inner"
            style={{ padding: "var(--pad)", position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                fontSize: "clamp(20px,2.5vw,28px)",
                fontWeight: 800,
                color: "white",
                marginBottom: 44,
              }}
            >
              Our numbers tell the story
            </div>
            <div
              className="stats-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}
            >
              {[
                {
                  target: 6,
                  prefix: "",
                  label: "ADAPTS Stages",
                  sub: "Mapped across the full arc of organizational transformation",
                },
                {
                  target: 60,
                  prefix: "",
                  label: "Questions",
                  sub: "Science-backed assessment completed in 8–10 minutes",
                },
                {
                  target: 24,
                  prefix: "$",
                  label: "Per Person",
                  sub: "One-time payment. No subscription. No license complexity.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={i > 0 ? "stats-cell-border" : ""}
                  style={{
                    paddingRight: i < 2 ? 48 : 0,
                    paddingLeft: i > 0 ? 48 : 0,
                    borderLeft:
                      i > 0 ? "1px solid rgba(255,255,255,.1)" : "none",
                  }}
                >
                  <div
                    className="si-num"
                    data-target={s.target}
                    data-prefix={s.prefix}
                    style={{
                      fontSize: "clamp(40px,5vw,60px)",
                      fontWeight: 900,
                      color: "var(--blue)",
                      lineHeight: 1,
                      letterSpacing: "-2px",
                      marginBottom: 6,
                    }}
                  >
                    0
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 5,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,.52)",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ OUTCOMES ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--blue)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: 10,
              }}
            >
              Value of Change Intelligence
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,3vw,36px)",
                fontWeight: 800,
                color: "var(--text-1)",
                lineHeight: 1.15,
                letterSpacing: "-0.8px",
                marginBottom: 36,
              }}
            >
              Great organizations thrive on a culture built on{" "}
              <span style={{ position: "relative", display: "inline" }}>
                alignment
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -3,
                    height: 3,
                    background: "var(--blue)",
                    borderRadius: 2,
                  }}
                />
              </span>
            </h2>
            <div
              className="grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
              }}
            >
              {[
                {
                  co: "Apex Partners",
                  pct: "39%",
                  desc: "Reduction in change initiative failures after 90 days",
                  bg: "var(--blue-light)",
                  bd: "#bfdbfe",
                },
                {
                  co: "Meridian Group",
                  pct: "78.5%",
                  desc: "Of leaders reported stronger team alignment post-assessment",
                  bg: "#eff6ff",
                  bd: "#bfdbfe",
                },
                {
                  co: "Vantara Co.",
                  pct: "94%",
                  desc: "Weekly pulse completion rate in teams of 8 or more",
                  bg: "var(--blue-tint)",
                  bd: "#c7d2fe",
                },
                {
                  co: "NorthStar Inc.",
                  pct: "147",
                  desc: "Average days to full organizational alignment via Team Change Map™",
                  bg: "#f0f9ff",
                  bd: "#bae6fd",
                },
              ].map((o) => (
                <div
                  key={o.co}
                  style={{
                    borderRadius: 12,
                    padding: "22px 18px",
                    border: `1px solid ${o.bd}`,
                    background: o.bg,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "var(--text-2)",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--blue)",
                        flexShrink: 0,
                      }}
                    />
                    {o.co}
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: "var(--navy)",
                      lineHeight: 1,
                      letterSpacing: "-1px",
                      marginBottom: 6,
                    }}
                  >
                    {o.pct}
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-3)",
                      lineHeight: 1.55,
                      marginBottom: 14,
                    }}
                  >
                    {o.desc}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--navy)",
                      background: "white",
                      border: "1px solid var(--border)",
                      padding: "6px 14px",
                      borderRadius: "100px",
                      display: "inline-block",
                      cursor: "pointer",
                    }}
                  >
                    Read their story
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ PRODUCTIVITY ENERGY ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--blue)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              Productivity Energy
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,3vw,34px)",
                fontWeight: 800,
                color: "var(--text-1)",
                letterSpacing: "-0.7px",
                marginBottom: 14,
              }}
            >
              How you show up during change
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-2)",
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 620,
              }}
            >
              Every leader brings a natural energy to the change process. The
              assessment reveals your dominant productivity energy — the mode in
              which you do your best work during transformation.
            </p>
            <div
              className="grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 14,
              }}
            >
              {[
                {
                  name: "Spark",
                  icon: "⚡",
                  color: "#0a2540",
                  desc: "You ignite change. You generate ideas, sense disruption early, and energize people toward new possibilities. Spark energy is essential at the start of transformation.",
                  traits: [
                    "Future-focused",
                    "Idea-generating",
                    "Disruption-sensing",
                    "Energizing",
                  ],
                },
                {
                  name: "Build",
                  icon: "🏗️",
                  color: "#1557d4",
                  desc: "You drive results. You convert ideas into action, push initiatives forward, and keep teams moving. Build energy is essential when momentum needs to be created.",
                  traits: [
                    "Action-oriented",
                    "Results-driven",
                    "Momentum-focused",
                    "Execution-led",
                  ],
                },
                {
                  name: "Polish",
                  icon: "✨",
                  color: "#1a6bfa",
                  desc: "You improve systems. You refine, optimize, and make change stick. Polish energy is essential after implementation — turning good into great.",
                  traits: [
                    "Detail-oriented",
                    "Process-focused",
                    "Continuous improvement",
                    "Quality-driven",
                  ],
                },
                {
                  name: "Bond",
                  icon: "🤝",
                  color: "#4d8ef8",
                  desc: "You unify people. You build trust, facilitate dialogue, and keep teams connected through disruption. Bond energy is essential when alignment is breaking down.",
                  traits: [
                    "Trust-building",
                    "Dialogue-focused",
                    "Relationship-led",
                    "Empathy-driven",
                  ],
                },
              ].map((e) => (
                <div
                  key={e.name}
                  style={{
                    borderRadius: 12,
                    padding: "24px 20px",
                    background: `${e.color}0d`,
                    border: `1.5px solid ${e.color}22`,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{e.icon}</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: e.color,
                      marginBottom: 6,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {e.name}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-2)",
                      lineHeight: 1.6,
                      marginBottom: 14,
                    }}
                  >
                    {e.desc}
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {e.traits.map((t) => (
                      <li
                        key={t}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 12,
                          color: "var(--text-3)",
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: e.color,
                            flexShrink: 0,
                          }}
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ PRICING (moved up) ════════════ */}
        <div
          id="pricing"
          className="fade-up grid-2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div
            style={{
              background: "var(--navy-mid)",
              borderRadius: "var(--radius)",
              padding: "var(--pad)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.36)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 14,
              }}
            >
              For Individuals
            </div>
            <div
              style={{
                fontSize: "clamp(18px,2.5vw,26px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                marginBottom: 14,
              }}
            >
              Discover Your Change Genius™ Profile
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,.56)",
                lineHeight: 1.72,
                marginBottom: 22,
              }}
            >
              Understand how you naturally lead during transformation. Get your
              ADAPTS stage strengths, your Change Genius™ role, and clear
              development guidance.
            </p>
            <ul style={{ listStyle: "none", marginBottom: 28 }}>
              {[
                "Your Change Genius™ role",
                "ADAPTS stage strengths",
                "Leadership development guidance",
                "Download and share your results",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: "13.5px",
                    color: "rgba(255,255,255,.65)",
                    padding: "7px 0",
                    borderBottom: "1px solid rgba(255,255,255,.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--blue)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/signup")} style={btnWhite}>
              Take Assessment — $24
            </button>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.24)",
                marginTop: 12,
              }}
            >
              🔒 One-time payment · No subscription
            </div>
          </div>
          <div
            style={{
              background: "var(--navy)",
              borderRadius: "var(--radius)",
              padding: "var(--pad)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.36)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 14,
              }}
            >
              For Teams
            </div>
            <div
              style={{
                fontSize: "clamp(18px,2.5vw,26px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                marginBottom: 14,
              }}
            >
              Build Your Team Change Map™
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,.56)",
                lineHeight: 1.72,
                marginBottom: 22,
              }}
            >
              See how your team's roles map across all six ADAPTS stages.
              Identify friction, unlock your Change Capacity Score™, and get a
              90-day roadmap.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {(
                [
                  ["3 members", "Basic role distribution visible", false],
                  ["5 members", "Team Change Map™ unlocks", false],
                  ["8 members", "Full diagnostics unlock", true],
                ] as [string, string, boolean][]
              ).map(([lbl, val, hi]) => (
                <div
                  key={lbl}
                  style={{
                    background: "rgba(255,255,255,.06)",
                    border: `1px solid ${hi ? "rgba(26,107,250,.3)" : "rgba(255,255,255,.08)"}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.32)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 3,
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/signup")} style={btnBlue}>
              Start a Team — $24 per person
            </button>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.24)",
                marginTop: 12,
              }}
            >
              🔒 Minimum 3 members · No subscription
            </div>
          </div>
        </div>

        {/* ════════════ BANNER ════════════ */}
        <div
          className="fade-up"
          style={{ background: "var(--blue)", borderRadius: "var(--radius)" }}
        >
          <div
            className="banner-inner inner"
            style={{
              padding: "28px var(--pad)",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 34, flexShrink: 0, opacity: 0.9 }}>🎯</div>
            <div
              style={{
                fontSize: "clamp(15px,2vw,22px)",
                fontWeight: 700,
                color: "white",
                flex: 1,
                lineHeight: 1.35,
                minWidth: 180,
              }}
            >
              Already know what you need? Start your assessment today.
            </div>
            <button
              onClick={() => router.push("/signup")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 6,
                overflow: "hidden",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "var(--blue)",
                  padding: "13px 22px",
                  background: "white",
                  fontFamily: "Inter,sans-serif",
                }}
              >
                Take Assessment — $24
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,.25)",
                  padding: "13px 14px",
                  fontSize: 14,
                  color: "white",
                }}
              >
                ›
              </span>
            </button>
          </div>
        </div>

        {/* ════════════ EXPLORE ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              className="explore-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 72,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--blue)",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: 10,
                  }}
                >
                  What is Change Genius?
                </div>
                <h2
                  style={{
                    fontSize: "clamp(22px,3vw,34px)",
                    fontWeight: 800,
                    color: "var(--text-1)",
                    lineHeight: 1.18,
                    letterSpacing: "-0.7px",
                    marginBottom: 16,
                  }}
                >
                  Explore the Change Genius™ Model
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                    marginBottom: 6,
                  }}
                >
                  Change Genius™ is the only assessment-based framework built to
                  reveal how leaders and teams drive transformation.
                </p>
                <ul style={{ listStyle: "none", margin: "16px 0 28px" }}>
                  {[
                    "Understand your natural role during change",
                    "Identify where your team loses momentum",
                    "Improve dialogue, alignment, and execution",
                    "Transform friction into collaborative momentum",
                    "Develop stronger change leadership skills",
                    "Build organizations that absorb and drive change",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: "14.5px",
                        color: "var(--text-2)",
                        padding: "7px 0",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--blue)",
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  className="outline-btn"
                  onClick={() => router.push("/about")}
                >
                  <span className="outline-btn-text">
                    Explore Change Genius roles
                  </span>
                  <span className="outline-btn-arr">›</span>
                </button>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 200,
                    height: 200,
                    right: -20,
                    top: 20,
                    borderRadius: "50%",
                    background: "var(--blue-light)",
                    zIndex: 0,
                  }}
                />
                <div
                  className="explore-photo"
                  style={{
                    width: 360,
                    height: 360,
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 20px 60px rgba(10,37,64,.15)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop"
                    alt="Leader"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ ABOUT ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              className="about-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 60,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--blue)",
                    marginBottom: 28,
                  }}
                >
                  About Change Genius
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "3/2",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80&fit=crop"
                    alt="Workshop"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "grayscale(100%)",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(10,37,64,.7)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        color: "var(--navy)",
                        flexShrink: 0,
                      }}
                    >
                      ▶
                    </div>
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 500,
                        color: "white",
                      }}
                    >
                      Watch how it works
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "clamp(18px,2.5vw,28px)",
                    fontWeight: 700,
                    color: "var(--text-1)",
                    lineHeight: 1.28,
                    letterSpacing: "-0.4px",
                    marginBottom: 20,
                  }}
                >
                  Built for leaders navigating transformation — intelligence,
                  clarity, and real-time insight.
                </h2>
                {[
                  "Change Genius™ is the first assessment-based framework that reveals exactly how individuals and teams drive transformation. Built on the ADAPTS model — six stages from sensing disruption to scaling impact — it gives every leader and organization a shared language for change.",
                  "Most change initiatives fail not because of strategy, but because leaders don't understand their own change behavior, or their team's. Change Genius™ maps who you are in the system, what your team needs, and where momentum is being lost.",
                  "Whether you are a change sponsor, HR leader, or team manager, Change Genius™ gives you the clarity and language to lead transformation with confidence at every level.",
                ].map((text, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "14.5px",
                      color: "var(--text-3)",
                      lineHeight: 1.78,
                      marginBottom: 14,
                    }}
                  >
                    {text}
                  </p>
                ))}
                <button
                  onClick={() => router.push("/about")}
                  style={{ ...btnBlue, marginTop: 8 }}
                >
                  Explore the Model
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ VISION ════════════ */}
        <div
          className="fade-up"
          style={{
            position: "relative",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&fit=crop"
            alt="Office"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,37,64,.72)",
            }}
          />
          <div
            className="vision-grid"
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: 280,
            }}
          >
            <div
              className="vision-left-border"
              style={{
                padding: 48,
                borderRight: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 14,
                }}
              >
                Our Vision
              </div>
              <h2
                style={{
                  fontSize: "clamp(20px,2.5vw,28px)",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.28,
                }}
              >
                To be the most trusted intelligence system for organizational
                change globally.
              </h2>
            </div>
            <div
              style={{ padding: 48, display: "flex", alignItems: "flex-end" }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,.62)",
                  lineHeight: 1.72,
                }}
              >
                We believe every leader deserves a clear picture of how their
                organization moves through change — and every team deserves the
                tools to navigate it together.
              </p>
            </div>
          </div>
        </div>

        {/* ════════════ PRINCIPLES ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--blue)",
                marginBottom: 10,
              }}
            >
              Our Values
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.5vw,40px)",
                fontWeight: 800,
                color: "var(--navy)",
                lineHeight: 1.12,
                letterSpacing: "-1px",
                marginBottom: 36,
              }}
            >
              Our guiding principles
            </h2>
            <div
              className="principles-grid grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 16,
              }}
            >
              {[
                {
                  title: "Clarity",
                  sub: "In every insight we deliver",
                  items: [
                    "Science-backed, not opinion-based",
                    "Plain language, no jargon",
                    "Actionable at every leadership level",
                    "Honest signals over comfortable noise",
                    "Built for decision-making, not just reflection",
                  ],
                },
                {
                  title: "Alignment",
                  sub: "In everything we build",
                  items: [
                    "Individual and team insight always connected",
                    "Weekly pulse drives real-time awareness",
                    "Leaders and teams on the same page",
                    "One common language for the whole org",
                    "Progressive unlocks reward participation",
                  ],
                },
                {
                  title: "Momentum",
                  sub: "In every transformation",
                  items: [
                    "Built for action, not just reflection",
                    "Weekly cadence maintains forward motion",
                    "Insight without action is just data",
                    "Every feature drives the next step",
                    "Teams that measure change move faster",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: "white",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "28px 24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-1)",
                      marginBottom: 6,
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-4)",
                      marginBottom: 16,
                      paddingBottom: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {p.sub}
                  </div>
                  <ul style={{ listStyle: "none" }}>
                    {p.items.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontSize: "13.5px",
                          color: "var(--text-2)",
                          padding: "6px 0",
                          borderBottom: "1px solid #f8fafc",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 9,
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--blue)",
                            flexShrink: 0,
                            marginTop: 4,
                            display: "inline-block",
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ PRESENCE ════════════ */}
        <div
          className="fade-up"
          style={{
            background: "var(--navy)",
            borderRadius: "var(--radius)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(26,107,250,.1)",
            }}
          />
          <div
            className="presence-grid inner"
            style={{
              padding: "var(--pad)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "flex-end",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.36)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 14,
                }}
              >
                Our Reach
              </div>
              <h2
                style={{
                  fontSize: "clamp(26px,3.5vw,40px)",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.1,
                  letterSpacing: "-1px",
                }}
              >
                Worldwide Reach,
                <br />
                Local Intelligence
              </h2>
            </div>
            <div>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,.56)",
                  lineHeight: 1.72,
                  marginBottom: 24,
                }}
              >
                Change Genius™ is used by organizations across industries and
                continents. Our framework is role-agnostic and
                language-independent — built to work for any team, at any size,
                anywhere in the world.
              </p>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(26,107,250,.25)",
                  border: "1.5px solid rgba(26,107,250,.5)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "11px 22px",
                  borderRadius: "100px",
                  fontFamily: "Inter,sans-serif",
                  cursor: "pointer",
                }}
              >
                Explore our reach →
              </button>
            </div>
          </div>
        </div>

        {/* ════════════ BLOG ════════════ */}
        <div className="card fade-up">
          <div className="inner" style={{ padding: "var(--pad)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 40,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                <rect
                  x="9"
                  y="11"
                  width="26"
                  height="31"
                  rx="3"
                  stroke="#1a6bfa"
                  strokeWidth="2.5"
                  fill="none"
                />
                <line
                  x1="15"
                  y1="20"
                  x2="29"
                  y2="20"
                  stroke="#1a6bfa"
                  strokeWidth="2"
                />
                <line
                  x1="15"
                  y1="26"
                  x2="29"
                  y2="26"
                  stroke="#1a6bfa"
                  strokeWidth="2"
                />
                <line
                  x1="15"
                  y1="32"
                  x2="23"
                  y2="32"
                  stroke="#1a6bfa"
                  strokeWidth="2"
                />
              </svg>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--text-1)",
                  whiteSpace: "nowrap",
                }}
              >
                From The Blog
              </div>
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background:
                    "repeating-linear-gradient(to right,var(--border) 0,var(--border) 4px,transparent 4px,transparent 10px)",
                  marginLeft: 4,
                }}
              />
            </div>
            <div
              className="blog-grid grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 20,
              }}
            >
              {[
                {
                  title: "What Is Your Change Genius™ Role?",
                  body: "Explore the Change Genius roles and discover which one describes how you naturally lead when your organization faces disruption, uncertainty, and transformation.",
                },
                {
                  title: "The Six ADAPTS Stages Explained",
                  body: "Every transformation moves through six stages. Knowing which stage your team is in — and what it needs — is the difference between change that stalls and change that scales.",
                },
                {
                  title: "Why Teams Fail During Change",
                  body: "Most change initiatives fail not because of strategy, but because of people dynamics. The Team Change Map™ reveals the friction patterns that quietly derail transformation.",
                },
              ].map((post) => (
                <div
                  key={post.title}
                  style={{
                    border: "1.5px solid var(--border)",
                    borderRadius: 8,
                    padding: "24px 22px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--blue)",
                      marginBottom: 12,
                      lineHeight: 1.35,
                    }}
                  >
                    {post.title}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-2)",
                      lineHeight: 1.65,
                      marginBottom: 18,
                    }}
                  >
                    {post.body}
                  </p>
                  <a
                    href="#"
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--blue)",
                      textDecoration: "underline",
                    }}
                  >
                    Read now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ FINAL CTA ════════════ */}
        <div
          className="fade-up"
          style={{ background: "var(--navy)", borderRadius: "var(--radius)" }}
        >
          <div
            className="inner"
            style={{ padding: "var(--pad)", textAlign: "center" }}
          >
            <h2
              style={{
                fontSize: "clamp(24px,4vw,40px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.15,
                letterSpacing: "-1.2px",
                marginBottom: 14,
              }}
            >
              Ready to explore the Change Genius™ platform?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.48)",
                lineHeight: 1.65,
                marginBottom: 32,
                maxWidth: 500,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Start with your individual assessment. Invite your team. Unlock
              the Team Change Map™ and begin leading change with real
              intelligence.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button onClick={() => router.push("/signup")} style={btnWhite}>
                Start Assessment — $24
              </button>
              <button
                onClick={() => router.push("/about")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,.1)",
                  border: "1.5px solid rgba(26,107,250,.5)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "11px 22px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
              >
                See How It Works
              </button>
            </div>
          </div>
        </div>

        {/* ════════════ FOOTER ════════════ */}
        <div
          className="fade-up"
          style={{ background: "var(--navy)", borderRadius: "var(--radius)" }}
        >
          <div
            className="inner"
            style={{ padding: "var(--pad) var(--pad) 36px" }}
          >
            <div
              className="footer-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: 40,
                marginBottom: 44,
              }}
            >
              <div className="footer-brand">
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 10,
                  }}
                >
                  changegenius™
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.3)",
                    lineHeight: 1.7,
                    maxWidth: 220,
                  }}
                >
                  The leadership intelligence platform for change. Built on the
                  ADAPTS framework. One price. No complexity.
                </p>
              </div>
              {[
                {
                  h: "Platform",
                  links: [
                    ["Individual Assessment", "/assessment"],
                    ["Team Change Map™", "/teams"],
                    ["Weekly Pulse™", "/pulse"],
                    ["Dashboard", "/dashboard"],
                  ],
                },
                {
                  h: "Learn",
                  links: [
                    ["What is Change Genius?", "/about"],
                    ["ADAPTS Framework", "/about"],
                    ["Change Genius Roles", "/about"],
                    ["Blog", "#"],
                  ],
                },
                {
                  h: "Company",
                  links: [
                    ["About", "/about"],
                    ["Pricing", "/pricing"],
                    ["Contact", "#"],
                    ["Careers", "#"],
                  ],
                },
                {
                  h: "Support",
                  links: [
                    ["Help Center", "#"],
                    ["My Account", "/dashboard"],
                    ["Login", "/login"],
                    ["Accessibility", "#"],
                  ],
                },
              ].map((col) => (
                <div key={col.h}>
                  <h5
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.25)",
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                      marginBottom: 16,
                    }}
                  >
                    {col.h}
                  </h5>
                  <ul style={{ listStyle: "none" }}>
                    {col.links.map(([label, href]) => (
                      <li key={label} style={{ marginBottom: 9 }}>
                        <Link
                          href={href}
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,.48)",
                            textDecoration: "none",
                          }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,.06)",
                paddingTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "rgba(255,255,255,.2)",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <span>© 2026 Change Genius™. All rights reserved.</span>
              <div style={{ display: "flex", gap: 20 }}>
                {["Privacy Policy", "Terms of Use", "Cookie Settings"].map(
                  (l) => (
                    <Link
                      key={l}
                      href="#"
                      style={{
                        color: "rgba(255,255,255,.2)",
                        textDecoration: "none",
                      }}
                    >
                      {l}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
