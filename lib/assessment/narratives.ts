/**
 * Change Genius™ — Narrative Template Engine
 * Deterministic. Template-driven. No AI-invented content.
 * Selects and assembles approved narrative blocks based on derived scores.
 */

import type { Role, AdaptsStage, Energy } from './questions'

export interface NarrativeInput {
  primary_role:         Role
  secondary_role:       Role
  role_pair_title:      string
  primary_energy:       Energy
  top_adapts_stages:    AdaptsStage[]
  bottom_adapts_stages: AdaptsStage[]
}

export interface Narrative {
  executive_summary:   string
  role_profile:        string
  adapts_strengths:    string
  adapts_growth:       string
  energy_profile:      string
  individual_in_team:  string
  next_30_days:        string[]  // action items
}

// ── Role descriptions ─────────────────────────────────────────
const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Innovator:  'You sense change before it arrives. Your strongest contribution is disrupting the status quo with fresh thinking and forward-looking ideas. You see possibilities where others see problems.',
  Achiever:   'You drive initiatives forward. Your strongest contribution is converting intention into momentum. When progress stalls, you restart it — through energy, urgency, and a bias for action.',
  Organizer:  'You create the structure that makes change possible. Your strongest contribution is ensuring that good ideas don\'t collapse in execution. You build the systems that hold change together.',
  Unifier:    'You build the trust that change requires. Your strongest contribution is keeping people connected during disruption. You create the psychological safety that allows hard conversations to happen.',
  Builder:    'You connect strategy to execution. Your strongest contribution is ensuring that decisions translate into operational reality. You keep teams aligned to purpose while managing complexity.',
  Refiner:    'You make change last. Your strongest contribution is continuous improvement — learning from what happened, strengthening what works, and preventing past mistakes from recurring.',
}

// ── Role-in-team descriptions ──────────────────────────────────
const ROLE_IN_TEAM: Record<Role, string> = {
  Innovator:  'In a team context, you are the early warning system and idea generator. Teams need you most at the start of change — when the status quo needs challenging and new direction is required. Watch for the tendency to move on before implementation is complete.',
  Achiever:   'In a team context, you are the engine. Teams need you when momentum is at risk or deadlines are being missed. Your urgency is valuable — but ensure your pace doesn\'t leave key voices behind.',
  Organizer:  'In a team context, you are the architect of execution. Teams need you to translate ambition into workable plans. Your structure prevents chaos — but ensure the plan stays flexible enough to adapt.',
  Unifier:    'In a team context, you are the social glue. Teams need you when trust is low, conflict is rising, or alignment is breaking down. Your gift for connection is powerful — ensure decisions still get made.',
  Builder:    'In a team context, you are the bridge between thinking and doing. Teams need you to connect strategy to action. Your ability to align work to purpose prevents drift — ensure you challenge direction when needed.',
  Refiner:    'In a team context, you are the memory and quality engine. Teams need you after initiatives to capture learning and prevent repetition of mistakes. Your focus on improvement is invaluable — ensure it doesn\'t slow necessary momentum.',
}

// ── Stage strength narratives ──────────────────────────────────
const STAGE_STRENGTH: Record<AdaptsStage, string> = {
  'Alert the System':          'You are naturally strong at sensing disruption early. You read signals others miss and create the urgency that opens organizations to change.',
  'Diagnose the Gaps':         'You are naturally strong at framing the real problem. You ask the harder questions and ensure organizations address root causes rather than symptoms.',
  'Access Readiness':          'You are naturally strong at preparing for change. You assess capability, capacity, and confidence before launch — reducing the risk of failed implementation.',
  'Participate Through Dialogue': 'You are naturally strong at building shared understanding. You surface hidden concerns and create the conversations that transform resistance into alignment.',
  'Transform Through Alignment':  'You are naturally strong at executing change. You convert agreement into action and keep teams coordinated through complex transformation.',
  'Scale and Sustain':         'You are naturally strong at making change last. You embed new behaviors, build sustaining systems, and ensure transformation survives beyond the initial push.',
}

// ── Stage growth narratives ────────────────────────────────────
const STAGE_GROWTH: Record<AdaptsStage, string> = {
  'Alert the System':          'Sensing disruption early is an area for development. You may benefit from deliberately seeking weak signals, challenging current assumptions, and spending time with people outside your immediate function.',
  'Diagnose the Gaps':         'Root cause analysis is an area for development. You may benefit from slowing down before solutions are selected, building diagnostic habits, and asking "why" more often before "how".',
  'Access Readiness':          'Preparation discipline is an area for development. You may benefit from building explicit readiness checks before major initiatives and ensuring capability gaps are identified before launch.',
  'Participate Through Dialogue': 'Facilitated dialogue is an area for development. You may benefit from creating more structured space for dissenting voices, and building stronger habits around listening before deciding.',
  'Transform Through Alignment':  'Execution alignment is an area for development. You may benefit from more explicit connection between strategy and operational work, and tighter coordination mechanisms during implementation.',
  'Scale and Sustain':         'Sustainability discipline is an area for development. You may benefit from building explicit review processes after initiatives, and creating systems that institutionalize new behaviors.',
}

// ── Energy profiles ────────────────────────────────────────────
const ENERGY_PROFILES: Record<Energy, string> = {
  Spark: 'Your primary energy is Spark — the energy of initiation, creativity, and disruption. You bring excitement and possibility to change. You are most alive at the beginning of something new and most at risk of losing interest before the finish line.',
  Build: 'Your primary energy is Build — the energy of construction, progress, and momentum. You bring drive and discipline to change. You are most alive when tangible progress is being made and most at risk of rushing past important conversations.',
  Polish: 'Your primary energy is Polish — the energy of refinement, quality, and precision. You bring rigor and improvement to change. You are most alive when systems can be made better and most at risk of perfectionism blocking progress.',
  Bond:  'Your primary energy is Bond — the energy of connection, trust, and collaboration. You bring relational intelligence to change. You are most alive when teams are unified and most at risk of avoiding necessary conflict.',
}

// ── 30-day action plans ────────────────────────────────────────
const ACTIONS_BY_ROLE: Record<Role, string[]> = {
  Innovator: [
    'Identify one assumption your team holds about a current challenge — and deliberately challenge it in the next team meeting.',
    'Spend 30 minutes this week reading outside your industry to bring one fresh pattern back to your work.',
    'Map one area where your organization is still using a 3-year-old approach to a problem that has changed.',
    'Nominate yourself as the person who asks "what if we did this completely differently?" in one upcoming decision.',
  ],
  Achiever: [
    'Identify the single biggest blocker to progress on your current initiative — and remove it this week.',
    'Set a visible 30-day milestone for your team and make progress against it a standing agenda item.',
    'Have one conversation with a slower-moving stakeholder to understand what would allow them to move faster.',
    'Review the last initiative that stalled and identify what broke the momentum — apply that learning now.',
  ],
  Organizer: [
    'Map the current initiative\'s key milestones, owners, and dependencies in one document this week.',
    'Identify the top three execution risks on your current priority and create a simple mitigation plan.',
    'Clarify roles and responsibilities with your team — write down who owns what decision.',
    'Run a 15-minute planning session before your next significant meeting to ensure the right preparation is in place.',
  ],
  Unifier: [
    'Identify who on your team is not being heard during the current change — and create a specific space for their voice.',
    'Have one one-on-one conversation this week whose purpose is listening, not informing.',
    'Name the unspoken tension in your current team dynamic — and plan how to surface it safely.',
    'Before the next major decision, ask three stakeholders with different perspectives what they need to support it.',
  ],
  Builder: [
    'Review your current initiative plan and identify where strategy and execution are most disconnected.',
    'Create a one-page alignment document that connects team work to organizational objectives.',
    'Have one conversation with your senior stakeholder to ensure your work is still aligned to current priorities.',
    'Identify the three decisions that are most likely to drift from strategic intent — and put monitoring in place.',
  ],
  Refiner: [
    'Schedule a 30-minute retrospective on your most recently completed initiative — capture what worked and what didn\'t.',
    'Identify one recurring problem in your team that has appeared before — and design a permanent fix.',
    'Document one key process that exists only in people\'s heads — and make it explicit.',
    'Choose one metric you should be tracking but aren\'t — and build a simple system to track it.',
  ],
}

// ── Pair-specific executive summaries ─────────────────────────
function buildExecutiveSummary(input: NarrativeInput): string {
  const { primary_role, secondary_role, role_pair_title } = input
  return `You are a ${role_pair_title} — a ${primary_role} with a strong ${secondary_role} dimension. ${ROLE_DESCRIPTIONS[primary_role]} Your ${secondary_role} secondary role adds ${getSecondaryAddition(secondary_role)} to your change leadership approach.`
}

function getSecondaryAddition(role: Role): string {
  const map: Record<Role, string> = {
    Innovator:  'creative disruption and idea generation',
    Achiever:   'execution drive and momentum',
    Organizer:  'structure and planning discipline',
    Unifier:    'relational intelligence and trust-building',
    Builder:    'strategic alignment and operational bridge-building',
    Refiner:    'continuous improvement and systems thinking',
  }
  return map[role]
}

// ── Main assembly function ─────────────────────────────────────
export function buildNarrative(input: NarrativeInput): Narrative {
  const top1    = input.top_adapts_stages[0]
  const top2    = input.top_adapts_stages[1]
  const bottom1 = input.bottom_adapts_stages[0]
  const bottom2 = input.bottom_adapts_stages[1]

  return {
    executive_summary: buildExecutiveSummary(input),

    role_profile: ROLE_DESCRIPTIONS[input.primary_role],

    adapts_strengths:
      `${STAGE_STRENGTH[top1]} ${top2 ? `You are also strong in the ${top2} stage. ${STAGE_STRENGTH[top2]}` : ''}`.trim(),

    adapts_growth:
      `${STAGE_GROWTH[bottom1]} ${bottom2 ? `The ${bottom2} stage is also an area to develop. ${STAGE_GROWTH[bottom2]}` : ''}`.trim(),

    energy_profile: ENERGY_PROFILES[input.primary_energy],

    individual_in_team: ROLE_IN_TEAM[input.primary_role],

    next_30_days: ACTIONS_BY_ROLE[input.primary_role],
  }
}
