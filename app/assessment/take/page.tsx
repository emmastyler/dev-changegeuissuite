"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ORDERED_QUESTIONS, TOTAL_QUESTIONS } from "@/lib/assessment/questions";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export default function AssessmentTakePage() {
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("retake") === "true";

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loadingState, setLoadingState] = useState<
    "init" | "ready" | "submitting" | "done"
  >("init");
  const [error, setError] = useState("");

  const question = ORDERED_QUESTIONS[currentIndex];
  const progress = Math.round((currentIndex / TOTAL_QUESTIONS) * 100);
  const answered = Object.keys(answers).length;
  const currentAnswer = answers[question?.id ?? ""] ?? null;
  const isLast = currentIndex === TOTAL_QUESTIONS - 1;
  const allAnswered = answered === TOTAL_QUESTIONS;

  // Auth + payment guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/assessment/take");
      return;
    }
    if (profile && !profile.has_paid) {
      router.push("/payment?plan=individual");
      return;
    }
  }, [authLoading, isAuthenticated, profile, router]);

  // Start or resume assessment
  useEffect(() => {
    if (authLoading || !isAuthenticated || !profile?.has_paid) return;
    async function init() {
      try {
        const url = isRetake
          ? "/api/assessment/start?fresh=true"
          : "/api/assessment/start";
        console.log("[take] Calling", url);
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 403 && data.paymentRequired) {
            router.push("/payment?plan=individual");
            return;
          }
          throw new Error("Failed to start");
        }
        const data = (await res.json()) as {
          assessmentId: string;
          lastQuestionIndex: number;
          answeredResponses: Record<string, number>;
        };
        setAssessmentId(data.assessmentId);
        setAnswers(data.answeredResponses);
        setCurrentIndex(data.lastQuestionIndex);
        setLoadingState("ready");
        // Clear retake param from URL after using it
        if (isRetake) {
          router.replace("/assessment/take", undefined);
        }
      } catch {
        setError("Could not start assessment. Please refresh and try again.");
        setLoadingState("ready");
      }
    }
    void init();
  }, [authLoading, isAuthenticated, profile, router, isRetake]);

  // Save single answer
  const saveAnswer = useCallback(
    async (qId: string, value: number, qIndex: number) => {
      if (!assessmentId) return;
      setSaveStatus("saving");
      try {
        const res = await fetch("/api/assessment/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            questionId: qId,
            value,
            questionIndex: qIndex,
          }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
        setTimeout(() => setSaveStatus("idle"), 1200);
      } catch {
        setSaveStatus("error");
      }
    },
    [assessmentId],
  );

  function selectAnswer(value: number) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    void saveAnswer(question.id, value, currentIndex);
  }

  function goNext() {
    if (currentAnswer == null) return;
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((i) => i + 1);
      setError("");
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setError("");
    }
  }

  async function handleSubmit() {
    if (!assessmentId) return;
    if (!allAnswered) {
      const firstUnanswered = ORDERED_QUESTIONS.findIndex(
        (q) => !(q.id in answers),
      );
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
      setError(
        `Please answer all questions. ${TOTAL_QUESTIONS - answered} remaining.`,
      );
      return;
    }
    setLoadingState("submitting");
    setError("");
    try {
      const res = await fetch("/api/assessment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Submission failed");
      }
      setLoadingState("done");
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
      setLoadingState("ready");
    }
  }

  if (authLoading || loadingState === "init")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10 }}
          >
            Loading your assessment…
          </div>
          <div
            style={{
              width: 200,
              height: 3,
              background: "var(--border)",
              borderRadius: 2,
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--blue)",
                width: "40%",
                animation: "loadbar 1.2s ease infinite",
                borderRadius: 2,
              }}
            />
          </div>
        </div>
        <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      </div>
    );

  if (loadingState === "submitting")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--navy)",
              marginBottom: 8,
            }}
          >
            Calculating your results…
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            This takes just a moment.
          </div>
        </div>
      </div>
    );

  if (!question) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sage)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ background: "var(--navy)", flexShrink: 0 }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "0 24px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.3px",
            }}
          >
            changegenius™
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {saveStatus === "saving" && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                Saving…
              </span>
            )}
            {saveStatus === "saved" && (
              <span style={{ fontSize: 12, color: "#86efac" }}>✓ Saved</span>
            )}
            {saveStatus === "error" && (
              <span style={{ fontSize: 12, color: "#fca5a5" }}>
                ⚠ Save failed
              </span>
            )}
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>
              {answered}/{TOTAL_QUESTIONS} answered
            </span>
          </div>
        </div>
      </div>

      <div
        style={{ height: 4, background: "rgba(10,37,64,.08)", flexShrink: 0 }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--blue)",
            width: `${progress}%`,
            transition: "width .3s ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640 }}>
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius)",
              padding: "40px 44px",
              boxShadow: "0 2px 16px rgba(10,37,64,.07)",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--blue)",
                  background: "var(--blue-light)",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {question.role}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-4)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--text-4)" }}>
                {question.stage}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-4)",
                marginBottom: 8,
              }}
            >
              Question {currentIndex + 1} of {TOTAL_QUESTIONS}
            </div>
            <h2
              style={{
                fontSize: "clamp(17px,2.5vw,22px)",
                fontWeight: 700,
                color: "var(--navy)",
                lineHeight: 1.5,
                marginBottom: 32,
                letterSpacing: "-0.2px",
              }}
            >
              {question.text}
            </h2>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-3)",
                  marginBottom: 14,
                }}
              >
                Select one answer:
              </legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((val) => {
                  const selected = currentAnswer === val;
                  return (
                    <label
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 18px",
                        border: `2px solid ${selected ? "var(--blue)" : "var(--border)"}`,
                        borderRadius: 10,
                        background: selected ? "var(--blue-light)" : "white",
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          flexShrink: 0,
                          border: `2px solid ${selected ? "var(--blue)" : "var(--border)"}`,
                          background: selected ? "var(--blue)" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "white",
                            }}
                          />
                        )}
                      </div>
                      <input
                        type="radio"
                        name={`question-${currentIndex}`}
                        value={val}
                        checked={selected}
                        onChange={() => selectAnswer(val)}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: 0,
                          height: 0,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: selected ? "var(--blue)" : "var(--text-4)",
                            minWidth: 16,
                          }}
                        >
                          {val}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: selected ? 600 : 400,
                            color: selected ? "var(--navy)" : "var(--text-2)",
                          }}
                        >
                          {LABELS[val - 1]}
                        </span>
                      </div>
                      {selected && (
                        <span
                          style={{
                            fontSize: 16,
                            color: "var(--blue)",
                            marginLeft: "auto",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              style={{
                padding: "11px 22px",
                borderRadius: "100px",
                border: "1.5px solid var(--border)",
                background: "white",
                fontSize: 14,
                fontWeight: 600,
                color: currentIndex === 0 ? "var(--text-4)" : "var(--text-1)",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                opacity: currentIndex === 0 ? 0.5 : 1,
                fontFamily: "Inter,sans-serif",
              }}
            >
              ← Back
            </button>

            <div
              style={{
                display: "flex",
                gap: 5,
                alignItems: "center",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {Array.from({ length: 9 }, (_, i) => {
                const offset = i - 4;
                const qi = currentIndex + offset;
                if (qi < 0 || qi >= TOTAL_QUESTIONS)
                  return <div key={i} style={{ width: 6, height: 6 }} />;
                const q = ORDERED_QUESTIONS[qi];
                const isAnswered = q.id in answers;
                const isCurrent = qi === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(qi)}
                    title={`Question ${qi + 1}`}
                    style={{
                      width: isCurrent ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      background: isCurrent
                        ? "var(--blue)"
                        : isAnswered
                          ? "rgba(26,107,250,.4)"
                          : "var(--border)",
                    }}
                  />
                );
              })}
            </div>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{
                  padding: "11px 28px",
                  borderRadius: "100px",
                  border: "none",
                  background: allAnswered ? "var(--blue)" : "var(--border)",
                  color: allAnswered ? "white" : "var(--text-4)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: allAnswered ? "pointer" : "not-allowed",
                  fontFamily: "Inter,sans-serif",
                }}
              >
                {allAnswered
                  ? "Submit & See Results →"
                  : `${TOTAL_QUESTIONS - answered} remaining`}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={currentAnswer == null}
                style={{
                  padding: "11px 28px",
                  borderRadius: "100px",
                  border: "none",
                  background:
                    currentAnswer != null ? "var(--navy)" : "var(--border)",
                  color: currentAnswer != null ? "white" : "var(--text-4)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: currentAnswer != null ? "pointer" : "not-allowed",
                  fontFamily: "Inter,sans-serif",
                }}
              >
                Next →
              </button>
            )}
          </div>

          {currentAnswer == null && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-4)",
                marginTop: 12,
              }}
            >
              Select an answer above to continue
            </p>
          )}

          {answered < TOTAL_QUESTIONS && answered > 0 && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                onClick={() => {
                  const first = ORDERED_QUESTIONS.findIndex(
                    (q) => !(q.id in answers),
                  );
                  if (first >= 0) setCurrentIndex(first);
                }}
                style={{
                  fontSize: 12,
                  color: "var(--text-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                  textDecoration: "underline",
                }}
              >
                Jump to first unanswered ({TOTAL_QUESTIONS - answered} left)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
