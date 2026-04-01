'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalUsers: number; paidUsers: number; completedUsers: number
  totalAssessments: number; completedAssessments: number
  totalTeams: number; totalPayments: number
  revenue: { currency: string; amount: string }[]
}
interface User {
  id: string; email: string; full_name: string | null
  has_paid: boolean; onboarded: boolean; change_genius_role: string | null
  role: string; created_at: string
}
interface Team {
  id: string; name: string; organization: string | null
  invite_code: string; created_at: string
}

const ADMIN_TOKEN = typeof window !== 'undefined' ? (localStorage.getItem('cg_admin_token') ?? '') : ''

export default function AdminPage() {
  const [token,   setToken]   = useState('')
  const [authed,  setAuthed]  = useState(false)
  const [tab,     setTab]     = useState<'stats'|'users'|'teams'|'questions'>('stats')
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [users,   setUsers]   = useState<User[]>([])
  const [teams,   setTeams]   = useState<Team[]>([])
  const [qCount,  setQCount]  = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function fetchData(t: string, type: string) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin?type=${type}`, {
        headers: { 'x-admin-token': t },
      })
      if (res.status === 401) { setError('Invalid admin token'); setAuthed(false); setLoading(false); return }
      const data = await res.json() as any
      if (type === 'stats')  setStats(data)
      if (type === 'users')  setUsers(data.users ?? [])
      if (type === 'teams')  setTeams(data.teams ?? [])
      if (type === 'questions') setQCount(data.total ?? 0)
      setAuthed(true)
    } catch { setError('Request failed') }
    setLoading(false)
  }

  function login() {
    localStorage.setItem('cg_admin_token', token)
    void fetchData(token, 'stats')
  }

  useEffect(() => {
    if (authed) void fetchData(token, tab)
  }, [tab, authed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!authed) return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'48px 44px', maxWidth:400, width:'100%', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>Admin Access</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--navy)', marginBottom:24 }}>changegenius™ Admin</h1>
        {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 }}>{error}</div>}
        <input type="password" value={token} onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Admin secret token"
          style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', marginBottom:12 }} />
        <button onClick={login} style={{ width:'100%', padding:'12px', background:'var(--blue)', color:'white', border:'none', borderRadius:'100px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Access Admin →
        </button>
        <div style={{ marginTop:16, textAlign:'center' }}>
          <Link href="/" style={{ fontSize:12, color:'var(--text-4)', textDecoration:'none' }}>← Back to site</Link>
        </div>
      </div>
    </div>
  )

  const TABS = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'users', label: '👤 Users' },
    { id: 'teams', label: '👥 Teams' },
    { id: 'questions', label: '📋 Questions' },
  ] as const

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <span style={{ fontSize:16, fontWeight:800, color:'white' }}>changegenius™ <span style={{ color:'rgba(255,255,255,.45)', fontSize:12 }}>admin</span></span>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ fontSize:13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? 'white' : 'rgba(255,255,255,.55)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', padding:'4px 0', borderBottom: tab === t.id ? '2px solid var(--blue)' : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>
          <Link href="/" style={{ fontSize:13, color:'rgba(255,255,255,.45)', textDecoration:'none' }}>← Site</Link>
        </div>
      </div>

      <div className="page">
        {loading && <div style={{ fontSize:13, color:'var(--text-3)', textAlign:'center', padding:'40px 0' }}>Loading…</div>}
        {error   && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 18px', fontSize:13, color:'#dc2626' }}>{error}</div>}

        {/* ── STATS ── */}
        {tab === 'stats' && stats && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {[
                { label:'Total Users',        value: stats.totalUsers,            sub: `${stats.paidUsers} paid` },
                { label:'Assessments Done',   value: stats.completedAssessments,  sub: `of ${stats.totalAssessments} started` },
                { label:'Teams Created',      value: stats.totalTeams,            sub: 'active teams' },
                { label:'Payments',           value: stats.totalPayments,         sub: stats.revenue.map(r => `${r.currency} ${r.amount}`).join(' · ') },
              ].map(card => (
                <div key={card.label} className="card" style={{ padding:'22px 24px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>{card.label}</div>
                  <div style={{ fontSize:36, fontWeight:900, color:'var(--navy)', letterSpacing:'-1px', marginBottom:4 }}>{card.value}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="card" style={{ padding:28 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14 }}>Conversion Funnel</div>
                {[
                  ['Signed up',    stats.totalUsers,            '100%'],
                  ['Paid',         stats.paidUsers,             `${stats.totalUsers > 0 ? Math.round((stats.paidUsers/stats.totalUsers)*100) : 0}%`],
                  ['Completed',    stats.completedUsers,         `${stats.totalUsers > 0 ? Math.round((stats.completedUsers/stats.totalUsers)*100) : 0}%`],
                ].map(([label, val, pct]) => (
                  <div key={label as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--text-2)' }}>{label}</span>
                    <div style={{ display:'flex', gap:12 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--navy)' }}>{val}</span>
                      <span style={{ fontSize:12, color:'var(--text-4)', width:36, textAlign:'right' }}>{pct}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:28 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14 }}>Revenue</div>
                {stats.revenue.map(r => (
                  <div key={r.currency} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:2 }}>{r.currency}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:'var(--navy)', letterSpacing:'-1px' }}>
                      {r.currency === 'NGN' ? '₦' : '$'}{Number(r.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
                {stats.revenue.length === 0 && <div style={{ fontSize:13, color:'var(--text-4)' }}>No payments yet</div>}
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--navy)' }}>{users.length} users</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'var(--off)' }}>
                    {['Name','Email','Role','Paid','Assessed','CG Role','Joined'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom:'1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--off)' }}>
                      <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--navy)' }}>{u.full_name ?? '—'}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text-3)' }}>{u.email}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text-3)' }}>{u.role}</td>
                      <td style={{ padding:'9px 14px' }}><span style={{ color: u.has_paid ? '#16a34a' : '#dc2626', fontWeight:600 }}>{u.has_paid ? '✓' : '✗'}</span></td>
                      <td style={{ padding:'9px 14px' }}><span style={{ color: u.onboarded ? '#16a34a' : 'var(--text-4)', fontWeight:600 }}>{u.onboarded ? '✓' : '—'}</span></td>
                      <td style={{ padding:'9px 14px', color:'var(--blue)', fontWeight:600 }}>{u.change_genius_role ?? '—'}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text-4)' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TEAMS ── */}
        {tab === 'teams' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--navy)' }}>{teams.length} teams</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'var(--off)' }}>
                    {['Team Name','Organisation','Invite Code','Created'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom:'1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--off)' }}>
                      <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--navy)' }}>{t.name}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text-3)' }}>{t.organization ?? '—'}</td>
                      <td style={{ padding:'9px 14px', fontFamily:'monospace', color:'var(--blue)', fontWeight:700 }}>{t.invite_code}</td>
                      <td style={{ padding:'9px 14px', color:'var(--text-4)' }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {tab === 'questions' && (
          <div className="card" style={{ padding:36 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:16 }}>Question Bank</div>
            <p style={{ fontSize:15, color:'var(--text-2)', marginBottom:24 }}>
              <strong style={{ color:'var(--navy)' }}>60 questions</strong> across 6 roles (10 each). Questions are defined in <code style={{ background:'var(--off)', padding:'2px 6px', borderRadius:4, fontSize:13 }}>lib/assessment/questions.ts</code> and are version-controlled. To update questions, edit that file and redeploy.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {['Innovator','Achiever','Organizer','Unifier','Builder','Refiner'].map(role => (
                <div key={role} style={{ background:'var(--off)', borderRadius:10, padding:'16px 18px', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>{role}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:'var(--blue)' }}>10</div>
                  <div style={{ fontSize:12, color:'var(--text-4)' }}>questions</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, padding:'14px 18px', background:'var(--blue-light)', borderRadius:10, border:'1px solid var(--border)', fontSize:13, color:'var(--navy)' }}>
              ⚡ Questions are loaded from code — no database required. To add/edit questions, modify <code>lib/assessment/questions.ts</code> and redeploy. Scoring engine is also config-driven with no hardcoded logic.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
