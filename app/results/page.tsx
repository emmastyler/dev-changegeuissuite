"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GENIUS_ROLES } from "@/lib/assessment";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

const STAGES = ["Alert", "Diagnose", "Readiness", "Dialogue", "Alignment", "Scale"];
const STAGE_COLORS: Record<string, string> = {
  Alert: "bg-violet-500", Diagnose: "bg-indigo-500", Readiness: "bg-blue-500",
  Dialogue: "bg-cyan-500", Alignment: "bg-teal-500", Scale: "bg-green-500",
};

function ScoreBar({ stage, score }: { stage: string; score: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium text-slate-700 flex-shrink-0">{stage}</div>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${STAGE_COLORS[stage]}`} style={{ width: `${score}%` }} />
      </div>
      <div className="w-10 text-sm font-bold text-slate-700 text-right">{score}%</div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<{ stageScores: Record<string, number>; geniusRole: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cg_results");
    if (!stored) { router.push("/assessment"); return; }
    setResults(JSON.parse(stored));
  }, [router]);

  if (!results) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  const role = GENIUS_ROLES.find((r) => r.id === results.geniusRole.toLowerCase()) || GENIUS_ROLES[4];
  const topStage = Object.entries(results.stageScores).sort(([,a],[,b]) => b - a)[0][0];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        {/* Role card */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white/70 mb-6">Your Change Genius™ Role</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-3">{role.name}</h1>
          <p className="text-indigo-300 font-semibold text-lg mb-6">{role.tagline}</p>
          <p className="text-slate-300 leading-relaxed max-w-lg mx-auto">{role.description}</p>
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-white font-bold text-xl">{results.stageScores[topStage]}%</div>
              <div className="text-slate-400">{topStage} Stage</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-white font-bold text-xl">{Math.round(Object.values(results.stageScores).reduce((a,b)=>a+b,0)/6)}%</div>
              <div className="text-slate-400">Overall Score</div>
            </div>
          </div>
        </div>

        {/* ADAPTS Profile */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">ADAPTS Stage Profile</h2>
          <p className="text-slate-500 text-sm mb-8">Your strength across each stage of the change framework.</p>
          <div className="space-y-5">
            {STAGES.map((stage) => <ScoreBar key={stage} stage={stage} score={results.stageScores[stage] || 0} />)}
          </div>
        </div>

        {/* Leadership Insights */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Leadership Insights</h2>
          <p className="text-slate-700 leading-relaxed">
            As a <strong>{role.name}</strong>, you bring distinctive value to change initiatives especially during the <strong>{topStage}</strong> stage.
            Your natural strengths make you most effective when {role.description.toLowerCase().replace("you ", "")}
            Consider partnering with team members who excel in the stages where you score lower to create balanced change capacity.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">See how your team stacks up</h3>
          <p className="text-slate-500 mb-6 text-sm">Invite your team and unlock your Team Change Map™.</p>
          <Link href="/teams/create" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Build Your Team Change Map™ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
