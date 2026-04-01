'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

interface Team { id: string; name: string }
interface WeekData { week: number; dialogue: number; alignment: number; execution: number; momentum: number; respondents: number }

const CURRENT_WEEK = Math.ceil((Date.now() - new Date('2024-01-01').getTime()) / (7 * 864e5))

export default function PulsePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [teams,         setTeams]         = useState<Team[]>([])
  const [selectedTeam,  setSelectedTeam]  = useState<string>('')
  const [weeks,         setWeeks]         = useState<WeekData[]>([])
  const [submitting,    setSubmitting]     = useState(false)
  const [submitted,     setSubmitted]      = useState(false)
  const [loadingData,   setLoadingData]    = useState(false)

  // Form state
  const [dialogue,  setDialogue]  = useState(0)
  const [alignment, setAlignment] = useState(0)
  const [execution, setExecution] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?returnUrl=/pulse')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetch('/api/teams/list')
      .then(r => r.json())
      .then((d: { owned: Team[] }) => {
        const all = d.owned ?? []
        setTeams(all)
        if (all.length > 0) setSelectedTeam(all[0].id)
      })
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!selectedTeam) return
    setLoadingData(true)
    fetch(`/api/pulse?teamId=${selectedTeam}`)
      .then(r => r.json())
      .then((d: { weeks?: WeekData[] }) => { setWeeks(d.weeks ?? []); setLoadingData(false) })
      .catch(() => setLoadingData(false))
  }, [selectedTeam])

  async function submitPulse() {
    if (!selectedTeam || !dialogue || !alignment || !execution) return
    setSubmitting(true)
    const res = await fetch('/api/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: selectedTeam, weekNumber: CURRENT_WEEK, dialogueScore: dialogue, alignmentScore: alignment, executionScore: execution }),
    })
    if (res.ok) {
      setSubmitted(true)
      const d = await res.json() as { weeks?: WeekData[] }
      // Reload pulse data
      const updated = await fetch(`/api/pulse?teamId=${selectedTeam}`)
      const updatedData = await updated.json() as { weeks?: WeekData[] }
      setWeeks(updatedData.weeks ?? [])
    }
    setSubmitting(false)
  }

  const LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  const SCORE_COLORS = ['#dc2626','#f97316','#d97706','#2563eb','#16a34a']

  function ScaleSelector({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>{label}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(v => (
            <button key={v} onClick={() => onChange(v)} style={{
              flex: 1, padding: '12px 0', borderRadius: 8,
              border: `2px solid ${value === v ? SCORE_COLORS[v-1] : 'var(--border)'}`,
              background: value === v ? `${SCORE_COLORS[v-1]}18` : 'white',
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: value === v ? SCORE_COLORS[v-1] : 'var(--text-3)' }}>{v}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: value === v ? SCORE_COLORS[v-1] : 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{LABELS[v-1]}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:20 }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
          <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.55)', textDecoration:'none' }}>Dashboard</Link>
          <Link href="/teams" style={{ fontSize:13, color:'rgba(255,255,255,.55)', textDecoration:'none' }}>Teams</Link>
          <span style={{ fontSize:13, color:'white', fontWeight:600 }}>Weekly Pulse</span>
        </div>
      </div>

      <div className="page">
        <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'44px 52px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10 }}>Weekly Change Pulse™</div>
          <h1 style={{ fontSize:34, fontWeight:800, color:'white', letterSpacing:'-0.8px', marginBottom:8 }}>How is your team moving?</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.5)' }}>3 questions. Under 60 seconds. Tracks team momentum week by week.</p>
        </div>

        {teams.length === 0 ? (
          <div className="card" style={{ padding:52, textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:16 }}>📡</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:10 }}>No teams yet</h2>
            <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:24 }}>Create a team to start tracking weekly pulse data.</p>
            <Link href="/teams" style={{ background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none' }}>Create Team →</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>

            {/* Submit form */}
            <div className="card" style={{ padding:36 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>
                Week {CURRENT_WEEK} Check-in
              </div>

              {teams.length > 1 && (
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:6 }}>Team</label>
                  <select value={selectedTeam} onChange={e => { setSelectedTeam(e.target.value); setSubmitted(false) }}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif' }}>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {submitted ? (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <h3 style={{ fontSize:20, fontWeight:800, color:'var(--navy)', marginBottom:8 }}>Pulse submitted!</h3>
                  <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:20 }}>Thanks for checking in this week.</p>
                  <button onClick={() => { setSubmitted(false); setDialogue(0); setAlignment(0); setExecution(0) }}
                    style={{ fontSize:13, color:'var(--blue)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', textDecoration:'underline' }}>
                    Submit again
                  </button>
                </div>
              ) : (
                <>
                  <ScaleSelector value={dialogue} onChange={setDialogue}
                    label="How open and honest is team dialogue right now?" />
                  <ScaleSelector value={alignment} onChange={setAlignment}
                    label="How aligned is the team on goals and priorities?" />
                  <ScaleSelector value={execution} onChange={setExecution}
                    label="How confident are you in the team's execution pace?" />

                  <button onClick={submitPulse}
                    disabled={submitting || !dialogue || !alignment || !execution}
                    style={{
                      width:'100%', padding:'13px', borderRadius:'100px', border:'none',
                      background: (!dialogue || !alignment || !execution) ? 'var(--border)' : 'var(--blue)',
                      color: (!dialogue || !alignment || !execution) ? 'var(--text-4)' : 'white',
                      fontSize:14, fontWeight:700, cursor: (!dialogue || !alignment || !execution) ? 'not-allowed' : 'pointer',
                      fontFamily:'Inter,sans-serif', marginTop:8,
                    }}>
                    {submitting ? 'Submitting…' : 'Submit Pulse →'}
                  </button>
                </>
              )}
            </div>

            {/* Trend chart */}
            <div className="card" style={{ padding:36 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:20 }}>Momentum Trend</div>
              {loadingData ? (
                <div style={{ fontSize:13, color:'var(--text-4)', textAlign:'center', padding:'40px 0' }}>Loading data…</div>
              ) : weeks.length === 0 ? (
                <div style={{ fontSize:13, color:'var(--text-4)', textAlign:'center', padding:'40px 0' }}>No pulse data yet. Submit your first check-in →</div>
              ) : (
                <>
                  {/* Simple trend bars */}
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {weeks.slice(-8).map(w => (
                      <div key={w.week}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:'var(--text-3)' }}>Week {w.week}</span>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={{ fontSize:11, color:'var(--text-4)' }}>{w.respondents} resp.</span>
                            <span style={{ fontSize:13, fontWeight:800, color: w.momentum >= 70 ? '#16a34a' : w.momentum >= 45 ? '#2563eb' : '#d97706' }}>{w.momentum}%</span>
                          </div>
                        </div>
                        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${w.momentum}%`, background: w.momentum >= 70 ? '#16a34a' : w.momentum >= 45 ? 'var(--blue)' : '#d97706', borderRadius:3, transition:'width .4s' }} />
                        </div>
                        <div style={{ display:'flex', gap:16, marginTop:4 }}>
                          {[['D', w.dialogue],['A', w.alignment],['E', w.execution]].map(([lbl, val]) => (
                            <span key={lbl as string} style={{ fontSize:10, color:'var(--text-4)' }}>{lbl}: {val}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Latest snapshot */}
                  {weeks.length > 0 && (() => {
                    const latest = weeks[weeks.length - 1]
                    return (
                      <div style={{ marginTop:24, padding:'16px 18px', background:'var(--off)', borderRadius:10, border:'1px solid var(--border)' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Latest Week</div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                          {[['Dialogue', latest.dialogue],['Alignment', latest.alignment],['Execution', latest.execution]].map(([lbl, val]) => (
                            <div key={lbl as string} style={{ textAlign:'center' }}>
                              <div style={{ fontSize:22, fontWeight:900, color:'var(--blue)' }}>{val}</div>
                              <div style={{ fontSize:10, color:'var(--text-4)', fontWeight:600 }}>{lbl}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
