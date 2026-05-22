'use client'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ShareButton() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const url = typeof window !== 'undefined' ? window.location.href : 'https://www.top-scorers.com'
  const title = 'TopScorers — Estadísticas de Fútbol Europeo'
  const text = 'Consulta los mejores goleadores y asistentes de las ligas europeas en tiempo real.'

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, text, url }) } catch {}
      return
    }
    setOpen(o => !o)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1800)
  }

  const gold = '#f0c040'
  const border = isLight ? 'rgba(240,192,64,.5)' : 'rgba(240,192,64,.25)'
  const bg = isLight ? 'rgba(240,192,64,.18)' : 'rgba(240,192,64,.12)'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleShare}
        aria-label="Compartir"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: bg, border: `1.5px solid ${border}`,
          color: gold, borderRadius: 8, padding: '5px 10px',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          transition: 'all 150ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = isLight ? 'rgba(240,192,64,.28)' : 'rgba(240,192,64,.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = bg)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span style={{ display: 'none' }} className="share-label">Compartir</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 100,
          background: isLight ? '#fff' : '#0d1829',
          border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,.1)'}`,
          borderRadius: 10, padding: '6px', minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        }}>
          <button onClick={copyLink} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            background: 'none', border: 'none', color: isLight ? '#1a2a40' : '#eef4ff',
            padding: '8px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 13,
          }}>
            {copied
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiado!</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar enlace</>}
          </button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: isLight ? '#1a2a40' : '#eef4ff', padding: '8px 12px',
            borderRadius: 7, textDecoration: 'none', fontSize: 13,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Compartir en X
          </a>
        </div>
      )}
    </div>
  )
}
