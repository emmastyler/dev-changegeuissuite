// lib/pdf/generator.ts
import type { ScoreResult } from "@/lib/assessment/scoring";
import type { Narrative } from "@/lib/assessment/narratives";
import type { TeamDiagnostic } from "@/lib/assessment/team-diagnostic";
import fs from "fs";

// Dynamic import for puppeteer (full) and chromium-min
let puppeteer: any = null;
let chromium: any = null;

// ── Color palette ──────────────────────────────────────────────
const NAVY = "#0a2540";
const BLUE = "#1a6bfa";
const TEXT2 = "#334155";
const TEXT3 = "#64748b";
const BORDER = "#e2e8f0";

const ROLE_COLORS: Record<string, string> = {
  Innovator: NAVY,
  Achiever: "#1557d4",
  Organizer: BLUE,
  Unifier: "#4d8ef8",
  Builder: "#93b8fb",
  Refiner: "#0d3060",
};
const STAGE_COLORS: Record<string, string> = {
  "Alert the System": NAVY,
  "Diagnose the Gaps": "#0d3060",
  "Access Readiness": "#1557d4",
  "Participate Through Dialogue": BLUE,
  "Transform Through Alignment": "#4d8ef8",
  "Scale and Sustain": "#93b8fb",
};

function bar(label: string, score: number, color: string): string {
  return `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:${TEXT2}">${label}</span>
        <span style="font-size:12px;font-weight:700;color:${NAVY}">${score}</span>
      </div>
      <div style="height:8px;background:${BORDER};border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${score}%;background:${color};border-radius:4px"></div>
      </div>
    </div>`;
}

function radarChartSVG(stageScores: Record<string, number>): string {
  const stages = [
    "Alert the System",
    "Diagnose the Gaps",
    "Access Readiness",
    "Participate Through Dialogue",
    "Transform Through Alignment",
    "Scale and Sustain",
  ];
  const n = stages.length,
    cx = 160,
    cy = 160,
    r = 115;
  const TWO_PI = Math.PI * 2;
  const pt = (radius: number, i: number) => {
    const a = -Math.PI / 2 + (TWO_PI * i) / n;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };
  const ring = (frac: number) => {
    return (
      stages
        .map((_, i) => {
          const p = pt(r * frac, i);
          return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ") + " Z"
    );
  };
  const scorePath =
    stages
      .map((s, i) => {
        const p = pt(r * Math.max(0.05, (stageScores[s] ?? 0) / 100), i);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z";
  const short: Record<string, string> = {
    "Alert the System": "Alert",
    "Diagnose the Gaps": "Diagnose",
    "Access Readiness": "Readiness",
    "Participate Through Dialogue": "Dialogue",
    "Transform Through Alignment": "Align",
    "Scale and Sustain": "Scale",
  };
  return `<svg viewBox="0 0 320 320" style="width:100%;max-width:280px;height:auto">
    ${[0.25, 0.5, 0.75, 1].map((f) => `<path d="${ring(f)}" fill="none" stroke="${BORDER}" stroke-width="${f === 1 ? 1.5 : 0.8}" opacity="0.5"/>`).join("")}
    ${stages
      .map((_, i) => {
        const p = pt(r, i);
        return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${BORDER}" stroke-width="0.8" opacity="0.4"/>`;
      })
      .join("")}
    <path d="${scorePath}" fill="rgba(26,107,250,.15)" stroke="${BLUE}" stroke-width="2"/>
    ${stages
      .map((s, i) => {
        const p = pt(r + 22, i);
        const a = -Math.PI / 2 + (TWO_PI * i) / n;
        const anchor =
          Math.abs(Math.cos(a)) < 0.15
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return `<text x="${p.x}" y="${p.y}" text-anchor="${anchor}" dominant-baseline="central" font-size="9" font-weight="600" fill="${TEXT3}">${short[s]}</text>`;
      })
      .join("")}
    ${stages
      .map((s, i) => {
        const p = pt(r * Math.max(0.05, (stageScores[s] ?? 0) / 100), i);
        return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${STAGE_COLORS[s] ?? BLUE}"/>`;
      })
      .join("")}
    <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="9" fill="${TEXT3}" letter-spacing="1">ADAPTS</text>
  </svg>`;
}

export function buildIndividualReportHTML(opts: {
  fullName: string | null;
  scores: ScoreResult;
  narrative: Narrative;
  completedAt: string;
}): string {
  const { fullName, scores, narrative, completedAt } = opts;
  const { derived, role_scores, stage_scores, energy_scores } = scores;
  const name = fullName ?? "Leader";
  const date = new Date(completedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const roleColor = ROLE_COLORS[derived.primary_role] ?? NAVY;

  const roleBarRows = Object.entries(role_scores)
    .sort((a, b) => b[1] - a[1])
    .map(([r, s]) => bar(r, s, ROLE_COLORS[r] ?? BLUE))
    .join("");
  const stageBarRows = Object.entries(stage_scores)
    .map(([s, sc]) => bar(s, sc, STAGE_COLORS[s] ?? BLUE))
    .join("");

  const actionItems = narrative.next_30_days
    .map(
      (a, i) => `
    <div style="display:flex;gap:12px;margin-bottom:12px;padding:12px 16px;background:#f8f9fc;border-radius:8px;break-inside:avoid">
      <div style="width:28px;height:28px;border-radius:50%;background:${BLUE};color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</div>
      <p style="font-size:12px;color:${TEXT2};line-height:1.6;margin:0">${a}</p>
    </div>`,
    )
    .join("");

  const roleBenefits =
    narrative.role_benefits
      ?.map(
        (b) =>
          `<li style="margin-bottom:6px;font-size:12px;color:${TEXT2}">✓ ${b}</li>`,
      )
      .join("") || "";
  const roleWatchouts =
    narrative.role_watchouts
      ?.map(
        (w) =>
          `<li style="margin-bottom:6px;font-size:12px;color:#b91c1c">⚠ ${w}</li>`,
      )
      .join("") || "";
  const energyBenefits =
    narrative.energy_benefits
      ?.map(
        (b) =>
          `<li style="margin-bottom:6px;font-size:12px;color:${TEXT2}">✓ ${b}</li>`,
      )
      .join("") || "";
  const energyWatchouts =
    narrative.energy_watchouts
      ?.map(
        (w) =>
          `<li style="margin-bottom:6px;font-size:12px;color:#b91c1c">⚠ ${w}</li>`,
      )
      .join("") || "";
  const pairingBenefits =
    narrative.pairing_benefits
      ?.map(
        (b) =>
          `<li style="margin-bottom:6px;font-size:12px;color:${TEXT2}">✓ ${b}</li>`,
      )
      .join("") || "";
  const pairingWatchouts =
    narrative.pairing_watchouts
      ?.map(
        (w) =>
          `<li style="margin-bottom:6px;font-size:12px;color:#b91c1c">⚠ ${w}</li>`,
      )
      .join("") || "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Change Genius™ Report - ${name}</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: white;
  color: ${NAVY};
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  max-width: 794px;
  margin: 0 auto;
  background: white;
  position: relative;
}

/* WATERMARK */
.page::after {
  content: "CG";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 140px;
  font-weight: 900;
  color: rgba(0,0,0,0.02);
  pointer-events: none;
}

.section {
  padding: 50px 40px;
}

.break {
  page-break-before: always;
}

/* TYPOGRAPHY */
h1 { font-size: 48px; font-weight: 900; letter-spacing: -1.5px; }
h2 { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }

p {
  font-size: 13px;
  line-height: 1.7;
  color: ${TEXT2};
  margin-bottom: 12px;
}

.label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${BLUE};
  margin-bottom: 8px;
}

/* GRID */
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* CARD */
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  break-inside: avoid;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #eef2f7;
}

/* SECTION HEADER */
.section-header {
  margin-bottom: 20px;
}
.section-header-line {
  width: 40px;
  height: 3px;
  background: ${BLUE};
  margin-top: 6px;
}

/* FOOTER */
.footer {
  padding: 30px 40px;
  text-align: center;
  font-size: 10px;
  color: ${TEXT3};
  border-top: 1px solid ${BORDER};
}

/* PROGRESS BAR */
.progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 10px;
  margin-top: 6px;
}
.progress-fill {
  height: 100%;
  background: ${BLUE};
  border-radius: 10px;
}

/* ACTION BOX */
.action-box {
  background: rgba(255,255,255,0.05);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

/* PRINT */
@media print {
  body { margin: 0; padding: 0; }
  .page { margin: 0; }
}

</style>
</head>

<body>
<div class="page">

<!-- ================= COVER ================= -->
<div style="background:linear-gradient(135deg, ${roleColor}, #0f172a);padding:80px 50px;color:white">

  <!-- LOGO ROW -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px">
    <img src="/logo-white.png" style="height:32px">
    <div style="font-size:11px;letter-spacing:2px;color:rgba(255,255,255,.6)">
      OFFICIAL REPORT
    </div>
  </div>

  <h1>${derived.primary_role}</h1>

  <div style="font-size:20px;color:rgba(255,255,255,.75);margin:10px 0 20px">
    Secondary: <strong style="color:white">${derived.secondary_role}</strong>
  </div>

  <div style="display:inline-block;background:white;color:${roleColor};padding:8px 20px;border-radius:100px;font-weight:800;font-size:12px;margin-bottom:30px">
    ${derived.role_pair_title}
  </div>

  <p style="max-width:520px;font-size:15px;color:rgba(255,255,255,.85)">
    ${narrative.executive_summary}
  </p>

  <div style="margin-top:40px;display:flex;gap:40px">
    <div>
      <div style="font-size:10px;opacity:.6">ASSESSED</div>
      <div style="font-weight:700">${date}</div>
    </div>
    <div>
      <div style="font-size:10px;opacity:.6">ENERGY</div>
      <div style="font-weight:700">${derived.primary_energy}</div>
    </div>
    <div>
      <div style="font-size:10px;opacity:.6">PREPARED FOR</div>
      <div style="font-weight:700">${name}</div>
    </div>
  </div>
</div>

<!-- ================= ROLE & ENERGY ================= -->
<div class="section">

  <div class="section-header">
    <div class="label">Section 01</div>
    <div class="section-header-line"></div>
  </div>

  <div class="grid2">

    <div class="card">
      <div class="label">Your Role</div>
      <h2>${narrative.role_name}</h2>
      <p><strong>${narrative.role_summary}</strong></p>
      <p>${narrative.role_detailed}</p>
      <ul>${roleBenefits}</ul>
      <ul>${roleWatchouts}</ul>
    </div>

    <div class="card">
      <div class="label">Energy</div>
      <h2>${narrative.energy_name}</h2>
      <p><strong>${narrative.energy_summary}</strong></p>
      <p>${narrative.energy_detailed}</p>
      <ul>${energyBenefits}</ul>
      <ul>${energyWatchouts}</ul>
    </div>

  </div>
</div>

<!-- ================= STAGE ================= -->
<div class="section">

  <div class="section-header">
    <div class="label">Section 02</div>
    <div class="section-header-line"></div>
  </div>

  <div class="grid2">
    <div>${radarChartSVG(stage_scores)}</div>
    <div>${stageBarRows}</div>
  </div>

</div>

<!-- ================= PAIRING ================= -->
<div class="section break">

  <div class="section-header">
    <div class="label">Section 03</div>
    <div class="section-header-line"></div>
  </div>

  <h2>${narrative.pairing_name}</h2>
  <p>${narrative.pairing_description}</p>

  <div class="grid2" style="margin-top:20px">
    <div class="card">${pairingBenefits}</div>
    <div class="card">${pairingWatchouts}</div>
  </div>

</div>

<!-- ================= TEAM ================= -->
<div class="section">
  <div class="section-header">
    <div class="label">Section 04</div>
    <div class="section-header-line"></div>
  </div>

  <p>${narrative.individual_in_team}</p>
</div>

<!-- ================= ACTION PLAN ================= -->
<div style="background:${NAVY};padding:50px;color:white">

  <div class="label" style="color:rgba(255,255,255,.4)">Next 30 Days</div>
  <h2 style="color:white;margin-bottom:20px">Action Plan</h2>

  ${actionItems}

</div>

<!-- ================= ABOUT ================= -->
<div class="section">
  <div class="label">About</div>
  <p>${narrative.what_is_change_genius}</p>
</div>

<!-- ================= APPLY ================= -->
<div class="section">
  <div class="grid2">

    <div class="card">
      <h3>As Individual</h3>
      ${narrative.how_to_apply_as_individual.map((i) => `<p>${i}</p>`).join("")}
    </div>

    <div class="card">
      <h3>As Team</h3>
      ${narrative.how_to_apply_as_team.map((i) => `<p>${i}</p>`).join("")}
    </div>

  </div>
</div>

<!-- ================= FOOTER ================= -->
<div class="footer">
  <img src="/logo-dark.png" style="height:20px;margin-bottom:10px"><br>
  changegenius™ · Confidential · ${date}
</div>

</div>
</body>
</html>`;
}

// ── Team report (simplified) ──────────────────────────────────
export function buildTeamReportHTML(opts: {
  teamName: string;
  diagnostic: TeamDiagnostic;
  memberNames: string[];
  date: string;
}): string {
  const { teamName, memberNames, date } = opts;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Team Report - ${teamName}</title></head><body><h1>${teamName} Team Report</h1><p>Members: ${memberNames.join(", ")}</p><p>Date: ${date}</p></body></html>`;
}

// ── PDF generation with robust fallback ────────────────────────
export async function generatePDF(html: string): Promise<Buffer> {
  let browser = null;

  // Try to load puppeteer (full) first – it includes Chromium
  try {
    const puppeteerFull = await import("puppeteer");
    browser = await puppeteerFull.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("[PDF] Using puppeteer (full)");
  } catch (err) {
    console.warn(
      "[PDF] puppeteer (full) not available, trying puppeteer-core with chromium-min",
      err,
    );
    try {
      const puppeteerCore = await import("puppeteer-core");
      const chromium = await import("@sparticuz/chromium-min");
      const executablePath = await chromium.default.executablePath();
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: true,
      });
      console.log("[PDF] Using puppeteer-core with chromium-min");
    } catch (err2) {
      console.error("[PDF] No browser engine available", err2);
      throw new Error("PDF generation not supported in this environment");
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
