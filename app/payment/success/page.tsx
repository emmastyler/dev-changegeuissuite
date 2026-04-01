import { Suspense } from 'react'
import PaymentSuccessInner from './PaymentSuccessInner'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--text-3)' }}>Confirming payment…</div>
      </div>
    }>
      <PaymentSuccessInner />
    </Suspense>
  )
}
