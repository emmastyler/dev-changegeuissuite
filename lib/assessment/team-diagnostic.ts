/**
 * Change Genius™ — Team Diagnostic Engine
 * Computes team-level insights from individual scores
 */

import { ROLES, STAGES, ENERGIES, type Role, type AdaptsStage, type Energy } from './questions'

export interface MemberScore {
  userId:      string
  fullName:    string | null
  primaryRole: Role
  secondaryRole: Role
  stageScores: Record<AdaptsStage, number>
  energyScores: Record<Energy, number>
}

export type StageHealth = 'Strong' | 'Adequate' | 'At Risk' | 'Critical'

export interface TeamDiagnostic {
  // Role distribution
  roleDistribution:  Record<Role, number>         // count per role (uses top 2 per member)
  missingRoles:      Role[]
  overweightRoles:   Role[]                        // roles with >40% of team

  // ADAPTS stage health
  stageScores:       Record<AdaptsStage, number>  // mean 0-100
  stageHealth:       Record<AdaptsStage, StageHealth>

  // Energy
  energyScores:      Record<Energy, number>        // mean 0-100
  dominantEnergy:    Energy

  // Risk
  riskScore:         number                        // 0-100 (higher = more risk)
  riskLevel:         'Low' | 'Moderate' | 'High' | 'Critical'
  frictionPatterns:  string[]

  // Recommendations
  changePods:        ChangePod[]
  rollout90Days:     string[]

  memberCount:       number
  completedCount:    number
}

export interface ChangePod {
  name:    string
  focus:   AdaptsStage
  members: string[]  // userIds
  reason:  string
}

// ── Stage health thresholds ────────────────────────────────────
function getStageHealth(score: number): StageHealth {
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Adequate'
  if (score >= 30) return 'At Risk'
  return 'Critical'
}

// ── Friction pattern detection ─────────────────────────────────
function detectFrictionPatterns(
  roleDistribution: Record<Role, number>,
  stageHealth: Record<AdaptsStage, StageHealth>,
  dominantEnergy: Energy,
  memberCount: number
): string[] {
  const patterns: string[] = []

  // Too many Achievers + no Unifiers → execution without alignment
  if ((roleDistribution['Achiever'] ?? 0) > 2 && (roleDistribution['Unifier'] ?? 0) === 0) {
    patterns.push('Execution without alignment — high action drive but no trust-building presence. Risk of team fracture under pressure.')
  }

  // Too many Innovators + no Organizers → ideas without structure
  if ((roleDistribution['Innovator'] ?? 0) > 2 && (roleDistribution['Organizer'] ?? 0) === 0) {
    patterns.push('Ideas without structure — creative energy with no planning foundation. Initiatives likely to stall before launch.')
  }

  // No Refiner → change won't sustain
  if ((roleDistribution['Refiner'] ?? 0) === 0 && memberCount >= 5) {
    patterns.push('No sustainability anchor — without a Refiner, improvements are unlikely to be institutionalized after the change sprint.')
  }

  // No Builder → strategy-execution gap
  if ((roleDistribution['Builder'] ?? 0) === 0 && memberCount >= 5) {
    patterns.push('Strategy-execution gap — no one is translating decisions into operational plans. Alignment is at risk.')
  }

  // Weak dialogue stage + Spark dominant energy → ignored voices
  if (stageHealth['Participate Through Dialogue'] === 'Critical' || stageHealth['Participate Through Dialogue'] === 'At Risk') {
    if (dominantEnergy === 'Spark' || dominantEnergy === 'Build') {
      patterns.push('Ignored voices — the team moves fast but critical concerns are not being surfaced. Resistance likely to emerge later.')
    }
  }

  // Critical Alert stage → blind spots
  if (stageHealth['Alert the System'] === 'Critical') {
    patterns.push('Disruption blind spot — the team is not scanning for early warning signals. May be caught off-guard by external change.')
  }

  return patterns
}

// ── Suggest change pods ────────────────────────────────────────
function suggestChangePods(members: MemberScore[], stageHealth: Record<AdaptsStage, StageHealth>): ChangePod[] {
  const pods: ChangePod[] = []

  // Find the most At Risk / Critical stage → build a pod for it
  const priorityStage = STAGES
    .filter(s => stageHealth[s] === 'Critical' || stageHealth[s] === 'At Risk')
    .sort((a, b) => {
      const order = { Critical: 0, 'At Risk': 1, Adequate: 2, Strong: 3 }
      return order[stageHealth[a]] - order[stageHealth[b]]
    })[0]

  if (priorityStage) {
    // Assign top 2-3 members by their score in this stage
    const best = [...members]
      .sort((a, b) => (b.stageScores[priorityStage] ?? 0) - (a.stageScores[priorityStage] ?? 0))
      .slice(0, 3)

    pods.push({
      name:    `${priorityStage} Pod`,
      focus:   priorityStage,
      members: best.map(m => m.userId),
      reason:  `Your team scores lowest in "${priorityStage}". This pod should own improving team capability in this stage.`,
    })
  }

  // Execution pod — top Builders + Achievers
  const executors = members
    .filter(m => m.primaryRole === 'Builder' || m.primaryRole === 'Achiever' || m.secondaryRole === 'Builder')
    .slice(0, 4)

  if (executors.length >= 2) {
    pods.push({
      name:    'Execution Pod',
      focus:   'Transform Through Alignment',
      members: executors.map(m => m.userId),
      reason:  'Builders and Achievers drive operational alignment. This pod should own initiative execution and cross-team coordination.',
    })
  }

  return pods
}

// ── 90-day rollout plan ────────────────────────────────────────
function build90DayPlan(
  missingRoles: Role[],
  criticalStages: AdaptsStage[],
  frictionPatterns: string[]
): string[] {
  const plan: string[] = []

  plan.push('Days 1–30: Run individual debrief sessions with each team member. Share role profiles and ADAPTS strengths so each person understands their contribution to the system.')

  if (criticalStages.length > 0) {
    plan.push(`Days 15–45: Focus team sessions on your lowest-scoring stage — "${criticalStages[0]}". Run a structured dialogue session to surface what is blocking this capability.`)
  } else {
    plan.push('Days 15–45: Facilitate a Team Change Map™ session using role distribution data to assign stage ownership across the team.')
  }

  if (missingRoles.length > 0) {
    plan.push(`Days 30–60: Your team is missing the ${missingRoles.join(' and ')} role(s). Consider bringing in external support or developing this capability through targeted coaching.`)
  } else {
    plan.push('Days 30–60: Begin the Weekly Change Pulse™ — a short weekly check-in to track momentum, dialogue, and alignment across the team.')
  }

  if (frictionPatterns.length > 0) {
    plan.push('Days 60–90: Address identified friction patterns directly. Schedule a structured retrospective using the team diagnostic report to build shared accountability.')
  } else {
    plan.push('Days 60–90: Review progress on 30-day action plans. Identify two team-level improvement areas and assign pod ownership for the next quarter.')
  }

  return plan
}

// ── MAIN FUNCTION ──────────────────────────────────────────────
export function computeTeamDiagnostic(members: MemberScore[]): TeamDiagnostic {
  const n = members.length

  // ── Role distribution (top 2 roles per member) ───────────────
  const roleDistribution = Object.fromEntries(ROLES.map(r => [r, 0])) as Record<Role, number>
  for (const m of members) {
    roleDistribution[m.primaryRole]   = (roleDistribution[m.primaryRole] ?? 0) + 1
    roleDistribution[m.secondaryRole] = (roleDistribution[m.secondaryRole] ?? 0) + 1
  }

  const missingRoles   = ROLES.filter(r => roleDistribution[r] === 0)
  const overweightRoles = ROLES.filter(r => n > 0 && (roleDistribution[r] / (n * 2)) > 0.4)

  // ── Stage means ──────────────────────────────────────────────
  const stageScores = Object.fromEntries(STAGES.map(s => [s, 0])) as Record<AdaptsStage, number>
  if (n > 0) {
    for (const s of STAGES) {
      const total = members.reduce((sum, m) => sum + (m.stageScores[s] ?? 0), 0)
      stageScores[s] = Math.round(total / n)
    }
  }

  const stageHealth = Object.fromEntries(
    STAGES.map(s => [s, getStageHealth(stageScores[s])])
  ) as Record<AdaptsStage, StageHealth>

  // ── Energy means ─────────────────────────────────────────────
  const energyScores = Object.fromEntries(ENERGIES.map(e => [e, 0])) as Record<Energy, number>
  if (n > 0) {
    for (const e of ENERGIES) {
      const total = members.reduce((sum, m) => sum + (m.energyScores[e] ?? 0), 0)
      energyScores[e] = Math.round(total / n)
    }
  }
  const dominantEnergy = ENERGIES.sort((a, b) => energyScores[b] - energyScores[a])[0]

  // ── Risk score ───────────────────────────────────────────────
  let riskScore = 0
  riskScore += missingRoles.length * 12           // 12 pts per missing role
  riskScore += overweightRoles.length * 8          // 8 pts per overweight role
  const criticalStages = STAGES.filter(s => stageHealth[s] === 'Critical')
  const atRiskStages   = STAGES.filter(s => stageHealth[s] === 'At Risk')
  riskScore += criticalStages.length * 15          // 15 pts per critical stage
  riskScore += atRiskStages.length * 7             // 7 pts per at-risk stage
  riskScore = Math.min(100, riskScore)

  const riskLevel: TeamDiagnostic['riskLevel'] =
    riskScore >= 70 ? 'Critical' :
    riskScore >= 45 ? 'High' :
    riskScore >= 20 ? 'Moderate' : 'Low'

  const frictionPatterns = detectFrictionPatterns(roleDistribution, stageHealth, dominantEnergy, n)
  const changePods       = suggestChangePods(members, stageHealth)
  const rollout90Days    = build90DayPlan(missingRoles, criticalStages, frictionPatterns)

  return {
    roleDistribution,
    missingRoles,
    overweightRoles,
    stageScores,
    stageHealth,
    energyScores,
    dominantEnergy,
    riskScore,
    riskLevel,
    frictionPatterns,
    changePods,
    rollout90Days,
    memberCount:    n,
    completedCount: members.length,
  }
}
