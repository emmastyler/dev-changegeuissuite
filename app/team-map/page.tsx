"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

const ROLES = [
  { role: "Catalyst", count: 1, color: "bg-violet-500", text: "text-violet-700", light: "bg-violet-50 border-violet-200", desc: "Sparks transformation" },
  { role: "Architect", count: 2, color: "bg-indigo-500", text: "text-indigo-700", light: "bg-indigo-50 border-indigo-200", desc: "Designs change structures" },
  { role: "Builder", count: 1, color: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50 border-blue-200", desc: "Executes plans" },
  { role: "Unifier", count: 1, color: "bg-cyan-500", text: "text-cyan-700", light: "bg-cyan-50 border-cyan-200", desc: "Aligns the team" },
  { role: "Navigator", count: 1, color: "bg-teal-500", text: "text-teal-700", light: "bg-teal-50 border-teal-200", desc: "Steers through uncertainty" },
  { role: "Amplifier", count: 0, color: "bg-green-500", text: "text-slate-500", light: "bg-slate-50 border-slate-200", desc: "Scales success" },
];

const RADAR_DATA = [
  { stage: "Alert", score: 78 },
  { stage: "Diagnose", score: 82 },
  { stage: "Readiness", score: 55 },
  { stage: "Dialogue", score: 90 },
  { stage: "Alignment", score: 74 },
  { stage: "Scale", score: 48 },
];

export default function TeamMapPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm font-medium text-indigo-600 mb-1">Executive Leadership Team</div>
            <h1 className="text-3xl font-bold text-slate-900">Team Change Map™</h1>
            <p className="text-slate-500 mt-1 text-sm">6 members · Change Capacity Score™: <span className="font-bold text-slate-700">72/100</span></p>
          </div>
          <Link href="/pulse" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Run Weekly Pulse <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Role distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Role Distribution</h2>
            <div className="space-y-3">
              {ROLES.map(({ role, count, color, text, light, desc }) => (
                <div key={role} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${count > 0 ? light : "bg-slate-50 border-slate-200 opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${count > 0 ? color : "bg-slate-200"} flex items-center justify-center text-white font-black text-xs`}>{role[0]}</div>
                    <div>
                      <div className={`text-sm font-semibold ${count > 0 ? text : "text-slate-400"}`}>{role}</div>
                      <div className="text-xs text-slate-400">{desc}</div>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${count > 0 ? "text-slate-800" : "text-slate-300"}`}>{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-1">ADAPTS Stage Capacity</h2>
            <p className="text-slate-500 text-xs mb-4">Collective team strength across all 6 stages</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="stage" tick={{ fontSize: 11, fill: "#475569" }} />
                <Radar name="Team" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Friction patterns */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Friction Patterns
            </h2>
            <div className="space-y-3">
              {[
                { risk: "No Amplifiers — scaling may stall", severity: "high" },
                { risk: "Low Readiness capacity (55%)", severity: "medium" },
                { risk: "Scale stage under-resourced (48%)", severity: "high" },
              ].map(({ risk, severity }) => (
                <div key={risk} className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${severity === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                  {risk}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Strengths
            </h2>
            <div className="space-y-3">
              {[
                "Strong Dialogue capacity (90%) — open communication",
                "Good Diagnose coverage (82%) — root cause thinking",
                "Balanced leadership with Architects",
              ].map((strength) => (
                <div key={strength} className="flex items-start gap-2.5 p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  {strength}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 90-day roadmap */}
        <div className="bg-slate-900 rounded-2xl p-8">
          <h2 className="font-bold text-white mb-1">90-Day Change Roadmap</h2>
          <p className="text-slate-400 text-sm mb-6">Recommended focus areas based on your team's change profile.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { phase: "Days 1–30", title: "Build Readiness", items: ["Run 2 readiness workshops", "Identify scale champions", "Address resistance early"] },
              { phase: "Days 31–60", title: "Strengthen Alignment", items: ["Weekly alignment check-ins", "Clarify decision rights", "Connect individual to strategy"] },
              { phase: "Days 61–90", title: "Activate Scale", items: ["Recruit Amplifier profile", "Embed change in systems", "Measure and celebrate wins"] },
            ].map(({ phase, title, items }) => (
              <div key={phase} className="bg-white/10 rounded-xl p-5">
                <div className="text-xs text-indigo-300 font-semibold mb-1">{phase}</div>
                <div className="font-bold text-white mb-3">{title}</div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
