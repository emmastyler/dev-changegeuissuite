import Link from 'next/link'
export default function AboutPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)', padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
          <Link href="/signup" style={{ fontSize:13, fontWeight:700, color:'white', background:'var(--blue)', padding:'7px 18px', borderRadius:'100px', textDecoration:'none' }}>Get started</Link>
        </div>
      </div>
      <div className="page">
        <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'64px 52px', textAlign:'center' }}>
          <h1 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:800, color:'white', letterSpacing:'-1px', marginBottom:14 }}>About Change Genius™</h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.55)', lineHeight:1.65, maxWidth:560, margin:'0 auto' }}>
            The leadership intelligence platform for change. Built on the ADAPTS™ framework.
          </p>
        </div>
        <div className="card" style={{ padding:52 }}>
          <p style={{ fontSize:16, color:'var(--text-2)', lineHeight:1.8, maxWidth:680 }}>
            Change Genius™ is the first assessment-based framework that reveals exactly how individuals and teams drive transformation. Built on the ADAPTS model — six stages from sensing disruption to scaling impact — it gives every leader and organization a shared language for change.
          </p>
        </div>
      </div>
    </div>
  )
}
