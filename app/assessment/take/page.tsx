'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ORDERED_QUESTIONS, TOTAL_QUESTIONS } from '@/lib/assessment/questions'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function AssessmentTakePage() {
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  // Assessment state
  const [assessmentId, setAssessmentId]   = useState<string | null>(null)
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [answers, setAnswers]             = useState<Record<string, number>>({})
  const [saveStatus, setSaveStatus]       = useState<SaveStatus>('idle')
  const [loadingState, setLoadingState]   = useState<'init' | 'ready' | 'submitting' | 'done'>('init')
  const [error, setError]                 = useState('')

  const question = ORDERED_QUESTIONS[currentIndex]
  const progress  = Math.round(((currentIndex) / TOTAL_QUESTIONS) * 100)
  const answered  = Object.keys(answers).length
  const currentAnswer = answers[question?.id ?? ''] ?? null

  // ── Auth + payment guard ─────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { router.push('/login?returnUrl=/assessment/take'); return }
    if (profile && !profile.has_paid) { router.push('/payment?plan=individual'); return }
  }, [authLoading, isAuthenticated, profile, router])

  // ── Start / resume assessment ────────────────────────────────
  useEffect(() => {
    if (authLoading || !isAuthenticated || !profile?.has_paid) return

    async function init() {
      try {
        const res = await fetch('/api/assessment/start', { method: 'POST' })
        if (!res.ok) throw new Error('Failed to start assessment')
        const data = await res.json() as {
          assessmentId: string
          resuming: boolean
          lastQuestionIndex: number
          answeredResponses: Record<string, number>
        }
        setAssessmentId(data.assessmentId)
        setAnswers(data.answeredResponses)
        // Resume from last answered question
        const resumeIndex = Math.min(data.lastQuestionIndex, TOTAL_QUESTIONS - 1)
        setCurrentIndex(resumeIndex)
        setLoadingState('ready')
      } catch (err) {
        setError('Could not start assessment. Please try again.')
        setLoadingState('ready')
      }
    }

    void init()
  }, [authLoading, isAuthenticated, profile])

  // ── Save answer to server ────────────────────────────────────
  const saveAnswer = useCallback(async (qId: string, value: number, qIndex: number) => {
    if (!assessmentId) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionId:    qId,
          value,
          questionIndex: qIndex,
        }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch {
      setSaveStatus('error')
    }
  }, [assessmentId])

  // ── Select answer for current question ──────────────────────
  function selectAnswer(value: number) {
    if (!question) return
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    void saveAnswer(question.id, value, currentIndex)
  }

  // ── Navigate ─────────────────────────────────────────────────
  function goNext() {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(i => i + 1)
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  // ── Auto-advance after answer (300ms delay so user sees selection) ──
  useEffect(() => {
    if (currentAnswer == null) return
    // Only auto-advance if this answer was just selected (not on load)
    // We do this by checking if we're at the latest unanswered
    const latestUnanswered = ORDERED_QUESTIONS.findIndex(q => !(q.id in answers))
    if (latestUnanswered === currentIndex + 1) {
      const t = setTimeout(() => {
        if (currentIndex < TOTAL_QUESTIONS - 1) {
          setCurrentIndex(i => i + 1)
        }
      }, 350)
      return () => clearTimeout(t)
    }
  }, [answers, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit() {
    if (!assessmentId) return
    if (answered < TOTAL_QUESTIONS) {
      setError(`Please answer all ${TOTAL_QUESTIONS} questions. You have ${TOTAL_QUESTIONS - answered} remaining.`)
      // Jump to first unanswered
      const firstUnanswered = ORDERED_QUESTIONS.findIndex(q => !(q.id in answers))
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered)
      return
    }

    setLoadingState('submitting')
    setError('')

    try {
      const res = await fetch('/api/assessment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Submission failed')
      }
      setLoadingState('done')
      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setLoadingState('ready')
    }
  }

  // ── Loading states ───────────────────────────────────────────
  if (authLoading || loadingState === 'init') {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:8 }}>Loading your assessment…</div>
          <div style={{ width:200, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'var(--blue)', borderRadius:2, animation:'loadbar 1.2s ease infinite', width:'40%' }} />
          </div>
        </div>
        <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      </div>
    )
  }

  if (loadingState === 'submitting') {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⚙️</div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>Calculating your results…</div>
          <div style={{ fontSize:13, color:'var(--text-3)' }}>This takes just a moment.</div>
        </div>
      </div>
    )
  }

  if (!question) return null

  const isOnLastQuestion = currentIndex === TOTAL_QUESTIONS - 1
  const allAnswered      = answered === TOTAL_QUESTIONS
  const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ background:'var(--navy)', padding:'0 24px', flexShrink:0 }}>
        <div style={{ maxWidth:800, margin:'0 auto', height:52, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:15, fontWeight:800, color:'white', letterSpacing:'-0.3px' }}>changegenius™</span>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Save indicator */}
            {saveStatus === 'saving' && <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>Saving…</span>}
            {saveStatus === 'saved'  && <span style={{ fontSize:12, color:'#86efac' }}>✓ Saved</span>}
            {saveStatus === 'error'  && <span style={{ fontSize:12, color:'#fca5a5' }}>⚠ Save failed</span>}
            <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>{answered}/{TOTAL_QUESTIONS} answered</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background:'rgba(10,37,64,.08)', height:4, flexShrink:0 }}>
        <div style={{ height:'100%', background:'var(--blue)', width:`${progress}%`, transition:'width .3s ease', borderRadius:'0 2px 2px 0' }} />
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
        <div style={{ width:'100%', maxWidth:680 }}>

          {/* Question card */}
          <div style={{ background:'white', borderRadius:'var(--radius)', padding:'44px 48px', boxShadow:'0 2px 16px rgba(10,37,64,.06)', marginBottom:16 }}>

            {/* Role + stage badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--blue)', background:'var(--blue-light)', padding:'3px 10px', borderRadius:'100px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {question.role}
              </span>
              <span style={{ fontSize:11, color:'var(--text-4)' }}>·</span>
              <span style={{ fontSize:11, color:'var(--text-4)' }}>{question.stage}</span>
            </div>

            {/* Question number + text */}
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-4)', marginBottom:10 }}>
              Question {currentIndex + 1} of {TOTAL_QUESTIONS}
            </div>
            <h2 style={{ fontSize:'clamp(18px,2.5vw,24px)', fontWeight:700, color:'var(--navy)', lineHeight:1.45, marginBottom:40, letterSpacing:'-0.3px' }}>
              {question.text}
            </h2>

            {/* Scale buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[1,2,3,4,5].map((val) => {
                const selected = currentAnswer === val
                return (
                  <button
                    key={val}
                    onClick={() => selectAnswer(val)}
                    style={{
                      display:'flex', alignItems:'center', gap:16,
                      padding:'14px 20px',
                      border:`2px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                      borderRadius:10,
                      background: selected ? 'var(--blue-light)' : 'white',
                      cursor:'pointer', textAlign:'left',
                      transition:'all .15s',
                      fontFamily:'Inter, sans-serif',
                    }}
                  >
                    {/* Number bubble */}
                    <div style={{
                      width:32, height:32, borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: selected ? 'var(--blue)' : 'var(--off)',
                      border: `1.5px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                      fontSize:13, fontWeight:700,
                      color: selected ? 'white' : 'var(--text-3)',
                      transition:'all .15s',
                    }}>
                      {val}
                    </div>
                    <span style={{ fontSize:14, fontWeight: selected ? 600 : 400, color: selected ? 'var(--blue)' : 'var(--text-2)' }}>
                      {labels[val - 1]}
                    </span>
                    {selected && (
                      <span style={{ marginLeft:'auto', fontSize:16, color:'var(--blue)' }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 18px', fontSize:13, color:'#dc2626', marginBottom:12 }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              style={{
                padding:'11px 22px', borderRadius:'100px',
                border:'1.5px solid var(--border)', background:'white',
                fontSize:14, fontWeight:600, color: currentIndex === 0 ? 'var(--text-4)' : 'var(--text-1)',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                fontFamily:'Inter,sans-serif', opacity: currentIndex === 0 ? 0.5 : 1,
                transition:'all .15s',
              }}
            >
              ← Back
            </button>

            {/* Dot navigator (shows nearby questions) */}
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              {Array.from({ length: Math.min(TOTAL_QUESTIONS, 9) }, (_, i) => {
                // Show dots around current position
                const offset = i - 4
                const qi = currentIndex + offset
                if (qi < 0 || qi >= TOTAL_QUESTIONS) return <div key={i} style={{ width:6, height:6 }} />
                const q = ORDERED_QUESTIONS[qi]
                const isAnswered = q.id in answers
                const isCurrent = qi === currentIndex
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(qi)}
                    style={{
                      width: isCurrent ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      border:'none', cursor:'pointer',
                      background: isCurrent ? 'var(--blue)' : isAnswered ? 'rgba(26,107,250,.4)' : 'var(--border)',
                      transition:'all .15s',
                      padding:0,
                    }}
                    title={`Question ${qi + 1}`}
                  />
                )
              })}
            </div>

            {isOnLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{
                  padding:'11px 28px', borderRadius:'100px',
                  border:'none',
                  background: allAnswered ? 'var(--blue)' : 'var(--border)',
                  fontSize:14, fontWeight:700, color: allAnswered ? 'white' : 'var(--text-4)',
                  cursor: allAnswered ? 'pointer' : 'not-allowed',
                  fontFamily:'Inter,sans-serif', transition:'all .15s',
                }}
              >
                {allAnswered ? 'Submit & See Results →' : `${TOTAL_QUESTIONS - answered} remaining`}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={currentAnswer == null}
                style={{
                  padding:'11px 22px', borderRadius:'100px',
                  border:'none',
                  background: currentAnswer != null ? 'var(--navy)' : 'var(--border)',
                  fontSize:14, fontWeight:600,
                  color: currentAnswer != null ? 'white' : 'var(--text-4)',
                  cursor: currentAnswer != null ? 'pointer' : 'not-allowed',
                  fontFamily:'Inter,sans-serif', transition:'all .15s',
                }}
              >
                Next →
              </button>
            )}
          </div>

          {/* Skip to unanswered */}
          {answered < TOTAL_QUESTIONS && answered > 0 && (
            <div style={{ textAlign:'center', marginTop:14 }}>
              <button
                onClick={() => {
                  const first = ORDERED_QUESTIONS.findIndex(q => !(q.id in answers))
                  if (first >= 0) setCurrentIndex(first)
                }}
                style={{ fontSize:12, color:'var(--text-4)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', textDecoration:'underline' }}
              >
                Jump to first unanswered question ({TOTAL_QUESTIONS - answered} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
