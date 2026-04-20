// lib/pdf/generator.ts
import type { ScoreResult } from "@/lib/assessment/scoring";
import type { Narrative } from "@/lib/assessment/narratives";
import type { TeamDiagnostic } from "@/lib/assessment/team-diagnostic";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";

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

  // ✅ Explicitly cast to Record<string, number> to satisfy TypeScript
  const roleScoresMap = role_scores as Record<string, number>;
  const stageScoresMap = stage_scores as Record<string, number>;
  const energyScoresMap = energy_scores as Record<string, number>;

  const roleBarRows = Object.entries(roleScoresMap)
    .sort((a, b) => b[1] - a[1])
    .map(([r, s]) => bar(r, s, ROLE_COLORS[r] ?? BLUE))
    .join("");

  const stageBarRows = Object.entries(stageScoresMap)
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
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: ${NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 794px; margin: 0 auto; background: white; }
  .section { padding: 40px; page-break-after: avoid; }
  .break { page-break-before: always; }
  h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  h2 { font-size: 20px; font-weight: 800; margin-bottom: 16px; }
  h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
  p { font-size: 13px; line-height: 1.7; color: ${TEXT2}; margin-bottom: 12px; }
  .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${BLUE}; margin-bottom: 8px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .card { background: #f8f9fc; border-radius: 12px; padding: 20px; margin-bottom: 20px; break-inside: avoid; }
  .footer { padding: 20px 40px; text-align: center; font-size: 10px; color: ${TEXT3}; border-top: 1px solid ${BORDER}; margin-top: 20px; }
  @media print { body { margin: 0; padding: 0; } .page { margin: 0; } .break { page-break-before: always; } }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div style="background:${roleColor};padding:60px 40px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
    <div style="position:relative;z-index:1">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px">Change Genius™ Assessment Report</div>
      <h1 style="font-size:48px;font-weight:900;color:white;letter-spacing:-2px;margin-bottom:12px">${derived.primary_role}</h1>
      <div style="font-size:18px;color:rgba(255,255,255,.7);margin-bottom:8px">Secondary: <strong style="color:white">${derived.secondary_role}</strong></div>
      <div style="display:inline-block;background:rgba(255,255,255,.2);color:white;font-size:13px;font-weight:700;padding:6px 18px;border-radius:100px;margin:16px 0 20px">${derived.role_pair_title}</div>
      <p style="font-size:14px;color:rgba(255,255,255,.8);line-height:1.6;max-width:500px">${narrative.executive_summary}</p>
      <div style="margin-top:32px;display:flex;gap:32px">
        <div><div style="font-size:10px;color:rgba(255,255,255,.5);letter-spacing:1px">ASSESSED</div><div style="font-size:14px;font-weight:600;color:white">${date}</div></div>
        <div><div style="font-size:10px;color:rgba(255,255,255,.5);letter-spacing:1px">ENERGY</div><div style="font-size:14px;font-weight:600;color:white">${derived.primary_energy}</div></div>
        <div><div style="font-size:10px;color:rgba(255,255,255,.5);letter-spacing:1px">PREPARED FOR</div><div style="font-size:14px;font-weight:600;color:white">${name}</div></div>
      </div>
    </div>
  </div>

  <!-- ROLE & ENERGY -->
  <div class="section">
    <div class="grid2">
      <div class="card">
        <div class="label">Your Change Genius Role</div>
        <h2>The ${narrative.role_name}</h2>
        <p><strong>${narrative.role_summary}</strong></p>
        <p>${narrative.role_detailed}</p>
        <div style="margin-top:16px">
          <div style="font-weight:700;margin-bottom:8px">Benefits</div>
          <ul style="list-style:none;padding-left:0">${roleBenefits}</ul>
          <div style="font-weight:700;margin-top:12px;margin-bottom:8px">Watchouts</div>
          <ul style="list-style:none;padding-left:0">${roleWatchouts}</ul>
        </div>
      </div>
      <div class="card">
        <div class="label">Productivity Energy</div>
        <h2>${narrative.energy_name} Energy</h2>
        <p><strong>${narrative.energy_summary}</strong></p>
        <p>${narrative.energy_detailed}</p>
        <div style="margin-top:16px">
          <div style="font-weight:700;margin-bottom:8px">Benefits</div>
          <ul style="list-style:none;padding-left:0">${energyBenefits}</ul>
          <div style="font-weight:700;margin-top:12px;margin-bottom:8px">Watchouts</div>
          <ul style="list-style:none;padding-left:0">${energyWatchouts}</ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ADAPTS STAGE MAP & SCORES -->
  <div class="section">
    <div class="label">ADAPTS Stage Profile</div>
    <div class="grid2">
      <div>${radarChartSVG(stageScoresMap)}</div>
      <div>${stageBarRows}</div>
    </div>
    <div class="grid2" style="margin-top:24px">
      <div style="background:#eff6ff;border-radius:12px;padding:16px;border-left:3px solid ${BLUE}">
        <div class="label" style="color:${BLUE}">Top Strengths</div>
        ${derived.top_adapts_stages.map((s) => `<div style="font-size:13px;font-weight:600;margin-bottom:6px">✓ ${s}</div>`).join("")}
        <p style="font-size:12px;margin-top:8px">${narrative.adapts_strengths_detailed}</p>
      </div>
      <div style="background:#fff7ed;border-radius:12px;padding:16px;border-left:3px solid #f97316">
        <div class="label" style="color:#ea580c">Growth Areas</div>
        ${derived.bottom_adapts_stages.map((s) => `<div style="font-size:13px;font-weight:600;margin-bottom:6px">↑ ${s}</div>`).join("")}
        <p style="font-size:12px;margin-top:8px">${narrative.adapts_growth_detailed}</p>
      </div>
    </div>
  </div>

  <!-- ALL ROLE SCORES -->
  <div class="section">
    <div class="label">All Role Scores</div>
    ${roleBarRows}
  </div>

  <!-- PAIRING SECTION -->
  <div class="section break">
    <div class="label">Your Unique Pairing</div>
    <h2>${narrative.pairing_name}</h2>
    <p>${narrative.pairing_description}</p>
    <div class="grid2" style="margin-top:20px">
      <div class="card">
        <div style="font-weight:700;margin-bottom:12px">✓ Benefits</div>
        <ul style="list-style:none;padding-left:0">${pairingBenefits}</ul>
      </div>
      <div class="card">
        <div style="font-weight:700;margin-bottom:12px">⚠ Watchouts</div>
        <ul style="list-style:none;padding-left:0">${pairingWatchouts}</ul>
      </div>
    </div>
  </div>

  <!-- YOU IN A TEAM CONTEXT -->
  <div class="section">
    <div class="label">You in a Team Context</div>
    <p>${narrative.individual_in_team}</p>
  </div>

  <!-- 30-DAY ACTION PLAN -->
  <div style="background:${NAVY};padding:40px;break-inside:avoid">
    <div class="label" style="color:rgba(255,255,255,.4)">Your Next 30 Days</div>
    <h2 style="color:white;margin-bottom:24px">Four actions to apply your strengths</h2>
    ${actionItems}
  </div>

  <!-- WHAT IS CHANGE GENIUS -->
  <div class="section">
    <div class="label">About Change Genius™</div>
    <p>${narrative.what_is_change_genius}</p>
  </div>

  <!-- HOW TO APPLY -->
  <div class="section">
    <div class="label">How to Apply Your Results</div>
    <div class="grid2">
      <div class="card">
        <h3 style="margin-bottom:8px">As an Individual</h3>
        <ul style="padding-left:20px">
          ${narrative.how_to_apply_as_individual.map((item) => `<li style="font-size:12px;margin-bottom:8px">${item}</li>`).join("")}
        </ul>
      </div>
      <div class="card">
        <h3 style="margin-bottom:8px">As a Team</h3>
        <ul style="padding-left:20px">
          ${narrative.how_to_apply_as_team.map((item) => `<li style="font-size:12px;margin-bottom:8px">${item}</li>`).join("")}
        </ul>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    changegenius™ · Powered by ADAPTS™ · Confidential · ${date}
  </div>

</div>
</body>
</html>`;
}

// ── Team report (simplified – you can extend later) ──────────
export function buildTeamReportHTML(opts: {
  teamName: string;
  diagnostic: TeamDiagnostic;
  memberNames: string[];
  date: string;
}): string {
  const { teamName, memberNames, date } = opts;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Team Report - ${teamName}</title></head><body><h1>${teamName} Team Report</h1><p>Members: ${memberNames.join(", ")}</p><p>Date: ${date}</p></body></html>`;
}

// ── PDF generation with fallback for local development ─────────
export async function generatePDF(html: string): Promise<Buffer> {
  let browser = null;
  try {
    let executablePath: string | undefined;

    // First try: use @sparticuz/chromium-min (works on Vercel)
    try {
      executablePath = await chromium.executablePath();
      console.log("[PDF] Using chromium-min executable:", executablePath);
    } catch (err) {
      console.warn("[PDF] chromium-min failed, trying local Chrome:", err);
      const localPaths = [
        process.env.CHROME_PATH,
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
      ].filter(Boolean) as string[];

      for (const path of localPaths) {
        if (fs.existsSync(path)) {
          executablePath = path;
          console.log("[PDF] Found local Chrome at:", path);
          break;
        }
      }

      if (!executablePath) {
        throw new Error(
          "No Chromium/Chrome executable found. Please install Chrome or set CHROME_PATH environment variable.",
        );
      }
    }

    browser = await puppeteer.launch({
      args: chromium.args || [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    return Buffer.from(pdf);
  } catch (err) {
    console.error("[PDF] Generation failed:", err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
