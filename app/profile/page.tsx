"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { GENIUS_ROLES } from "@/lib/assessment";
import { ArrowRight, Edit2, Share2 } from "lucide-react";

const STAGES = ["Alert", "Diagnose", "Readiness", "Dialogue", "Alignment", "Scale"];
const STAGE_COLORS: Record<string, string> = {
  Alert: "bg-violet-500", Diagnose: "bg-indigo-500", Readiness: "bg-blue-500",
  Dialogue: "bg-cyan-500", Alignment: "bg-teal-500", Scale: "bg-green-500",
};
const MOCK_SCORES: Record<string, number> = { Alert: 82, Diagnose: 74, Readiness: 68, Dialogue: 90, Alignment: 78, Scale: 62 };

export default function ProfilePage() {
  const [results, setResults] = useState<{ stageScores: Record<string, number>; geniusRole: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cg_results");
    if (stored) setResults(JSON.parse(stored));
    else setResults({ stageScores: MOCK_SCORES, geniusRole: "Unifier" });
  }, []);

  if (!results) return null;

  const role = GENIUS_ROLES.find((r) => r.id === results.geniusRole.toLowerCase()) || GENIUS_ROLES[3];
  const overall = Math.round(Object.values(results.stageScores).reduce((a, b) => a + b, 0) / 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        {/* Profile header */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {role.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Change Genius™ Role</div>
            <div className="text-2xl font-black text-white">{role.name}</div>
            <div className="text-slate-400 text-sm mt-1">{role.tagline}</div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"><Share2 className="w-4 h-4" /></button>
            <button className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"><Edit2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Overall Score", value: `${overall}%` },
            { label: "Top Stage", value: Object.entries(results.stageScores).sort(([,a],[,b])=>b-a)[0][0] },
            { label: "Assessments", value: "1" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ADAPTS breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-5">ADAPTS Stage Breakdown</h2>
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const score = results.stageScores[stage] || 0;
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage]} flex-shrink-0`} />
                  <div className="w-24 text-sm font-medium text-slate-700">{stage}</div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${STAGE_COLORS[stage]}`} style={{ width: `${score}%` }} />
                  </div>
                  <div className="w-10 text-sm font-bold text-slate-700 text-right">{score}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About role */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-3">About Your Role</h2>
          <p className="text-slate-700 leading-relaxed text-sm">{role.description}</p>
        </div>

        {/* Retake / invite CTAs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/assessment" className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all">
            Retake Assessment
          </Link>
          <Link href="/teams/create" className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all text-sm">
            Build Team Change Map™ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
