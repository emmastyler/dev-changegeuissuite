// lib/assessment/narratives.ts
import type { Role, AdaptsStage, Energy } from "./questions";

export interface NarrativeInput {
  primary_role: Role;
  secondary_role: Role;
  role_pair_title: string;
  primary_energy: Energy;
  top_adapts_stages: AdaptsStage[];
  bottom_adapts_stages: AdaptsStage[];
}

export interface Narrative {
  // Cover / executive summary
  executive_summary: string;

  // Role section (like Working Genius)
  role_name: string;
  role_summary: string;
  role_detailed: string;
  role_benefits: string[];
  role_watchouts: string[];

  // Energy section
  energy_name: string;
  energy_summary: string;
  energy_detailed: string;
  energy_benefits: string[];
  energy_watchouts: string[];

  // ADAPTS strengths & growth
  adapts_strengths_summary: string;
  adapts_strengths_detailed: string;
  adapts_growth_summary: string;
  adapts_growth_detailed: string;

  // Pairing section (unique to primary+secondary)
  pairing_name: string;
  pairing_description: string;
  pairing_benefits: string[];
  pairing_watchouts: string[];
  pairing_icon?: string;

  // Team context
  individual_in_team: string;

  // 30-day action plan
  next_30_days: string[];

  // Additional pages (What is Change Genius?, How to apply)
  what_is_change_genius: string;
  how_to_apply_as_individual: string[];
  how_to_apply_as_team: string[];
}

// Detailed role content
const ROLE_CONTENT: Record<
  Role,
  {
    name: string;
    summary: string;
    detailed: string;
    benefits: string[];
    watchouts: string[];
    in_team: string;
  }
> = {
  Innovator: {
    name: "Innovator",
    summary:
      "You sense change before it arrives. Your strongest contribution is disrupting the status quo with fresh thinking and forward‑looking ideas.",
    detailed:
      "The Genius of Innovation is about seeing possibilities where others see problems. People with this gift derive real joy and energy from exploring emerging trends, questioning assumptions, and generating original ideas. They are naturally skilled at identifying what could be different or better, often before anyone else notices. Innovation is frequently an internal, reflective process – but its impact is unmistakable. The benefits of this genius include helping organizations avoid stagnation, sparking creativity in others, and ensuring that change initiatives begin with a strong, visionary foundation.",
    benefits: [
      "Identifies emerging opportunities before they become obvious",
      "Challenges outdated assumptions and processes",
      "Generates creative solutions to complex problems",
      "Inspires others to think beyond current constraints",
    ],
    watchouts: [
      "May move on to the next idea before implementation is complete",
      "Can become impatient with detailed planning and execution",
      "Risk of being perceived as unrealistic or impractical",
    ],
    in_team:
      "In a team context, you are the early warning system and idea generator. Teams need you most at the start of change – when the status quo needs challenging and new direction is required. Watch for the tendency to move on before implementation is complete.",
  },
  Achiever: {
    name: "Achiever",
    summary:
      "You drive initiatives forward. Your strongest contribution is converting intention into momentum. When progress stalls, you restart it.",
    detailed:
      "The Genius of Achievement is about turning ideas into action. People with this gift derive real joy and energy from setting ambitious goals, making steady progress, and crossing tasks off their list. They are not easily deterred by obstacles and often find creative ways to keep teams moving. Achievement is highly observable – you can see it in the urgency they bring to meetings, the milestones they hit, and the energy they infuse into flagging initiatives.",
    benefits: [
      "Maintains momentum when energy flags",
      "Converts abstract ideas into concrete action steps",
      "Creates accountability and drives results",
      "Keeps teams focused on deadlines and deliverables",
    ],
    watchouts: [
      "May rush past important conversations in favour of action",
      "Can create pressure that overwhelms some team members",
      "Risk of burnout if constantly driving without rest",
    ],
    in_team:
      "In a team context, you are the engine. Teams need you when momentum is at risk or deadlines are being missed. Your urgency is valuable – but ensure your pace doesn't leave key voices behind.",
  },
  Organizer: {
    name: "Organizer",
    summary:
      "You create the structure that makes change possible. Your strongest contribution is ensuring that good ideas don't collapse in execution.",
    detailed:
      "The Genius of Organization involves bringing order to complexity. People with this gift derive real joy and energy from planning, structuring, and coordinating resources. They are naturally skilled at breaking down large initiatives into manageable steps, identifying dependencies, and creating systems that help teams operate efficiently. While less glamorous than ideation, organization is what prevents chaos and ensures that ambitious ideas have a realistic path to implementation.",
    benefits: [
      "Translates vision into actionable plans",
      "Identifies resource gaps and dependencies early",
      "Creates systems that improve team efficiency",
      "Reduces risk of execution failure",
    ],
    watchouts: [
      "May prioritise process over adaptability",
      "Can become frustrated with ambiguity or last‑minute changes",
      "Risk of over‑planning and delaying action",
    ],
    in_team:
      "In a team context, you are the architect of execution. Teams need you to translate ambition into workable plans. Your structure prevents chaos – but ensure the plan stays flexible enough to adapt.",
  },
  Unifier: {
    name: "Unifier",
    summary:
      "You build the trust that change requires. Your strongest contribution is keeping people connected during disruption.",
    detailed:
      "The Genius of Unification is about creating psychological safety and fostering collaboration. People with this gift derive real joy and energy from bringing people together, resolving conflict, and ensuring that everyone feels heard. They are naturally skilled at reading emotional undercurrents and facilitating difficult conversations. Unifiers are often the glue that holds teams together during stressful transformations.",
    benefits: [
      "Builds trust and psychological safety",
      "Surfaces hidden concerns before they become problems",
      "Facilitates difficult conversations with empathy",
      "Creates a culture where people feel valued",
    ],
    watchouts: [
      "May avoid necessary conflict to preserve harmony",
      "Can struggle to make unpopular decisions",
      "Risk of being perceived as less decisive",
    ],
    in_team:
      "In a team context, you are the social glue. Teams need you when trust is low, conflict is rising, or alignment is breaking down. Your gift for connection is powerful – ensure decisions still get made.",
  },
  Builder: {
    name: "Builder",
    summary:
      "You connect strategy to execution. Your strongest contribution is ensuring that decisions translate into operational reality.",
    detailed:
      "The Genius of Building involves bridging the gap between high‑level strategy and day‑to‑day operations. People with this gift derive real joy and energy from aligning resources, defining roles, and ensuring that everyone understands how their work contributes to the bigger picture. They are naturally skilled at translating abstract goals into concrete actions. Builders are the linchpin that prevents strategic drift.",
    benefits: [
      "Aligns team work with organisational priorities",
      "Clarifies roles and responsibilities",
      "Ensures decisions are translated into action",
      "Prevents misalignment between strategy and execution",
    ],
    watchouts: [
      "May become bogged down in operational details",
      "Can struggle with purely strategic or purely tactical work",
      "Risk of being pulled in too many directions",
    ],
    in_team:
      "In a team context, you are the bridge between thinking and doing. Teams need you to connect strategy to action. Your ability to align work to purpose prevents drift – ensure you challenge direction when needed.",
  },
  Refiner: {
    name: "Refiner",
    summary:
      "You make change last. Your strongest contribution is continuous improvement – learning from what happened and strengthening what works.",
    detailed:
      "The Genius of Refinement is about sustaining and improving systems over time. People with this gift derive real joy and energy from analysing outcomes, capturing lessons learned, and making incremental improvements. They are naturally skilled at identifying what’s working, what’s not, and what could be better. Refiners ensure that change initiatives don’t just succeed once but become embedded in the organisation’s DNA.",
    benefits: [
      "Captures and institutionalises learning",
      "Prevents repeated mistakes",
      "Continuously improves processes and outcomes",
      "Builds sustainable systems for long‑term success",
    ],
    watchouts: [
      "May prioritise perfection over progress",
      "Can be seen as overly critical or focused on the past",
      "Risk of slowing momentum with excessive analysis",
    ],
    in_team:
      "In a team context, you are the memory and quality engine. Teams need you after initiatives to capture learning and prevent repetition of mistakes. Your focus on improvement is invaluable – ensure it doesn't slow necessary momentum.",
  },
};

// Energy content
const ENERGY_CONTENT: Record<
  Energy,
  {
    name: string;
    summary: string;
    detailed: string;
    benefits: string[];
    watchouts: string[];
  }
> = {
  Spark: {
    name: "Spark",
    summary:
      "Your primary energy is Spark – the energy of initiation, creativity, and disruption. You bring excitement and possibility to change.",
    detailed:
      "Spark energy is about generating heat and light at the beginning of a change journey. People with Spark energy are most alive when something new is being born – a strategy, a project, a movement. They excel at creating urgency, painting compelling visions, and rallying people around a fresh direction. However, Spark energy naturally diminishes as the work becomes more routine. Leaders with Spark energy need partners who can carry the flame forward after the initial ignition.",
    benefits: [
      "Creates urgency and excitement around change",
      "Generates innovative ideas and fresh perspectives",
      "Inspires others to join the journey",
      "Breaks through complacency and inertia",
    ],
    watchouts: [
      "May lose interest once the initial excitement fades",
      "Can move on before implementation is complete",
      "Risk of burning out without sustained support",
    ],
  },
  Build: {
    name: "Build",
    summary:
      "Your primary energy is Build – the energy of construction, progress, and momentum. You bring drive and discipline to change.",
    detailed:
      "Build energy is about turning vision into reality. People with Build energy are most alive when tangible progress is being made – checking off tasks, hitting milestones, and moving initiatives forward. They excel at converting plans into action, overcoming obstacles, and maintaining momentum. Build energy is essential during the middle stages of change, when the initial excitement has faded but results are not yet visible. Leaders with Build energy need partners who can help them see the bigger picture and avoid burnout.",
    benefits: [
      "Drives consistent progress toward goals",
      "Overcomes obstacles and resistance",
      "Maintains momentum when energy flags",
      "Converts plans into tangible results",
    ],
    watchouts: [
      "May rush past important reflection or course correction",
      "Can create pressure that overwhelms others",
      "Risk of burnout from constant forward motion",
    ],
  },
  Polish: {
    name: "Polish",
    summary:
      "Your primary energy is Polish – the energy of refinement, quality, and precision. You bring rigor and improvement to change.",
    detailed:
      "Polish energy is about making good things great. People with Polish energy are most alive when systems can be made better – optimising processes, catching errors, and elevating quality. They excel at the final stages of change, when the focus shifts from deployment to refinement. Polish energy ensures that initiatives don’t just work, but work well. Leaders with Polish energy need partners who can help them balance perfectionism with progress.",
    benefits: [
      "Elevates quality and attention to detail",
      "Identifies and corrects errors before they become problems",
      "Continuously improves systems and processes",
      "Ensures lasting excellence beyond initial implementation",
    ],
    watchouts: [
      "May delay completion in pursuit of perfection",
      "Can be seen as overly critical",
      "Risk of slowing momentum with excessive refinement",
    ],
  },
  Bond: {
    name: "Bond",
    summary:
      "Your primary energy is Bond – the energy of connection, trust, and collaboration. You bring relational intelligence to change.",
    detailed:
      "Bond energy is about keeping people connected during disruption. People with Bond energy are most alive when teams are unified – facilitating dialogue, building trust, and resolving conflict. They excel at the human side of change, ensuring that no one is left behind. Bond energy is essential when alignment is breaking down or resistance is rising. Leaders with Bond energy need partners who can help them make tough decisions and maintain momentum.",
    benefits: [
      "Builds trust and psychological safety",
      "Surfaces and resolves conflict early",
      "Keeps teams connected during disruption",
      "Creates a culture of collaboration and support",
    ],
    watchouts: [
      "May avoid necessary conflict to preserve harmony",
      "Can struggle with tough decisions or trade‑offs",
      "Risk of being perceived as less decisive",
    ],
  },
};

// ADAPTS stage detailed content
const STAGE_CONTENT: Record<
  AdaptsStage,
  { strengths: string; growth: string }
> = {
  "Alert the System": {
    strengths:
      "You are naturally strong at sensing disruption early. You read signals others miss and create the urgency that opens organizations to change. This strength helps your team avoid being caught off‑guard by market shifts, competitive threats, or internal decay.",
    growth:
      'Sensing disruption early is an area for development. You may benefit from deliberately seeking weak signals, challenging current assumptions, and spending time with people outside your immediate function. Consider setting up a regular "environmental scan" practice to catch what you might otherwise miss.',
  },
  "Diagnose the Gaps": {
    strengths:
      "You are naturally strong at framing the real problem. You ask the harder questions and ensure organizations address root causes rather than symptoms. This strength prevents wasted effort on solving the wrong issues.",
    growth:
      'Root cause analysis is an area for development. You may benefit from slowing down before solutions are selected, building diagnostic habits, and asking "why" more often before "how". Consider using structured problem‑solving frameworks like the 5 Whys or fishbone diagrams.',
  },
  "Access Readiness": {
    strengths:
      "You are naturally strong at preparing for change. You assess capability, capacity, and confidence before launch – reducing the risk of failed implementation. This strength ensures your team has what it needs to succeed.",
    growth:
      "Preparation discipline is an area for development. You may benefit from building explicit readiness checks before major initiatives and ensuring capability gaps are identified before launch. Consider creating a simple readiness scorecard for each new project.",
  },
  "Participate Through Dialogue": {
    strengths:
      "You are naturally strong at building shared understanding. You surface hidden concerns and create the conversations that transform resistance into alignment. This strength prevents silent failures and builds buy‑in.",
    growth:
      'Facilitated dialogue is an area for development. You may benefit from creating more structured space for dissenting voices, and building stronger habits around listening before deciding. Consider using techniques like "pre‑mortems" or "silent brainstorming".',
  },
  "Transform Through Alignment": {
    strengths:
      "You are naturally strong at executing change. You convert agreement into action and keep teams coordinated through complex transformation. This strength ensures that strategy translates into results.",
    growth:
      "Execution alignment is an area for development. You may benefit from more explicit connection between strategy and operational work, and tighter coordination mechanisms during implementation. Consider using project management tools to visualise dependencies.",
  },
  "Scale and Sustain": {
    strengths:
      "You are naturally strong at making change last. You embed new behaviors, build sustaining systems, and ensure transformation survives beyond the initial push. This strength creates lasting impact.",
    growth:
      'Sustainability discipline is an area for development. You may benefit from building explicit review processes after initiatives, and creating systems that institutionalize new behaviors. Consider establishing regular "retrospectives" and documenting lessons learned.',
  },
};

// Pairing content (primary + secondary)
const PAIRING_CONTENT: Record<
  string,
  {
    name: string;
    description: string;
    benefits: string[];
    watchouts: string[];
    icon?: string;
  }
> = {
  "Innovator+Achiever": {
    name: "The Visionary Driver",
    description:
      "A powerful combination of big‑picture thinking and relentless execution. You not only see where the world needs to go – you have the drive to get there. You excel at launching new initiatives and pushing them through obstacles.",
    benefits: [
      "Exceptional at turning ideas into reality",
      "Creates urgency and momentum around new directions",
      "Inspires others while holding them accountable",
    ],
    watchouts: [
      "May move too fast for others to keep up",
      "Can struggle with mid‑course refinement",
      "Risk of burnout from constant high intensity",
    ],
  },
  "Innovator+Organizer": {
    name: "The Strategic Architect",
    description:
      "A rare combination of creative vision and structural discipline. You not only imagine what could be – you design the blueprint to get there. You excel at translating abstract ideas into actionable plans.",
    benefits: [
      "Bridges the gap between imagination and execution",
      "Creates both vision and structure",
      "Prevents chaos while enabling innovation",
    ],
    watchouts: [
      "May over‑engineer before testing ideas",
      "Can become attached to plans rather than outcomes",
      "Risk of analysis paralysis",
    ],
  },
  "Innovator+Unifier": {
    name: "The Empathetic Visionary",
    description:
      "A compelling combination of future‑thinking and people‑centeredness. You not only see where the world needs to go – you bring people along on the journey. You excel at creating change that people actually want.",
    benefits: [
      "Builds buy‑in while painting compelling visions",
      "Creates change that people embrace, not resist",
      "Balances ambition with empathy",
    ],
    watchouts: [
      "May prioritise harmony over hard decisions",
      "Can struggle with execution details",
      "Risk of being seen as overly idealistic",
    ],
  },
  "Innovator+Builder": {
    name: "The Bridge Builder",
    description:
      "A powerful combination of creativity and pragmatism. You not only imagine new possibilities – you connect them to operational reality. You excel at turning strategic insights into practical actions.",
    benefits: [
      "Translates vision into executable strategy",
      "Aligns innovation with organisational capabilities",
      "Prevents ideas from dying in PowerPoint",
    ],
    watchouts: [
      "May spread focus too thin across many initiatives",
      "Can struggle with purely tactical work",
      "Risk of burnout from constant bridging",
    ],
  },
  "Innovator+Refiner": {
    name: "The Continuous Innovator",
    description:
      "A unique combination of creation and improvement. You not only generate new ideas – you make them better over time. You excel at iterating toward excellence while never losing sight of the next breakthrough.",
    benefits: [
      "Combines breakthrough thinking with continuous improvement",
      'Never settles for "good enough"',
      "Creates both novelty and refinement",
    ],
    watchouts: [
      'May struggle to declare anything "finished"',
      "Can over‑iterate before launching",
      "Risk of perfectionism blocking progress",
    ],
  },
  "Achiever+Innovator": {
    name: "The Momentum Builder",
    description:
      "A dynamic combination of action and imagination. You not only drive progress – you know when to pivot. You excel at keeping initiatives moving while remaining open to better approaches.",
    benefits: [
      "Maintains momentum while staying flexible",
      "Balances execution with exploration",
      "Creates urgency without rigidity",
    ],
    watchouts: [
      "May change direction too frequently",
      "Can frustrate teams seeking stability",
      "Risk of losing focus on long‑term goals",
    ],
  },
  "Achiever+Organizer": {
    name: "The Execution Specialist",
    description:
      "A formidable combination of drive and discipline. You not only push for results – you structure the path to get there. You excel at turning plans into completed projects on time and on budget.",
    benefits: [
      "Exceptional at delivering complex initiatives",
      "Combines urgency with methodology",
      "Creates accountability and clarity",
    ],
    watchouts: [
      "May prioritise speed over quality",
      "Can become rigid when adaptation is needed",
      "Risk of burnout from constant pressure",
    ],
  },
  "Achiever+Unifier": {
    name: "The People‑Driven Leader",
    description:
      "A compelling combination of results and relationships. You not only drive progress – you bring people with you. You excel at achieving ambitious goals while building trust and engagement.",
    benefits: [
      "Balances task and relationship focus",
      "Creates accountability with psychological safety",
      "Inspires teams to achieve more together",
    ],
    watchouts: [
      "May struggle with tough performance conversations",
      "Can prioritise harmony over hard truths",
      "Risk of spreading focus too thin",
    ],
  },
  "Achiever+Builder": {
    name: "The Strategic Executor",
    description:
      "A powerful combination of drive and alignment. You not only push for results – you ensure those results matter. You excel at connecting day‑to‑day action to strategic intent.",
    benefits: [
      "Aligns execution with organisational strategy",
      "Prevents busy‑work and misdirection",
      "Creates momentum with purpose",
    ],
    watchouts: [
      "May struggle with purely tactical work",
      "Can become frustrated when strategy is unclear",
      "Risk of over‑indexing on alignment at expense of speed",
    ],
  },
  "Achiever+Refiner": {
    name: "The Performance Optimizer",
    description:
      "A unique combination of drive and improvement. You not only push for results – you make those results better over time. You excel at achieving goals while continuously raising the bar.",
    benefits: [
      "Combines urgency with quality",
      "Never settles for mediocrity",
      "Creates momentum and excellence",
    ],
    watchouts: [
      "May struggle to celebrate success",
      "Can create pressure for constant improvement",
      "Risk of burnout from never being satisfied",
    ],
  },
  "Organizer+Innovator": {
    name: "The Structured Strategist",
    description:
      "A rare combination of discipline and creativity. You not only create structure – you know when to break it. You excel at building systems that enable, not constrain, innovation.",
    benefits: [
      "Creates flexible structures that adapt",
      "Balances planning with possibility",
      "Prevents chaos without stifling creativity",
    ],
    watchouts: [
      "May over‑complicate simple problems",
      "Can struggle with purely unstructured work",
      "Risk of analysis paralysis",
    ],
  },
  "Organizer+Achiever": {
    name: "The Delivery Architect",
    description:
      "A formidable combination of planning and execution. You not only design the path – you walk it. You excel at delivering complex initiatives with precision and pace.",
    benefits: [
      "Exceptional at project delivery",
      "Combines methodology with urgency",
      "Creates clarity and accountability",
    ],
    watchouts: [
      "May prioritise process over people",
      "Can become rigid when change is needed",
      "Risk of burnout from constant delivery pressure",
    ],
  },
  "Organizer+Unifier": {
    name: "The Systems Unifier",
    description:
      "A powerful combination of structure and connection. You not only design systems – you ensure people can thrive within them. You excel at creating processes that build trust, not bureaucracy.",
    benefits: [
      "Designs people‑centered systems",
      "Balances efficiency with empathy",
      "Creates structures that enable collaboration",
    ],
    watchouts: [
      "May over‑engineer simple processes",
      "Can struggle with tough trade‑offs",
      "Risk of being seen as process‑heavy",
    ],
  },
  "Organizer+Builder": {
    name: "The Master Planner",
    description:
      "A rare combination of structure and alignment. You not only plan – you ensure plans connect to reality. You excel at creating roadmaps that actually get followed.",
    benefits: [
      "Creates actionable, aligned plans",
      "Bridges strategy and execution",
      "Prevents planning that never becomes action",
    ],
    watchouts: [
      "May struggle with ambiguity or rapid change",
      "Can become attached to plans over outcomes",
      "Risk of over‑planning at expense of speed",
    ],
  },
  "Organizer+Refiner": {
    name: "The Precision Operator",
    description:
      "A unique combination of structure and improvement. You not only create order – you make that order better over time. You excel at building systems that continuously improve.",
    benefits: [
      "Creates self‑improving systems",
      "Combines planning with iteration",
      "Prevents stagnation and decay",
    ],
    watchouts: [
      "May struggle with one‑off projects",
      "Can over‑engineer temporary solutions",
      "Risk of perfectionism blocking progress",
    ],
  },
  "Unifier+Innovator": {
    name: "The Empathetic Visionary",
    description:
      "A compelling combination of connection and creativity. You not only bring people together – you imagine where they could go. You excel at creating change that people actually want.",
    benefits: [
      "Builds buy‑in for bold visions",
      "Creates change people embrace",
      "Balances ambition with empathy",
    ],
    watchouts: [
      "May struggle with execution details",
      "Can prioritise harmony over hard decisions",
      "Risk of being seen as overly idealistic",
    ],
  },
  "Unifier+Achiever": {
    name: "The Relationship Driver",
    description:
      "A powerful combination of connection and momentum. You not only build trust – you get things done. You excel at achieving results while keeping teams engaged.",
    benefits: [
      "Balances task and relationship",
      "Creates accountability with psychological safety",
      "Inspires teams to achieve more together",
    ],
    watchouts: [
      "May struggle with tough performance conversations",
      "Can prioritise harmony over hard truths",
      "Risk of spreading focus too thin",
    ],
  },
  "Unifier+Organizer": {
    name: "The Collaborative Organizer",
    description:
      "A rare combination of connection and structure. You not only bring people together – you create systems that help them work better together. You excel at designing collaborative processes.",
    benefits: [
      "Creates people‑centered systems",
      "Balances efficiency with empathy",
      "Builds trust through reliable processes",
    ],
    watchouts: [
      "May over‑engineer simple processes",
      "Can struggle with tough trade‑offs",
      "Risk of being seen as process‑heavy",
    ],
  },
  "Unifier+Builder": {
    name: "The Trust Builder",
    description:
      "A powerful combination of connection and alignment. You not only build relationships – you ensure those relationships serve a purpose. You excel at creating aligned, trusting teams.",
    benefits: [
      "Aligns people around shared purpose",
      "Builds trust and strategic clarity",
      "Creates teams that collaborate effectively",
    ],
    watchouts: [
      "May struggle with purely strategic or purely relational work",
      "Can prioritise harmony over alignment",
      "Risk of being pulled in too many directions",
    ],
  },
  "Unifier+Refiner": {
    name: "The Inclusive Improver",
    description:
      "A unique combination of connection and improvement. You not only bring people together – you make things better for everyone. You excel at creating inclusive systems that continuously improve.",
    benefits: [
      "Creates equitable, improving systems",
      "Balances empathy with excellence",
      "Builds cultures of psychological safety and learning",
    ],
    watchouts: [
      "May struggle with tough prioritisation",
      "Can over‑emphasise consensus at expense of speed",
      "Risk of burnout from constant people‑focused improvement",
    ],
  },
  "Builder+Innovator": {
    name: "The Bridge Builder",
    description:
      "A powerful combination of alignment and creativity. You not only connect strategy to action – you know when strategy needs to change. You excel at translating vision into reality while staying adaptable.",
    benefits: [
      "Bridges strategy and execution dynamically",
      "Aligns innovation with operational reality",
      "Prevents strategic drift while enabling adaptation",
    ],
    watchouts: [
      "May spread focus too thin",
      "Can struggle with purely tactical or purely strategic work",
      "Risk of burnout from constant bridging",
    ],
  },
  "Builder+Achiever": {
    name: "The Strategic Activator",
    description:
      "A formidable combination of alignment and drive. You not only connect strategy to action – you get it done. You excel at turning strategic intent into completed results.",
    benefits: [
      "Aligns execution with strategy",
      "Creates momentum with purpose",
      "Prevents busy‑work and misdirection",
    ],
    watchouts: [
      "May struggle with purely tactical work",
      "Can become frustrated when strategy is unclear",
      "Risk of over‑indexing on alignment at expense of speed",
    ],
  },
  "Builder+Organizer": {
    name: "The Systems Architect",
    description:
      "A rare combination of alignment and structure. You not only connect strategy to action – you design the systems that make it happen. You excel at creating aligned, executable plans.",
    benefits: [
      "Creates actionable, aligned roadmaps",
      "Bridges strategy, structure, and execution",
      "Prevents planning that never becomes action",
    ],
    watchouts: [
      "May over‑engineer simple problems",
      "Can struggle with ambiguity or rapid change",
      "Risk of over‑planning at expense of speed",
    ],
  },
  "Builder+Unifier": {
    name: "The Alignment Champion",
    description:
      "A powerful combination of alignment and connection. You not only connect work to purpose – you bring people along. You excel at creating aligned, trusting teams that execute effectively.",
    benefits: [
      "Aligns people and work around shared purpose",
      "Builds trust and strategic clarity",
      "Creates teams that collaborate and deliver",
    ],
    watchouts: [
      "May struggle with purely strategic or purely relational work",
      "Can prioritise harmony over alignment",
      "Risk of being pulled in too many directions",
    ],
  },
  "Builder+Refiner": {
    name: "The Operational Excellence Leader",
    description:
      "A unique combination of alignment and improvement. You not only connect work to strategy – you make that connection better over time. You excel at creating aligned, continuously improving systems.",
    benefits: [
      "Creates self‑improving, aligned systems",
      "Combines strategic clarity with operational excellence",
      "Prevents drift and decay",
    ],
    watchouts: [
      "May struggle with one‑off initiatives",
      "Can over‑engineer temporary solutions",
      "Risk of perfectionism blocking progress",
    ],
  },
  "Refiner+Innovator": {
    name: "The Continuous Innovator",
    description:
      "A unique combination of improvement and creativity. You not only make things better – you know when to start fresh. You excel at iterating toward excellence while remaining open to breakthrough ideas.",
    benefits: [
      "Combines iteration with innovation",
      'Never settles for "good enough"',
      "Creates both refinement and renewal",
    ],
    watchouts: [
      'May struggle to declare anything "finished"',
      "Can over‑iterate before launching",
      "Risk of perfectionism blocking progress",
    ],
  },
  "Refiner+Achiever": {
    name: "The Performance Optimizer",
    description:
      "A powerful combination of improvement and drive. You not only raise the bar – you push to reach it. You excel at achieving ambitious goals while continuously raising standards.",
    benefits: [
      "Combines urgency with quality",
      "Never settles for mediocrity",
      "Creates momentum and excellence",
    ],
    watchouts: [
      "May struggle to celebrate success",
      "Can create pressure for constant improvement",
      "Risk of burnout from never being satisfied",
    ],
  },
  "Refiner+Organizer": {
    name: "The Systems Perfectionist",
    description:
      "A rare combination of improvement and structure. You not only make things better – you systematise that improvement. You excel at building self‑improving systems.",
    benefits: [
      "Creates self‑improving, reliable systems",
      "Combines process discipline with iteration",
      "Prevents stagnation and decay",
    ],
    watchouts: [
      "May over‑engineer simple processes",
      "Can struggle with one‑off or unpredictable work",
      "Risk of perfectionism blocking progress",
    ],
  },
  "Refiner+Unifier": {
    name: "The Culture Steward",
    description:
      "A powerful combination of improvement and connection. You not only make things better – you make them better for everyone. You excel at creating inclusive, continuously improving cultures.",
    benefits: [
      "Creates equitable, improving systems",
      "Balances empathy with excellence",
      "Builds cultures of psychological safety and learning",
    ],
    watchouts: [
      "May struggle with tough prioritisation",
      "Can over‑emphasise consensus at expense of speed",
      "Risk of burnout from constant people‑focused improvement",
    ],
  },
  "Refiner+Builder": {
    name: "The Sustainable Change Leader",
    description:
      "A unique combination of improvement and alignment. You not only make things better – you ensure those improvements stick. You excel at creating aligned, self‑improving systems that deliver lasting impact.",
    benefits: [
      "Creates sustainable, improving systems",
      "Combines strategic alignment with operational excellence",
      "Prevents drift, decay, and misalignment",
    ],
    watchouts: [
      "May struggle with one‑off initiatives",
      "Can over‑engineer temporary solutions",
      "Risk of perfectionism blocking progress",
    ],
  },
};

// Helper to get pairing key (primary+secondary order doesn't matter for lookup)
function getPairingKey(primary: Role, secondary: Role): string {
  // Try both orders
  const direct = `${primary}+${secondary}`;
  const reverse = `${secondary}+${primary}`;
  if (PAIRING_CONTENT[direct]) return direct;
  if (PAIRING_CONTENT[reverse]) return reverse;
  return direct; // fallback
}

export function buildNarrative(input: NarrativeInput): Narrative {
  const {
    primary_role,
    secondary_role,
    role_pair_title,
    primary_energy,
    top_adapts_stages,
    bottom_adapts_stages,
  } = input;

  const role = ROLE_CONTENT[primary_role];
  const energy = ENERGY_CONTENT[primary_energy];
  const pairingKey = getPairingKey(primary_role, secondary_role);
  const pairing = PAIRING_CONTENT[pairingKey] || {
    name: role_pair_title,
    description: `A unique combination of ${primary_role} and ${secondary_role} energies. You bring both ${role.summary.toLowerCase()} and the complementary strengths of your secondary role.`,
    benefits: [
      "Balances multiple perspectives",
      "Adaptable to different situations",
      "Brings unique problem‑solving approach",
    ],
    watchouts: [
      "May struggle with role clarity",
      "Can be pulled in conflicting directions",
      "Risk of over‑extending",
    ],
  };

  const topStage = top_adapts_stages[0];
  const secondStage = top_adapts_stages[1];
  const bottomStage = bottom_adapts_stages[0];
  const secondBottom = bottom_adapts_stages[1];

  const stageStrengths = STAGE_CONTENT[topStage]?.strengths || "";
  const secondStageStrength = secondStage
    ? STAGE_CONTENT[secondStage]?.strengths
    : "";
  const stageGrowth = STAGE_CONTENT[bottomStage]?.growth || "";
  const secondStageGrowth = secondBottom
    ? STAGE_CONTENT[secondBottom]?.growth
    : "";

  return {
    executive_summary: `Your Change Genius™ profile reveals that you are a ${role_pair_title} — a ${primary_role} with a strong ${secondary_role} dimension. ${role.summary} Your ${secondary_role} secondary role adds ${ROLE_CONTENT[secondary_role]?.summary.split(".")[0].toLowerCase() || "additional strengths"} to your change leadership approach.`,

    role_name: role.name,
    role_summary: role.summary,
    role_detailed: role.detailed,
    role_benefits: role.benefits,
    role_watchouts: role.watchouts,

    energy_name: energy.name,
    energy_summary: energy.summary,
    energy_detailed: energy.detailed,
    energy_benefits: energy.benefits,
    energy_watchouts: energy.watchouts,

    adapts_strengths_summary: `Your strongest ADAPTS stages are ${topStage}${secondStage ? ` and ${secondStage}` : ""}.`,
    adapts_strengths_detailed: `${stageStrengths} ${secondStageStrength ? `You are also strong in the ${secondStage} stage. ${secondStageStrength}` : ""}`,
    adapts_growth_summary: `Your development areas are ${bottomStage}${secondBottom ? ` and ${secondBottom}` : ""}.`,
    adapts_growth_detailed: `${stageGrowth} ${secondStageGrowth ? `The ${secondBottom} stage is also an area to develop. ${secondStageGrowth}` : ""}`,

    pairing_name: pairing.name,
    pairing_description: pairing.description,
    pairing_benefits: pairing.benefits,
    pairing_watchouts: pairing.watchouts,

    individual_in_team: role.in_team,

    next_30_days: [
      `Identify one change initiative you're currently involved in and deliberately apply your ${primary_role} strengths to move it forward.`,
      `Share your Change Genius™ profile with a colleague or team member and ask them to share theirs – begin a conversation about how you can complement each other.`,
      `For the next week, notice when you're working in your ${bottomStage} growth area. Before diving in, see if someone with that strength can support you.`,
      `Schedule a 30‑minute reflection session at the end of the month to review where you've used your genius most effectively – and where you've felt drained.`,
    ],

    what_is_change_genius: `Change Genius™ is the first assessment‑based framework that reveals how leaders and teams drive transformation. Built on the ADAPTS model – six stages from sensing disruption to scaling impact – it gives every leader and organization a shared language for change. Most change initiatives fail not because of strategy, but because leaders don't understand their own change behavior, or their team's. Change Genius™ maps who you are in the system, what your team needs, and where momentum is being lost.`,

    how_to_apply_as_individual: [
      "Review your results and identify one change in your current role that would allow you to spend more time in your genius.",
      "Share your profile with your manager and discuss how to adjust your responsibilities to better align with your strengths.",
      "Use the 30‑day action plan above to build habits that reinforce your genius.",
      "Invite your team to take the assessment so you can build a Team Change Map™ together.",
    ],

    how_to_apply_as_team: [
      "Have every team member take the Change Genius™ assessment and share their results in a team session.",
      "Create a Team Change Map™ that visualises everyone’s primary roles and ADAPTS strengths.",
      "Identify gaps in your team’s role coverage – which Change Genius™ roles are missing?",
      "Reassign responsibilities to better align with each person’s genius.",
      "Use the Weekly Change Pulse™ to track team momentum and alignment over time.",
    ],
  };
}
