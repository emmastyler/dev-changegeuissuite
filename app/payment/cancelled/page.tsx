import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '52px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(10,37,64,.08)' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>↩️</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', marginBottom: 10 }}>Payment cancelled</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 32 }}>
          No charge was made. You can go back and complete your purchase when you&apos;re ready.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/payment" style={{ background: 'var(--blue)', color: 'white', fontSize: 14, fontWeight: 700, padding: '11px 28px', borderRadius: '100px', textDecoration: 'none' }}>
            Try Again
          </Link>
          <Link href="/" style={{ background: 'white', color: 'var(--navy)', fontSize: 14, fontWeight: 700, padding: '11px 28px', borderRadius: '100px', textDecoration: 'none', border: '1.5px solid var(--border)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
