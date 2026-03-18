export const ASSESSMENT_QUESTIONS = [
  // Alert Stage (Questions 1-10)
  { id: 1, stage: "Alert", text: "I actively look for early signals that change may be needed in my organization." },
  { id: 2, stage: "Alert", text: "I notice when teams are operating on outdated assumptions." },
  { id: 3, stage: "Alert", text: "I raise concerns about potential problems before they become crises." },
  { id: 4, stage: "Alert", text: "I pay attention to external trends that might impact our strategy." },
  { id: 5, stage: "Alert", text: "I create space for others to voice concerns about existing approaches." },
  { id: 6, stage: "Alert", text: "I challenge assumptions that may no longer serve the organization." },
  { id: 7, stage: "Alert", text: "I help others see why the status quo may be unsustainable." },
  { id: 8, stage: "Alert", text: "I monitor leading indicators rather than waiting for lagging ones." },
  { id: 9, stage: "Alert", text: "I build systems that surface problems early." },
  { id: 10, stage: "Alert", text: "I translate vague concerns into concrete signals of needed change." },
  // Diagnose Stage (Questions 11-20)
  { id: 11, stage: "Diagnose", text: "I analyze root causes rather than treating symptoms." },
  { id: 12, stage: "Diagnose", text: "I gather data from multiple sources before drawing conclusions." },
  { id: 13, stage: "Diagnose", text: "I help teams understand the true scope of challenges they face." },
  { id: 14, stage: "Diagnose", text: "I identify patterns across seemingly unrelated problems." },
  { id: 15, stage: "Diagnose", text: "I distinguish between symptoms and underlying systemic issues." },
  { id: 16, stage: "Diagnose", text: "I facilitate diagnostic conversations that uncover hidden issues." },
  { id: 17, stage: "Diagnose", text: "I use frameworks to structure complex problem analysis." },
  { id: 18, stage: "Diagnose", text: "I map stakeholder perspectives to understand different views." },
  { id: 19, stage: "Diagnose", text: "I quantify impact to prioritize where change energy should go." },
  { id: 20, stage: "Diagnose", text: "I help others move from emotional reaction to analytical thinking." },
  // Readiness Stage (Questions 21-30)
  { id: 21, stage: "Readiness", text: "I assess organizational capacity before launching change initiatives." },
  { id: 22, stage: "Readiness", text: "I build coalitions and secure sponsorship for change efforts." },
  { id: 23, stage: "Readiness", text: "I identify and address resistance before it derails progress." },
  { id: 24, stage: "Readiness", text: "I develop change capability in teams and individuals." },
  { id: 25, stage: "Readiness", text: "I ensure resources are in place before change begins." },
  { id: 26, stage: "Readiness", text: "I create psychological safety so people can engage honestly." },
  { id: 27, stage: "Readiness", text: "I help leaders model the change they expect from others." },
  { id: 28, stage: "Readiness", text: "I sequence change activities to build momentum progressively." },
  { id: 29, stage: "Readiness", text: "I anticipate and plan for the human impact of change." },
  { id: 30, stage: "Readiness", text: "I design learning experiences that prepare teams for new ways of working." },
  // Dialogue Stage (Questions 31-40)
  { id: 31, stage: "Dialogue", text: "I create forums where honest conversations about change can happen." },
  { id: 32, stage: "Dialogue", text: "I facilitate discussions that surface conflict productively." },
  { id: 33, stage: "Dialogue", text: "I listen actively to understand concerns rather than dismiss them." },
  { id: 34, stage: "Dialogue", text: "I help opposing viewpoints find common ground." },
  { id: 35, stage: "Dialogue", text: "I translate technical change language into terms everyone understands." },
  { id: 36, stage: "Dialogue", text: "I encourage diverse voices to contribute to change conversations." },
  { id: 37, stage: "Dialogue", text: "I help teams have difficult conversations they have been avoiding." },
  { id: 38, stage: "Dialogue", text: "I create narratives that make change feel meaningful and purposeful." },
  { id: 39, stage: "Dialogue", text: "I ensure communication flows both up and down the organization." },
  { id: 40, stage: "Dialogue", text: "I build trust by following through on commitments made during change." },
  // Alignment Stage (Questions 41-50)
  { id: 41, stage: "Alignment", text: "I align teams around a shared understanding of change goals." },
  { id: 42, stage: "Alignment", text: "I resolve conflicts between competing priorities during change." },
  { id: 43, stage: "Alignment", text: "I ensure individual contributions connect to the bigger picture." },
  { id: 44, stage: "Alignment", text: "I build cross-functional collaboration to support change goals." },
  { id: 45, stage: "Alignment", text: "I help teams stay focused when change creates ambiguity." },
  { id: 46, stage: "Alignment", text: "I establish clear decision rights during periods of transformation." },
  { id: 47, stage: "Alignment", text: "I integrate change initiatives to avoid initiative fatigue." },
  { id: 48, stage: "Alignment", text: "I ensure accountability structures support desired change outcomes." },
  { id: 49, stage: "Alignment", text: "I facilitate strategic planning sessions that build real consensus." },
  { id: 50, stage: "Alignment", text: "I help teams trade short-term comfort for long-term alignment." },
  // Scale Stage (Questions 51-60)
  { id: 51, stage: "Scale", text: "I embed change into systems, processes, and culture." },
  { id: 52, stage: "Scale", text: "I scale successful change pilots across the broader organization." },
  { id: 53, stage: "Scale", text: "I institutionalize new practices so they outlast individual champions." },
  { id: 54, stage: "Scale", text: "I measure and celebrate change progress to sustain momentum." },
  { id: 55, stage: "Scale", text: "I adapt change approaches as context evolves." },
  { id: 56, stage: "Scale", text: "I identify and develop second-generation change leaders." },
  { id: 57, stage: "Scale", text: "I create feedback loops that improve change implementation." },
  { id: 58, stage: "Scale", text: "I remove organizational barriers that slow change adoption." },
  { id: 59, stage: "Scale", text: "I build change capability as a durable organizational competency." },
  { id: 60, stage: "Scale", text: "I help organizations learn from both successes and failures in change." },
];

export const GENIUS_ROLES = [
  { id: "architect", name: "Architect", tagline: "The Strategic Designer", description: "You excel at designing change from the ground up. You see the full system and create elegant structures that guide others through transformation." },
  { id: "catalyst", name: "Catalyst", tagline: "The Change Igniter", description: "You spark transformation by challenging the status quo and energizing others to embrace new possibilities." },
  { id: "builder", name: "Builder", tagline: "The Execution Expert", description: "You turn change plans into reality by constructing the systems and processes that make transformation stick." },
  { id: "unifier", name: "Unifier", tagline: "The Coalition Builder", description: "You bring people together, dissolving resistance and creating the alignment that allows change to flow." },
  { id: "navigator", name: "Navigator", tagline: "The Course Corrector", description: "You guide organizations through uncertainty, reading signals and adjusting course to keep change on track." },
  { id: "amplifier", name: "Amplifier", tagline: "The Scale Champion", description: "You take what works and make it bigger, spreading successful change across the entire organization." },
];

export type ScaleValue = 1 | 2 | 3 | 4 | 5;
export const SCALE_LABELS: Record<ScaleValue, string> = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};

export function calculateResults(answers: Record<number, ScaleValue>) {
  const stages = ["Alert", "Diagnose", "Readiness", "Dialogue", "Alignment", "Scale"];
  const stageScores: Record<string, number> = {};

  stages.forEach((stage) => {
    const stageQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.stage === stage);
    const total = stageQuestions.reduce((sum, q) => sum + (answers[q.id] || 3), 0);
    stageScores[stage] = Math.round((total / (stageQuestions.length * 5)) * 100);
  });

  // Determine primary genius role based on stage combo
  const topStages = Object.entries(stageScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([stage]) => stage);

  let geniusRole = "Navigator";
  if (topStages.includes("Alert") && topStages.includes("Diagnose")) geniusRole = "Catalyst";
  else if (topStages.includes("Readiness") && topStages.includes("Alignment")) geniusRole = "Unifier";
  else if (topStages.includes("Dialogue") && topStages.includes("Alignment")) geniusRole = "Unifier";
  else if (topStages.includes("Scale") && topStages.includes("Readiness")) geniusRole = "Builder";
  else if (topStages.includes("Alert") && topStages.includes("Scale")) geniusRole = "Amplifier";
  else if (topStages.includes("Readiness") && topStages.includes("Diagnose")) geniusRole = "Architect";

  return { stageScores, geniusRole };
}
