import Link from 'next/link'
export default function PricingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)', padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
          <Link href="/signup" style={{ fontSize:13, fontWeight:700, color:'white', background:'var(--blue)', padding:'7px 18px', borderRadius:'100px', textDecoration:'none' }}>Get started</Link>
        </div>
      </div>
      <div className="page">
        <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'60px 52px', textAlign:'center' }}>
          <h1 style={{ fontSize:44, fontWeight:800, color:'white', letterSpacing:'-1.2px', marginBottom:14 }}>Simple pricing. One payment.</h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.55)', lineHeight:1.65, marginBottom:0 }}>$24 per person. Individual or team. No subscription. No complexity.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:'var(--navy-mid)', borderRadius:'var(--radius)', padding:'44px 40px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.36)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14 }}>For Individuals</div>
            <div style={{ fontSize:52, fontWeight:900, color:'white', letterSpacing:'-2px', lineHeight:1, marginBottom:6 }}>$24</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginBottom:24 }}>One-time payment</div>
            <Link href="/signup" style={{ display:'inline-block', background:'white', color:'var(--navy)', fontSize:14, fontWeight:700, padding:'12px 24px', borderRadius:'100px', textDecoration:'none' }}>Get Started →</Link>
          </div>
          <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'44px 40px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.36)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14 }}>For Teams</div>
            <div style={{ fontSize:52, fontWeight:900, color:'white', letterSpacing:'-2px', lineHeight:1, marginBottom:6 }}>$24<span style={{ fontSize:20, fontWeight:400 }}>/person</span></div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginBottom:24 }}>Minimum 3 members</div>
            <Link href="/signup" style={{ display:'inline-block', background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'12px 24px', borderRadius:'100px', textDecoration:'none' }}>Start a Team →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
