"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

type PulseAnswer = "yes" | "somewhat" | "no";
const SCORE_MAP: Record<PulseAnswer, number> = { yes: 100, somewhat: 60, no: 20 };

const QUESTIONS = [
  { id: "dialogue", label: "Dialogue", question: "Did your team openly discuss emerging challenges this week?" },
  { id: "alignment", label: "Alignment", question: "Did priorities remain aligned with strategic goals?" },
  { id: "execution", label: "Execution", question: "Did execution move forward effectively this week?" },
];

function ScoreIndicator({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "text-green-600 bg-green-50 border-green-200" : score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
  const dot = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`rounded-xl p-5 border-2 ${color}`}>
      <div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full ${dot}`} /><span className="text-sm font-semibold">{label} Score</span></div>
      <div className="text-4xl font-black">{score}</div>
    </div>
  );
}

export default function PulsePage() {
  const [answers, setAnswers] = useState<Record<string, PulseAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);
  const scores = submitted ? {
    dialogue: SCORE_MAP[answers.dialogue],
    alignment: SCORE_MAP[answers.alignment],
    execution: SCORE_MAP[answers.execution],
  } : null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-6">Weekly Pulse</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Weekly Change Pulse™</h1>
          <p className="text-slate-500 leading-relaxed">Track how your team is navigating change in real time. Three questions. Thirty seconds.</p>
        </div>

        {!submitted ? (
          <div className="space-y-6">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{q.label}</span>
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-5">{q.question}</p>
                <div className="grid grid-cols-3 gap-3">
                  {(["yes", "somewhat", "no"] as PulseAnswer[]).map((opt) => (
                    <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${answers[q.id] === opt ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setSubmitted(true)} disabled={!allAnswered}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              Submit Pulse <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Pulse Submitted!</h2>
              <p className="text-slate-500">This week&apos;s scores have been recorded.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {scores && <>
                <ScoreIndicator label="Dialogue" score={scores.dialogue} />
                <ScoreIndicator label="Alignment" score={scores.alignment} />
                <ScoreIndicator label="Execution" score={scores.execution} />
              </>}
            </div>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
