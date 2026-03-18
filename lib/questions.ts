export type AdaptsStage = 'alert' | 'diagnose' | 'readiness' | 'dialogue' | 'alignment' | 'scale'

export interface Question {
  id: number
  text: string
  stage: AdaptsStage
}

export const QUESTIONS: Question[] = [
  // ALERT (1–10)
  { id: 1, text: "I quickly notice when something in my environment is changing.", stage: 'alert' },
  { id: 2, text: "I pay attention to early warning signs before problems escalate.", stage: 'alert' },
  { id: 3, text: "I proactively scan for shifts in priorities or direction.", stage: 'alert' },
  { id: 4, text: "I bring potential issues to the team's attention early.", stage: 'alert' },
  { id: 5, text: "I remain curious even when things seem stable.", stage: 'alert' },
  { id: 6, text: "I can sense when team morale or dynamics are shifting.", stage: 'alert' },
  { id: 7, text: "I regularly ask 'what might be coming next?'", stage: 'alert' },
  { id: 8, text: "I notice when plans are drifting from original goals.", stage: 'alert' },
  { id: 9, text: "I stay observant even when I am busy.", stage: 'alert' },
  { id: 10, text: "I trust my instincts when something feels off.", stage: 'alert' },

  // DIAGNOSE (11–20)
  { id: 11, text: "I ask good questions before jumping to conclusions.", stage: 'diagnose' },
  { id: 12, text: "I gather information from multiple perspectives before deciding.", stage: 'diagnose' },
  { id: 13, text: "I dig into root causes rather than treating symptoms.", stage: 'diagnose' },
  { id: 14, text: "I help others clarify what is really going on in a situation.", stage: 'diagnose' },
  { id: 15, text: "I remain patient during the analysis phase of change.", stage: 'diagnose' },
  { id: 16, text: "I am comfortable with uncertainty while gathering data.", stage: 'diagnose' },
  { id: 17, text: "I challenge assumptions in a constructive way.", stage: 'diagnose' },
  { id: 18, text: "I synthesise complex information into clear insights.", stage: 'diagnose' },
  { id: 19, text: "I document what I learn so others can benefit.", stage: 'diagnose' },
  { id: 20, text: "I help teams avoid jumping to solutions too soon.", stage: 'diagnose' },

  // READINESS (21–30)
  { id: 21, text: "I prepare myself and others before major changes begin.", stage: 'readiness' },
  { id: 22, text: "I build confidence in others by helping them feel ready.", stage: 'readiness' },
  { id: 23, text: "I identify potential obstacles before they derail progress.", stage: 'readiness' },
  { id: 24, text: "I invest time in planning and preparation.", stage: 'readiness' },
  { id: 25, text: "I help teams build the skills they need before a change.", stage: 'readiness' },
  { id: 26, text: "I create clear plans so others know what to expect.", stage: 'readiness' },
  { id: 27, text: "I take a structured approach to getting ready for change.", stage: 'readiness' },
  { id: 28, text: "I check in on team readiness before launching initiatives.", stage: 'readiness' },
  { id: 29, text: "I address fears and concerns in a practical way.", stage: 'readiness' },
  { id: 30, text: "I help others develop confidence in their ability to adapt.", stage: 'readiness' },

  // DIALOGUE (31–40)
  { id: 31, text: "I create space for honest conversation during change.", stage: 'dialogue' },
  { id: 32, text: "I listen deeply before sharing my perspective.", stage: 'dialogue' },
  { id: 33, text: "I encourage dissenting views to surface in a safe way.", stage: 'dialogue' },
  { id: 34, text: "I facilitate conversations that bridge different viewpoints.", stage: 'dialogue' },
  { id: 35, text: "I help reduce tension in difficult discussions.", stage: 'dialogue' },
  { id: 36, text: "I ensure quieter voices are heard in team conversations.", stage: 'dialogue' },
  { id: 37, text: "I bring clarity to confusing or emotionally charged exchanges.", stage: 'dialogue' },
  { id: 38, text: "I help teams move from conflict to constructive dialogue.", stage: 'dialogue' },
  { id: 39, text: "I communicate with empathy, especially under pressure.", stage: 'dialogue' },
  { id: 40, text: "I model open, honest communication in my own behaviour.", stage: 'dialogue' },

  // ALIGNMENT (41–50)
  { id: 41, text: "I help teams get on the same page about direction.", stage: 'alignment' },
  { id: 42, text: "I notice when team members are working at cross-purposes.", stage: 'alignment' },
  { id: 43, text: "I build consensus without forcing agreement.", stage: 'alignment' },
  { id: 44, text: "I connect individual work to the bigger picture.", stage: 'alignment' },
  { id: 45, text: "I help resolve misalignments before they slow progress.", stage: 'alignment' },
  { id: 46, text: "I ensure priorities are clearly shared across the team.", stage: 'alignment' },
  { id: 47, text: "I create shared understanding without creating unnecessary bureaucracy.", stage: 'alignment' },
  { id: 48, text: "I help people see how their role fits into the whole.", stage: 'alignment' },
  { id: 49, text: "I facilitate decision-making that reflects team values.", stage: 'alignment' },
  { id: 50, text: "I bring structure to situations that feel chaotic.", stage: 'alignment' },

  // SCALE (51–60)
  { id: 51, text: "I help turn ideas into repeatable systems and processes.", stage: 'scale' },
  { id: 52, text: "I focus on making progress sustainable, not just fast.", stage: 'scale' },
  { id: 53, text: "I identify what is working and help replicate it.", stage: 'scale' },
  { id: 54, text: "I help teams embed new ways of working into their routine.", stage: 'scale' },
  { id: 55, text: "I support others in building lasting habits around change.", stage: 'scale' },
  { id: 56, text: "I measure results and use them to improve continuously.", stage: 'scale' },
  { id: 57, text: "I celebrate milestones to reinforce momentum.", stage: 'scale' },
  { id: 58, text: "I connect early wins to long-term transformation.", stage: 'scale' },
  { id: 59, text: "I document learnings so the organisation can grow.", stage: 'scale' },
  { id: 60, text: "I help others see change as an ongoing journey, not a one-time event.", stage: 'scale' },
]

export const CHANGE_GENIUS_ROLES: Record<string, { title: string; description: string; color: string }> = {
  'Sentinel': {
    title: 'Sentinel',
    description: 'You are the first to notice change on the horizon. Your awareness keeps teams alert and prepared.',
    color: '#6366f1',
  },
  'Analyst': {
    title: 'Analyst',
    description: 'You dig deep to understand the root of change. Your insight drives smarter decisions.',
    color: '#8b5cf6',
  },
  'Architect': {
    title: 'Architect',
    description: 'You build the foundations for change. Your planning ensures teams are ready to move.',
    color: '#06b6d4',
  },
  'Connector': {
    title: 'Connector',
    description: 'You open the lines of communication. Your dialogue skills turn tension into trust.',
    color: '#10b981',
  },
  'Unifier': {
    title: 'Unifier',
    description: 'You bring people together around shared purpose. Your alignment skills move teams forward.',
    color: '#f59e0b',
  },
  'Builder': {
    title: 'Builder',
    description: 'You turn vision into lasting systems. Your focus on scale ensures change sticks.',
    color: '#ef4444',
  },
}

export const STAGE_TO_ROLE: Record<AdaptsStage, string> = {
  alert: 'Sentinel',
  diagnose: 'Analyst',
  readiness: 'Architect',
  dialogue: 'Connector',
  alignment: 'Unifier',
  scale: 'Builder',
}

export function calculateResults(answers: Record<number, number>) {
  const stages: AdaptsStage[] = ['alert', 'diagnose', 'readiness', 'dialogue', 'alignment', 'scale']
  const scores: Record<AdaptsStage, number> = {
    alert: 0, diagnose: 0, readiness: 0, dialogue: 0, alignment: 0, scale: 0,
  }

  QUESTIONS.forEach(q => {
    scores[q.stage] += answers[q.id] ?? 3
  })

  // Max score per stage = 10 questions × 5 = 50
  const normalized: Record<AdaptsStage, number> = {} as any
  stages.forEach(s => { normalized[s] = Math.round((scores[s] / 50) * 100) })

  const sorted = stages.sort((a, b) => normalized[b] - normalized[a])
  const primaryRole = STAGE_TO_ROLE[sorted[0]]
  const secondaryRole = STAGE_TO_ROLE[sorted[1]]

  return { scores: normalized, primaryRole, secondaryRole }
}
