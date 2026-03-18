"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSESSMENT_QUESTIONS, SCALE_LABELS, calculateResults } from "@/lib/assessment";
import type { ScaleValue } from "@/lib/assessment";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ScaleValue>>({});
  const [selected, setSelected] = useState<ScaleValue | null>(null);

  const question = ASSESSMENT_QUESTIONS[current];
  const total = ASSESSMENT_QUESTIONS.length;
  const progress = (current / total) * 100;
  const isLast = current === total - 1;

  function handleAnswer(value: ScaleValue) { setSelected(value); }

  function handleNext() {
    if (!selected) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    if (isLast) {
      const results = calculateResults(newAnswers);
      localStorage.setItem("cg_results", JSON.stringify({ answers: newAnswers, ...results }));
      router.push("/results");
    } else {
      setCurrent(current + 1);
      setSelected(answers[ASSESSMENT_QUESTIONS[current + 1]?.id] || null);
    }
  }

  function handleBack() {
    if (current === 0) return;
    setCurrent(current - 1);
    setSelected(answers[ASSESSMENT_QUESTIONS[current - 1]?.id] || null);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white" /></div>
            Change Genius™
          </Link>
          <div className="text-sm font-medium text-slate-500">Question <span className="text-slate-900 font-bold">{current + 1}</span> of {total}</div>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="pt-24 pb-32 px-4 max-w-2xl mx-auto">
        <div className="mt-12">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{question.stage} Stage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug mb-12">{question.text}</h2>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as ScaleValue[]).map((value) => (
              <button key={value} onClick={() => handleAnswer(value)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${selected === value ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === value ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                  {selected === value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="font-medium text-sm sm:text-base">{SCALE_LABELS[value]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button onClick={handleBack} disabled={current === 0} className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 text-center"><div className="text-xs text-slate-400 font-medium">Est. 8–10 minutes total</div></div>
          <button onClick={handleNext} disabled={!selected} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {isLast ? "See Results" : "Next"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
