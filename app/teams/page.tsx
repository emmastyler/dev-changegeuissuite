"use client";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Users, Plus, Lock, ChevronRight } from "lucide-react";

const MOCK_TEAM = {
  name: "Executive Leadership Team",
  members: 6,
  threshold: 8,
  roles: [
    { role: "Catalyst", count: 1, color: "bg-violet-500" },
    { role: "Architect", count: 2, color: "bg-indigo-500" },
    { role: "Builder", count: 1, color: "bg-blue-500" },
    { role: "Unifier", count: 1, color: "bg-cyan-500" },
    { role: "Navigator", count: 1, color: "bg-teal-500" },
  ],
  capacity: 72,
};

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Teams</h1>
            <p className="text-slate-500 mt-1">Manage your teams and view collective change maps.</p>
          </div>
          <Link href="/teams/create" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> New Team
          </Link>
        </div>

        {/* Team card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">ELT</div>
                <div>
                  <div className="font-bold text-slate-900">{MOCK_TEAM.name}</div>
                  <div className="text-sm text-slate-500">{MOCK_TEAM.members} members · Team Owner</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="p-6">
            {/* Unlock progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{MOCK_TEAM.members} of 8 members</span>
                <span className="text-xs text-indigo-600 font-semibold">2 more to unlock full diagnostics</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(MOCK_TEAM.members / 8) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>3 — Basic</span><span>5 — Map</span><span>8 — Full</span>
              </div>
            </div>

            {/* Role distribution */}
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Role Distribution</h3>
            <div className="space-y-2.5 mb-6">
              {MOCK_TEAM.roles.map(({ role, count, color }) => (
                <div key={role} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  <div className="text-sm text-slate-600 w-24">{role}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${count * 16.6}%` }} />
                  </div>
                  <div className="text-sm font-semibold text-slate-600 w-4">{count}</div>
                </div>
              ))}
            </div>

            {/* Capacity score */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-sm font-medium text-slate-600">Change Capacity Score™</span>
              <span className="text-xl font-black text-slate-900">{MOCK_TEAM.capacity}<span className="text-sm text-slate-400">/100</span></span>
            </div>

            {/* Full diagnostics locked */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-600">Full diagnostics locked</div>
                <div className="text-xs text-slate-400">Add 2 more members to unlock friction patterns, collaboration risks & 90-day roadmap.</div>
              </div>
              <Link href="/teams/create" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex-shrink-0">Invite</Link>
            </div>
          </div>
        </div>

        {/* Empty state prompt */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-600 mb-1">Create another team</h3>
          <p className="text-sm text-slate-400 mb-5">Track change health across multiple teams.</p>
          <Link href="/teams/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> New Team
          </Link>
        </div>
      </div>
    </div>
  );
}
