"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Bell, TrendingUp, TrendingDown, ArrowRight, Users, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const PULSE_DATA = [
  { week: "Week 1", dialogue: 80, alignment: 70, execution: 60 },
  { week: "Week 2", dialogue: 60, alignment: 80, execution: 75 },
  { week: "Week 3", dialogue: 55, alignment: 65, execution: 80 },
  { week: "Week 4", dialogue: 70, alignment: 75, execution: 85 },
];

function ScorePill({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? "text-green-700 bg-green-50 border-green-200" : score >= 55 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";
  const dot = score >= 75 ? "bg-green-500" : score >= 55 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color}`}>
      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${dot}`} /><span className="text-sm font-semibold">{label}</span></div>
      <span className="font-black text-lg">{score}</span>
    </div>
  );
}

export default function DashboardPage() {
  const latest = PULSE_DATA[PULSE_DATA.length - 1];
  const prev = PULSE_DATA[PULSE_DATA.length - 2];
  const dialogueTrend = latest.dialogue - prev.dialogue;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here&apos;s how your team is navigating change.</p>
          </div>
          <Link href="/pulse" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Submit Pulse <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Monday Change Brief */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 bg-slate-900 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-white">Your Monday Change Brief™</div>
              <div className="text-xs text-slate-400">Week of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Team Change Health */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Team Change Health</h3>
              <div className="space-y-2">
                <ScorePill label="Dialogue" score={latest.dialogue} />
                <ScorePill label="Alignment" score={latest.alignment} />
                <ScorePill label="Execution" score={latest.execution} />
              </div>
            </div>

            {/* Leadership Signal */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              {dialogueTrend < 0 ? <TrendingDown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" /> : <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">Leadership Signal</div>
                <p className="text-sm text-slate-700">
                  {dialogueTrend < 0
                    ? "Dialogue has declined over the past two weeks. Encourage open discussion early this week."
                    : "Dialogue is recovering. Keep momentum by scheduling structured check-ins."}
                </p>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="text-sm font-bold text-slate-900 mb-1">Recommended Action</div>
              <p className="text-sm text-slate-700">Schedule a short check-in meeting to surface concerns before major decisions this week.</p>
            </div>

            {/* Participation */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-bold text-slate-900">6 of 8 team members</div>
                  <div className="text-xs text-slate-500">completed this week&apos;s pulse</div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                <Bell className="w-4 h-4" /> Send Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-1">4-Week Trend</h3>
          <p className="text-sm text-slate-500 mb-6">Team change health over the past month.</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PULSE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
              <Line type="monotone" dataKey="dialogue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} name="Dialogue" />
              <Line type="monotone" dataKey="alignment" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: "#06b6d4" }} name="Alignment" />
              <Line type="monotone" dataKey="execution" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: "#22c55e" }} name="Execution" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/pulse", label: "Submit Weekly Pulse", icon: "📊", desc: "3 questions, 30 seconds" },
            { href: "/teams", label: "View Team Map", icon: "🗺️", desc: "See role distribution" },
            { href: "/profile", label: "My Profile", icon: "👤", desc: "Your Change Genius role" },
          ].map(({ href, label, icon, desc }) => (
            <Link key={href} href={href} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{label}</div>
              <div className="text-xs text-slate-400 mt-1">{desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
