"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Copy, Check, Users, ArrowRight, Lock } from "lucide-react";

export default function CreateTeamPage() {
  const [step, setStep] = useState<"create" | "invite">("create");
  const [teamName, setTeamName] = useState("");
  const [copied, setCopied] = useState(false);
  const inviteCode = "CGT-X8K2P";
  const inviteLink = `https://changegeniussuite.com/join/${inviteCode}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const unlockTiers = [
    { count: 3, label: "Basic role distribution visible", color: "bg-indigo-500" },
    { count: 5, label: "Team Change Map™ unlocks", color: "bg-indigo-600" },
    { count: 8, label: "Full diagnostics unlock", color: "bg-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-5">
            <Users className="w-3.5 h-3.5" /> Team Setup
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Build Your Team Change Map™</h1>
          <p className="text-slate-500 leading-relaxed">Create your team, invite members, and unlock collective change intelligence.</p>
        </div>

        {step === "create" ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Name your team</h2>
            <p className="text-slate-500 text-sm mb-8">This is how your team will appear on the Team Change Map™.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team name</label>
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Executive Leadership Team"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Your role</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm bg-white appearance-none">
                  <option value="">Select a role...</option>
                  <option>Team Owner</option>
                  <option>Team Member</option>
                </select>
              </div>
            </div>
            <button onClick={() => setStep("invite")} disabled={!teamName.trim()}
              className="w-full mt-8 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Create Team & Get Invite Link <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Invite card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{teamName} created!</div>
                  <div className="text-sm text-slate-500">Share your invite link with team members.</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-3 border border-slate-200 mb-4">
                <div className="text-sm text-slate-600 font-mono truncate">{inviteLink}</div>
                <button onClick={copyLink} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${copied ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}`}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                Invite code: <span className="font-mono font-semibold text-slate-600">{inviteCode}</span>
              </div>
            </div>

            {/* Unlock tiers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="font-bold text-slate-900 mb-1">Insights unlock as you grow</h3>
              <p className="text-slate-500 text-sm mb-6">More members = deeper team intelligence.</p>
              <div className="space-y-4">
                {unlockTiers.map(({ count, label, color }) => (
                  <div key={count} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>{count}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{count} members</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
