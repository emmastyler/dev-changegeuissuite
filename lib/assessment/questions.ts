/**
 * Change Genius™ — Question Bank v1
 * 60 questions across 6 roles (10 each)
 * Maps to: role scores, ADAPTS stage scores, energy scores
 *
 * Response scale: 1=Strongly Disagree, 2=Disagree, 3=Neutral, 4=Agree, 5=Strongly Agree
 * reverse: true means score is inverted (6 - value) before use
 */

export type Role = 'Innovator' | 'Achiever' | 'Organizer' | 'Unifier' | 'Builder' | 'Refiner'
export type AdaptsStage =
  | 'Alert the System'
  | 'Diagnose the Gaps'
  | 'Access Readiness'
  | 'Participate Through Dialogue'
  | 'Transform Through Alignment'
  | 'Scale and Sustain'
export type Energy = 'Spark' | 'Build' | 'Polish' | 'Bond'

export interface Question {
  id: string           // e.g. "INNOVATOR_1"
  text: string
  role: Role
  stage: AdaptsStage
  energy: Energy
  reverse: boolean     // if true, score = 6 - value
  order: number        // global display order 1–60
}

export const QUESTIONS: Question[] = [
  // ── INNOVATOR (10 questions) ──────────────────────────────
  {
    id: 'INNOVATOR_1', order: 1,
    text: 'When challenges emerge, I quickly begin exploring new ideas that could address them.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_2', order: 2,
    text: 'I often recognize opportunities for improvement before others notice them.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_3', order: 3,
    text: 'When a system stops producing results, I naturally look for different approaches.',
    role: 'Innovator', stage: 'Diagnose the Gaps', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_4', order: 4,
    text: 'I prefer exploring possibilities before committing to one solution.',
    role: 'Innovator', stage: 'Diagnose the Gaps', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_5', order: 5,
    text: 'I encourage teams to challenge assumptions about how things currently work.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_6', order: 6,
    text: 'I feel energized when imagining future possibilities.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_7', order: 7,
    text: 'I frequently connect ideas from different areas to generate new solutions.',
    role: 'Innovator', stage: 'Diagnose the Gaps', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_8', order: 8,
    text: 'I become impatient when conversations about change focus too much on risks.',
    role: 'Innovator', stage: 'Access Readiness', energy: 'Spark', reverse: true, // reverse scored
  },
  {
    id: 'INNOVATOR_9', order: 9,
    text: 'I actively look for patterns that indicate future disruption or opportunity.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },
  {
    id: 'INNOVATOR_10', order: 10,
    text: 'I prefer creating new approaches rather than improving existing systems.',
    role: 'Innovator', stage: 'Alert the System', energy: 'Spark', reverse: false,
  },

  // ── ACHIEVER (10 questions) ───────────────────────────────
  {
    id: 'ACHIEVER_1', order: 11,
    text: 'When goals are defined, I naturally push the team to begin executing.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_2', order: 12,
    text: 'I feel responsible for ensuring initiatives move forward.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_3', order: 13,
    text: 'I often take initiative when progress slows.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_4', order: 14,
    text: 'I prefer action over prolonged analysis.',
    role: 'Achiever', stage: 'Diagnose the Gaps', energy: 'Build', reverse: true, // reverse scored
  },
  {
    id: 'ACHIEVER_5', order: 15,
    text: 'I measure success by the results that are achieved.',
    role: 'Achiever', stage: 'Scale and Sustain', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_6', order: 16,
    text: 'When teams hesitate, I encourage them to move forward.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_7', order: 17,
    text: 'I focus on turning plans into tangible progress.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_8', order: 18,
    text: 'I often set ambitious targets for initiatives.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_9', order: 19,
    text: 'I track progress closely during major initiatives.',
    role: 'Achiever', stage: 'Scale and Sustain', energy: 'Build', reverse: false,
  },
  {
    id: 'ACHIEVER_10', order: 20,
    text: 'I believe momentum is essential for successful change.',
    role: 'Achiever', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },

  // ── ORGANIZER (10 questions) ──────────────────────────────
  {
    id: 'ORGANIZER_1', order: 21,
    text: 'Before initiatives begin, I analyze potential obstacles.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_2', order: 22,
    text: 'I naturally create plans to coordinate complex work.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_3', order: 23,
    text: 'I think carefully about resources required for change.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_4', order: 24,
    text: 'I often identify gaps between strategy and execution.',
    role: 'Organizer', stage: 'Diagnose the Gaps', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_5', order: 25,
    text: 'I prefer clearly structured processes.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Polish', reverse: false,
  },
  {
    id: 'ORGANIZER_6', order: 26,
    text: 'I enjoy organizing initiatives so teams can work effectively.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_7', order: 27,
    text: 'I often create frameworks that help others execute.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_8', order: 28,
    text: 'I feel uncomfortable when initiatives lack structure.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Polish', reverse: false,
  },
  {
    id: 'ORGANIZER_9', order: 29,
    text: 'I frequently ask how ideas will be implemented.',
    role: 'Organizer', stage: 'Diagnose the Gaps', energy: 'Build', reverse: false,
  },
  {
    id: 'ORGANIZER_10', order: 30,
    text: 'I prefer structured planning before major decisions.',
    role: 'Organizer', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },

  // ── UNIFIER (10 questions) ────────────────────────────────
  {
    id: 'UNIFIER_1', order: 31,
    text: 'I encourage people to express concerns during change.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_2', order: 32,
    text: 'I try to understand how decisions affect different stakeholders.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_3', order: 33,
    text: 'I help teams stay connected when tensions arise.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_4', order: 34,
    text: 'I listen carefully before forming conclusions.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_5', order: 35,
    text: 'I notice emotional reactions during change.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_6', order: 36,
    text: 'I try to ensure everyone feels heard.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_7', order: 37,
    text: 'I value collaboration over individual control.',
    role: 'Unifier', stage: 'Transform Through Alignment', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_8', order: 38,
    text: 'I help teams resolve disagreements constructively.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_9', order: 39,
    text: 'I prioritize maintaining trust during change.',
    role: 'Unifier', stage: 'Transform Through Alignment', energy: 'Bond', reverse: false,
  },
  {
    id: 'UNIFIER_10', order: 40,
    text: 'I believe dialogue is essential before action.',
    role: 'Unifier', stage: 'Participate Through Dialogue', energy: 'Bond', reverse: false,
  },

  // ── BUILDER (10 questions) ────────────────────────────────
  {
    id: 'BUILDER_1', order: 41,
    text: 'I focus on turning strategic ideas into practical actions.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_2', order: 42,
    text: 'I ensure teams understand how their work contributes to larger goals.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_3', order: 43,
    text: 'I connect decisions to implementation steps.',
    role: 'Builder', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_4', order: 44,
    text: 'I work to align resources with priorities.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_5', order: 45,
    text: 'I prefer translating ideas into operational plans.',
    role: 'Builder', stage: 'Access Readiness', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_6', order: 46,
    text: 'I help teams maintain focus on strategic objectives.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_7', order: 47,
    text: 'I ensure initiatives stay aligned with goals.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_8', order: 48,
    text: 'I connect strategy discussions with practical execution.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_9', order: 49,
    text: 'I ensure actions match organizational priorities.',
    role: 'Builder', stage: 'Transform Through Alignment', energy: 'Build', reverse: false,
  },
  {
    id: 'BUILDER_10', order: 50,
    text: 'I monitor whether change initiatives remain aligned.',
    role: 'Builder', stage: 'Scale and Sustain', energy: 'Build', reverse: false,
  },

  // ── REFINER (10 questions) ────────────────────────────────
  {
    id: 'REFINER_1', order: 51,
    text: 'I look for ways to improve systems after implementation.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_2', order: 52,
    text: 'I analyze what worked and what did not.',
    role: 'Refiner', stage: 'Diagnose the Gaps', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_3', order: 53,
    text: 'I focus on improving processes continuously.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_4', order: 54,
    text: 'I document lessons from change initiatives.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_5', order: 55,
    text: 'I prefer refining systems rather than starting from scratch.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_6', order: 56,
    text: 'I help teams learn from past initiatives.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_7', order: 57,
    text: 'I believe improvement should be ongoing.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_8', order: 58,
    text: 'I review outcomes to strengthen future efforts.',
    role: 'Refiner', stage: 'Diagnose the Gaps', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_9', order: 59,
    text: 'I focus on making systems more reliable.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
  {
    id: 'REFINER_10', order: 60,
    text: 'I encourage teams to reflect on what they learned.',
    role: 'Refiner', stage: 'Scale and Sustain', energy: 'Polish', reverse: false,
  },
]

// Sorted by order for consistent display
export const ORDERED_QUESTIONS = [...QUESTIONS].sort((a, b) => a.order - b.order)

export const TOTAL_QUESTIONS = QUESTIONS.length // 60

export const ROLES: Role[] = ['Innovator', 'Achiever', 'Organizer', 'Unifier', 'Builder', 'Refiner']
export const STAGES: AdaptsStage[] = [
  'Alert the System',
  'Diagnose the Gaps',
  'Access Readiness',
  'Participate Through Dialogue',
  'Transform Through Alignment',
  'Scale and Sustain',
]
export const ENERGIES: Energy[] = ['Spark', 'Build', 'Polish', 'Bond']
