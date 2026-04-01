/**
 * Change Genius™ — Scoring Engine v1
 *
 * Inputs:  record of { questionId: value (1-5) }
 * Outputs: role scores, stage scores, energy scores, derived results
 *
 * Rules:
 * - Apply reverse scoring where question.reverse === true (score = 6 - value)
 * - Average per role/stage/energy
 * - Normalize to 0–100
 * - Resolve ties deterministically (alphabetical order for roles)
 */

import {
  QUESTIONS,
  ROLES,
  STAGES,
  ENERGIES,
  type Role,
  type AdaptsStage,
  type Energy,
} from './questions'

export type Responses = Record<string, number> // { questionId: 1-5 }

export interface RoleScores    extends Record<Role, number> {}
export interface StageScores   extends Record<AdaptsStage, number> {}
export interface EnergyScores  extends Record<Energy, number> {}

export interface DerivedResults {
  primary_role:          Role
  secondary_role:        Role
  role_pair_title:       string
  primary_energy:        Energy
  top_adapts_stages:     AdaptsStage[]  // top 2
  bottom_adapts_stages:  AdaptsStage[]  // bottom 2
}

export interface ScoreResult {
  role_scores:   RoleScores
  stage_scores:  StageScores
  energy_scores: EnergyScores
  derived:       DerivedResults
}

// ── Role pair titles (primary + secondary → title) ─────────────
const ROLE_PAIR_TITLES: Partial<Record<string, string>> = {
  'Innovator+Achiever':   'The Change Driver',
  'Innovator+Organizer':  'The Strategic Inventor',
  'Innovator+Unifier':    'The Visionary Connector',
  'Innovator+Builder':    'The Architect of Change',
  'Innovator+Refiner':    'The Creative Improver',
  'Achiever+Innovator':   'The Momentum Builder',
  'Achiever+Organizer':   'The Execution Specialist',
  'Achiever+Unifier':     'The People-Driven Leader',
  'Achiever+Builder':     'The Strategic Executor',
  'Achiever+Refiner':     'The Results-Focused Optimizer',
  'Organizer+Innovator':  'The Structured Strategist',
  'Organizer+Achiever':   'The Delivery Architect',
  'Organizer+Unifier':    'The Systems Unifier',
  'Organizer+Builder':    'The Master Planner',
  'Organizer+Refiner':    'The Precision Operator',
  'Unifier+Innovator':    'The Empathetic Visionary',
  'Unifier+Achiever':     'The Relationship Driver',
  'Unifier+Organizer':    'The Collaborative Organizer',
  'Unifier+Builder':      'The Trust Builder',
  'Unifier+Refiner':      'The Inclusive Improver',
  'Builder+Innovator':    'The Bridge Builder',
  'Builder+Achiever':     'The Strategic Activator',
  'Builder+Organizer':    'The Systems Architect',
  'Builder+Unifier':      'The Alignment Champion',
  'Builder+Refiner':      'The Operational Excellence Leader',
  'Refiner+Innovator':    'The Continuous Innovator',
  'Refiner+Achiever':     'The Performance Optimizer',
  'Refiner+Organizer':    'The Systems Perfectionist',
  'Refiner+Unifier':      'The Culture Steward',
  'Refiner+Builder':      'The Sustainable Change Leader',
}

function getRolePairTitle(primary: Role, secondary: Role): string {
  return ROLE_PAIR_TITLES[`${primary}+${secondary}`] ?? `The ${primary} ${secondary}`
}

// ── Core scoring ───────────────────────────────────────────────

/** Apply reverse scoring if needed */
function applyPolarity(value: number, reverse: boolean): number {
  return reverse ? 6 - value : value
}

/** Normalize raw average (1–5 scale) to 0–100 */
function normalize(avg: number): number {
  return Math.round(((avg - 1) / 4) * 100)
}

/** Get top N items from a scored map, sorted desc, ties broken alphabetically */
function topN<T extends string>(scores: Record<T, number>, n: number): T[] {
  return (Object.keys(scores) as T[])
    .sort((a, b) => {
      const diff = scores[b] - scores[a]
      return diff !== 0 ? diff : a.localeCompare(b) // tie-break alphabetically
    })
    .slice(0, n)
}

export function calculateScores(responses: Responses): ScoreResult {
  // ── Step 1: accumulate raw scores per dimension ──────────────
  const roleRaw   = {} as Record<Role, number[]>
  const stageRaw  = {} as Record<AdaptsStage, number[]>
  const energyRaw = {} as Record<Energy, number[]>
  for (const r of ROLES)    roleRaw[r]   = []
  for (const s of STAGES)   stageRaw[s]  = []
  for (const e of ENERGIES) energyRaw[e] = []

  for (const q of QUESTIONS) {
    const raw = responses[q.id]
    if (raw == null) continue // unanswered question — skip

    const adjusted = applyPolarity(raw, q.reverse)
    roleRaw[q.role].push(adjusted)
    stageRaw[q.stage].push(adjusted)
    energyRaw[q.energy].push(adjusted)
  }

  // ── Step 2: average and normalize ────────────────────────────
  function avg(arr: number[]): number {
    if (arr.length === 0) return 1
    return arr.reduce((s, v) => s + v, 0) / arr.length
  }

  const role_scores = Object.fromEntries(
    ROLES.map(r => [r, normalize(avg(roleRaw[r]))])
  ) as RoleScores

  const stage_scores = Object.fromEntries(
    STAGES.map(s => [s, normalize(avg(stageRaw[s]))])
  ) as StageScores

  const energy_scores = Object.fromEntries(
    ENERGIES.map(e => [e, normalize(avg(energyRaw[e]))])
  ) as EnergyScores

  // ── Step 3: derive results ────────────────────────────────────
  const [primary_role, secondary_role] = topN(role_scores, 2) as [Role, Role]
  const [primary_energy] = topN(energy_scores, 1) as [Energy]
  const top_adapts_stages   = topN(stage_scores, 2) as AdaptsStage[]
  const bottom_adapts_stages = (Object.keys(stage_scores) as AdaptsStage[])
    .sort((a, b) => {
      const diff = stage_scores[a] - stage_scores[b]
      return diff !== 0 ? diff : a.localeCompare(b)
    })
    .slice(0, 2)

  const derived: DerivedResults = {
    primary_role,
    secondary_role,
    role_pair_title: getRolePairTitle(primary_role, secondary_role),
    primary_energy,
    top_adapts_stages,
    bottom_adapts_stages,
  }

  return { role_scores, stage_scores, energy_scores, derived }
}
