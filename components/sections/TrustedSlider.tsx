'use client'
import { useEffect, useRef } from 'react'

const ORGS = [
  'Deloitte', 'McKinsey', 'Accenture', 'KPMG', 'EY', 'PwC', 'BCG',
  'Bain & Co.', 'Oliver Wyman', 'A.T. Kearney', 'Roland Berger', 'Capgemini',
]

export default function TrustedSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const posRef = useRef(0)
  const speed = 0.6 // px per frame

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // Clone children for seamless loop
    const clone = track.innerHTML
    track.innerHTML += clone

    function step() {
      posRef.current += speed
      const halfWidth = track!.scrollWidth / 2
      if (posRef.current >= halfWidth) posRef.current = 0
      track!.style.transform = `translateX(-${posRef.current}px)`
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)

    // Pause on hover
    const el = track.parentElement!
    const pause = () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    const resume = () => { animRef.current = requestAnimationFrame(step) }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
    }
  }, [])

  return (
    <div className="card fade-up" style={{ padding: '32px 0', overflow: 'hidden' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-4)',
        textTransform: 'uppercase', letterSpacing: '2.5px',
        textAlign: 'center', marginBottom: 24,
      }}>
        Trusted by organizations worldwide
      </div>
      {/* Fade masks */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to right, white, transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to left, white, transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{ overflow: 'hidden', padding: '4px 0' }}>
          <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', willChange: 'transform', width: 'max-content' }}>
            {ORGS.map((name) => (
              <div key={name} style={{
                padding: '0 40px',
                borderRight: '1px solid var(--border)',
                flexShrink: 0,
                display: 'flex', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 18, fontWeight: 800, color: '#94a3b8',
                  whiteSpace: 'nowrap', letterSpacing: '-0.3px',
                  transition: 'color .2s', cursor: 'default',
                }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
