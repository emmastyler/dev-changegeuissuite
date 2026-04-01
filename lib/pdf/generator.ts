/**
 * Change Genius™ — PDF Generator
 * Uses puppeteer-core (lightweight) to render HTML → PDF
 * Falls back to a print-friendly HTML response if Chromium unavailable
 */

import type { ScoreResult } from '@/lib/assessment/scoring'
import type { Narrative }   from '@/lib/assessment/narratives'
import type { TeamDiagnostic } from '@/lib/assessment/team-diagnostic'

// ── Color palette (matches design system) ─────────────────────
const NAVY    = '#0a2540'
const BLUE    = '#1a6bfa'
const SAGE    = '#edf1f7'
const TEXT2   = '#334155'
const TEXT3   = '#64748b'
const BORDER  = '#e2e8f0'

const ROLE_COLORS: Record<string, string> = {
  Innovator: NAVY, Achiever: '#1557d4', Organizer: BLUE,
  Unifier: '#4d8ef8', Builder: '#93b8fb', Refiner: '#0d3060',
}
const STAGE_COLORS: Record<string, string> = {
  'Alert the System':             NAVY,
  'Diagnose the Gaps':            '#0d3060',
  'Access Readiness':             '#1557d4',
  'Participate Through Dialogue': BLUE,
  'Transform Through Alignment':  '#4d8ef8',
  'Scale and Sustain':            '#93b8fb',
}
const HEALTH_COLORS: Record<string, string> = {
  Strong: '#16a34a', Adequate: BLUE, 'At Risk': '#d97706', Critical: '#dc2626',
}

// ── Bar HTML helper ────────────────────────────────────────────
function bar(label: string, score: number, color: string): string {
  return `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:${TEXT2}">${label}</span>
        <span style="font-size:12px;font-weight:700;color:${NAVY}">${score}</span>
      </div>
      <div style="height:8px;background:${BORDER};border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${score}%;background:${color};border-radius:4px"></div>
      </div>
    </div>`
}

// ── Individual report HTML ─────────────────────────────────────
export function buildIndividualReportHTML(opts: {
  fullName:   string | null
  scores:     ScoreResult
  narrative:  Narrative
  completedAt: string
}): string {
  const { fullName, scores, narrative, completedAt } = opts
  const { derived, role_scores, stage_scores, energy_scores } = scores
  const name = fullName ?? 'Leader'
  const date = new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const roleColor = ROLE_COLORS[derived.primary_role] ?? NAVY

  const roleBarRows = (Object.entries(role_scores) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([r, s]) => bar(r, s, ROLE_COLORS[r] ?? BLUE))
    .join('')

  const stageBarRows = (Object.entries(stage_scores) as [string, number][])
    .map(([s, sc]) => bar(s, sc, STAGE_COLORS[s] ?? BLUE))
    .join('')

  const actionItems = narrative.next_30_days.map((a, i) => `
    <div style="display:flex;gap:12px;padding:12px 16px;background:#f8f9fc;border-radius:8px;margin-bottom:8px">
      <div style="width:24px;height:24px;border-radius:50%;background:${BLUE};color:white;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
      <p style="font-size:12px;color:${TEXT2};line-height:1.6;margin:0">${a}</p>
    </div>`).join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: ${NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 794px; margin: 0 auto; padding: 0; }
  .section { padding: 32px 40px; border-bottom: 1px solid ${BORDER}; page-break-inside: avoid; }
  h2 { font-size: 18px; font-weight: 800; color: ${NAVY}; letter-spacing: -0.3px; margin-bottom: 12px; }
  h3 { font-size: 14px; font-weight: 700; color: ${NAVY}; margin-bottom: 8px; }
  p  { font-size: 13px; color: ${TEXT2}; line-height: 1.7; }
  .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card { background: #f8f9fc; border-radius: 10px; padding: 18px 20px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div style="background:${roleColor};padding:52px 40px 40px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px">Change Genius™ Individual Report</div>
    <div style="font-size:40px;font-weight:900;color:white;letter-spacing:-1.5px;line-height:1;margin-bottom:8px">${derived.primary_role}</div>
    <div style="font-size:16px;color:rgba(255,255,255,.65);margin-bottom:6px">Secondary: <strong style="color:rgba(255,255,255,.85)">${derived.secondary_role}</strong></div>
    <div style="display:inline-block;background:rgba(255,255,255,.18);color:white;font-size:12px;font-weight:700;padding:5px 14px;border-radius:100px;margin-bottom:20px">${derived.role_pair_title}</div>
    <p style="font-size:13px;color:rgba(255,255,255,.7);line-height:1.65;max-width:480px">${narrative.executive_summary}</p>
    <div style="margin-top:24px;display:flex;gap:24px">
      <div><div style="font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Assessed</div><div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.75)">${date}</div></div>
      <div><div style="font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Energy</div><div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.75)">${derived.primary_energy}</div></div>
      <div><div style="font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Prepared for</div><div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.75)">${name}</div></div>
    </div>
  </div>

  <!-- ADAPTS STRENGTHS & GROWTH -->
  <div class="section">
    <div class="label" style="color:${BLUE}">ADAPTS Stage Profile</div>
    ${stageBarRows}
    <div class="grid2" style="margin-top:20px">
      <div style="background:#eff6ff;border-radius:10px;padding:14px 16px;border-left:3px solid ${BLUE}">
        <div class="label" style="color:${BLUE}">Top Strengths</div>
        ${derived.top_adapts_stages.map(s => `<div style="font-size:12px;font-weight:600;color:${NAVY};margin-bottom:3px">✓ ${s}</div>`).join('')}
      </div>
      <div style="background:#fff7ed;border-radius:10px;padding:14px 16px;border-left:3px solid #f97316">
        <div class="label" style="color:#ea580c">Growth Areas</div>
        ${derived.bottom_adapts_stages.map(s => `<div style="font-size:12px;font-weight:600;color:${NAVY};margin-bottom:3px">↑ ${s}</div>`).join('')}
      </div>
    </div>
  </div>

  <!-- ROLE SCORES -->
  <div class="section">
    <div class="label" style="color:${BLUE}">All Role Scores</div>
    ${roleBarRows}
  </div>

  <!-- NARRATIVE -->
  <div class="section">
    <div class="label" style="color:${BLUE}">Role Profile</div>
    <h2>The ${derived.primary_role}</h2>
    <p>${narrative.role_profile}</p>
  </div>

  <div class="section">
    <div class="label" style="color:${BLUE}">Energy Profile</div>
    <h2>${derived.primary_energy} Energy</h2>
    <p>${narrative.energy_profile}</p>
  </div>

  <div class="section">
    <div class="grid2">
      <div>
        <div class="label" style="color:${BLUE}">ADAPTS Strengths</div>
        <p>${narrative.adapts_strengths}</p>
      </div>
      <div>
        <div class="label" style="color:#ea580c">Growth Areas</div>
        <p>${narrative.adapts_growth}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="label" style="color:${BLUE}">You in a Team Context</div>
    <p>${narrative.individual_in_team}</p>
  </div>

  <!-- 30-DAY PLAN -->
  <div style="background:${NAVY};padding:32px 40px">
    <div class="label" style="color:rgba(255,255,255,.4)">Your Next 30 Days</div>
    <h2 style="color:white;margin-bottom:20px">Four actions to apply your strengths</h2>
    ${actionItems}
  </div>

  <!-- FOOTER -->
  <div style="padding:20px 40px;text-align:center">
    <div style="font-size:11px;color:${TEXT3}">changegenius™ · Powered by ADAPTS™ · ${date} · Confidential</div>
  </div>

</div>
</body>
</html>`
}

// ── Team report HTML ───────────────────────────────────────────
export function buildTeamReportHTML(opts: {
  teamName:    string
  diagnostic:  TeamDiagnostic
  memberNames: string[]
  date:        string
}): string {
  const { teamName, diagnostic: d, memberNames, date } = opts

  const stageRows = (Object.entries(d.stageScores) as [string, number][])
    .map(([s, sc]) => bar(s, sc, HEALTH_COLORS[(d.stageHealth as Record<string,string>)[s]] ?? BLUE))
    .join('')

  const roleRows = (Object.entries(d.roleDistribution) as [string, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([r, c]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid ${BORDER};font-size:13px"><span style="color:${TEXT2};font-weight:600">${r}</span><span style="font-weight:700;color:${NAVY}">${c}</span></div>`)
    .join('')

  const frictionItems = d.frictionPatterns.map(p => `
    <div style="display:flex;gap:10px;margin-bottom:10px;padding:12px 14px;background:#fff7ed;border-radius:8px">
      <span style="font-size:14px;flex-shrink:0">⚠</span>
      <p style="font-size:12px;color:#92400e;line-height:1.6;margin:0">${p}</p>
    </div>`).join('')

  const planItems = d.rollout90Days.map((item, i) => `
    <div style="display:flex;gap:12px;margin-bottom:10px;padding:12px 16px;background:#f8f9fc;border-radius:8px">
      <div style="width:24px;height:24px;border-radius:50%;background:${BLUE};color:white;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
      <p style="font-size:12px;color:${TEXT2};line-height:1.6;margin:0">${item}</p>
    </div>`).join('')

  const riskBg = d.riskLevel === 'Low' ? '#f0fdf4' : d.riskLevel === 'Moderate' ? '#fff7ed' : '#fef2f2'
  const riskColor = d.riskLevel === 'Low' ? '#16a34a' : d.riskLevel === 'Moderate' ? '#d97706' : '#dc2626'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: ${NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { max-width: 794px; margin: 0 auto; }
  .section { padding: 28px 40px; border-bottom: 1px solid ${BORDER}; page-break-inside: avoid; }
  .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${BLUE}; margin-bottom: 10px; }
  h2 { font-size: 18px; font-weight: 800; color: ${NAVY}; letter-spacing: -0.3px; margin-bottom: 12px; }
  p { font-size: 13px; color: ${TEXT2}; line-height: 1.7; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div style="background:${NAVY};padding:52px 40px 40px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(26,107,250,.15)"></div>
    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px">Change Genius™ Team Report</div>
    <div style="font-size:36px;font-weight:900;color:white;letter-spacing:-1px;line-height:1;margin-bottom:8px">${teamName}</div>
    <div style="font-size:14px;color:rgba(255,255,255,.55);margin-bottom:20px">${d.completedCount} members assessed · ${date}</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      ${memberNames.map(n => `<div style="background:rgba(255,255,255,.1);border-radius:100px;padding:4px 14px;font-size:12px;color:rgba(255,255,255,.75);font-weight:600">${n}</div>`).join('')}
    </div>
  </div>

  <!-- RISK SUMMARY -->
  <div class="section">
    <div class="label">Team Risk Assessment</div>
    <div class="grid3">
      <div style="background:${riskBg};border-radius:10px;padding:18px 20px;text-align:center">
        <div style="font-size:10px;font-weight:700;color:${TEXT3};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Risk Score</div>
        <div style="font-size:32px;font-weight:900;color:${riskColor}">${d.riskScore}</div>
        <div style="font-size:12px;font-weight:700;color:${TEXT2}">${d.riskLevel}</div>
      </div>
      <div style="background:#f8f9fc;border-radius:10px;padding:18px 20px">
        <div style="font-size:10px;font-weight:700;color:${TEXT3};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Missing Roles</div>
        ${d.missingRoles.length === 0
          ? `<div style="font-size:13px;color:#16a34a;font-weight:600">✓ All covered</div>`
          : d.missingRoles.map(r => `<div style="font-size:12px;font-weight:600;color:#dc2626;margin-bottom:2px">✗ ${r}</div>`).join('')}
      </div>
      <div style="background:#f8f9fc;border-radius:10px;padding:18px 20px">
        <div style="font-size:10px;font-weight:700;color:${TEXT3};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Friction Patterns</div>
        <div style="font-size:28px;font-weight:900;color:${d.frictionPatterns.length === 0 ? '#16a34a' : '#d97706'}">${d.frictionPatterns.length}</div>
        <div style="font-size:12px;color:${TEXT3}">detected</div>
      </div>
    </div>
  </div>

  <!-- ROLE DISTRIBUTION -->
  <div class="section">
    <div class="label">Role Distribution</div>
    ${roleRows}
  </div>

  <!-- ADAPTS COVERAGE -->
  <div class="section">
    <div class="label">ADAPTS Stage Coverage</div>
    ${stageRows}
  </div>

  <!-- FRICTION PATTERNS -->
  ${d.frictionPatterns.length > 0 ? `
  <div class="section">
    <div class="label" style="color:#ea580c">Friction Patterns</div>
    ${frictionItems}
  </div>` : ''}

  <!-- CHANGE PODS -->
  ${d.changePods.length > 0 ? `
  <div class="section">
    <div class="label">Recommended Change Pods</div>
    ${d.changePods.map(pod => `
      <div style="background:#f8f9fc;border-radius:10px;padding:16px 18px;margin-bottom:10px">
        <div style="font-size:13px;font-weight:700;color:${NAVY};margin-bottom:4px">${pod.name}</div>
        <div style="font-size:11px;color:${BLUE};font-weight:600;margin-bottom:6px">${pod.focus}</div>
        <p style="font-size:12px;color:${TEXT3}">${pod.reason}</p>
      </div>`).join('')}
  </div>` : ''}

  <!-- 90-DAY PLAN -->
  <div style="background:${NAVY};padding:28px 40px">
    <div class="label" style="color:rgba(255,255,255,.4)">90-Day Team Rollout Plan</div>
    <h2 style="color:white;margin-bottom:16px">Recommended steps for your team</h2>
    ${planItems}
  </div>

  <!-- FOOTER -->
  <div style="padding:16px 40px;text-align:center">
    <div style="font-size:11px;color:${TEXT3}">changegenius™ · Team Change Map™ · ${date} · Confidential</div>
  </div>

</div>
</body>
</html>`
}

// ── Launch Chromium and generate PDF ──────────────────────────
export async function generatePDF(html: string): Promise<Buffer> {
  // Dynamic import so build doesn't fail if Chromium not present
  const puppeteer = await import('puppeteer-core')

  // Try to find a local Chrome/Chromium installation
  const executablePath =
    process.env.CHROME_PATH ||
    '/usr/bin/google-chrome-stable'

  const browser = await puppeteer.default.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
