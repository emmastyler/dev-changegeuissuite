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
        <div className="card" style={{ padding:52 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>About Us</div>
          <h1 style={{ fontSize:40, fontWeight:800, color:'var(--text-1)', letterSpacing:'-1px', marginBottom:16, lineHeight:1.12 }}>Built for leaders navigating transformation.</h1>
          <p style={{ fontSize:16, color:'var(--text-2)', lineHeight:1.7, maxWidth:640 }}>Change Genius™ is the first assessment-based framework that reveals exactly how individuals and teams drive transformation. Built on the ADAPTS model — six stages from sensing disruption to scaling impact — it gives every leader and organization a shared language for change.</p>
        </div>
      </div>
    </div>
  )
}
