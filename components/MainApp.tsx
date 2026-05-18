'use client'

import { useState } from 'react'
import StatsPanel from './StatsPanel'
import MidfielderPanel from './MidfielderPanel'

const TABS = [
  { id: 's' as const, label: 'Goleadores',      color: '#f0c040', rgb: '240,192,64' },
  { id: 'a' as const, label: 'Asistentes',       color: '#00c8b0', rgb: '0,200,176'  },
  { id: 'c' as const, label: 'Centrocampistas',  color: '#a060ff', rgb: '160,96,255' },
]

export default function MainApp() {
  const [tab, setTab] = useState<'s' | 'a' | 'c'>('s')
  const activeTab = TABS.find(t => t.id === tab)!

  return (
    <main className="relative z-10 min-h-screen">

      {/* ── PAGE HEADER — hero section ── */}
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(8,16,32,.95) 0%, rgba(6,13,24,.88) 100%)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5">

          {/* Hero: título + meta */}
          <div className="flex items-start justify-between gap-8 pt-7 pb-4">
            <div className="flex flex-col gap-3">
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(58px, 6.5vw, 88px)',
                fontWeight: 800,
                color: '#eef4ff',
                letterSpacing: 1,
                lineHeight: 0.91,
                textTransform: 'uppercase',
              }}>
                Top <span style={{ color: activeTab.color }}>{activeTab.label}</span><br />
                <span style={{ color: '#eef4ff' }}>de </span>
                <span style={{ color: '#eef4ff' }}>Europa</span>
              </h1>
              {/* Meta pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#f0c040',
                  padding: '4px 10px', borderRadius: 20,
                  border: '1px solid rgba(240,192,64,.22)',
                  background: 'rgba(240,192,64,.06)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Temporada 2025/26</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#00c8b0',
                  padding: '4px 10px', borderRadius: 20,
                  border: '1px solid rgba(0,200,176,.2)',
                  background: 'rgba(0,200,176,.05)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Tiempo real</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#7888aa',
                  padding: '4px 10px', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,.08)',
                  background: 'rgba(255,255,255,.03)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>8 ligas activas</span>
              </div>
            </div>

            {/* Descripción derecha */}
            <p className="hidden md:block shrink-0" style={{
              fontSize: 12.5, color: '#6888aa', lineHeight: 1.6,
              borderLeft: '2px solid rgba(58,82,112,.6)', paddingLeft: 14,
              maxWidth: 240, marginTop: 4,
            }}>
              Las 5 grandes ligas + Portugal,<br />Turquía y Grecia. Estadísticas<br />actualizadas en tiempo real.
            </p>
          </div>

          {/* Tab bar — flush with bottom border */}
          <div className="flex items-end">
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="cursor-pointer transition-all duration-150 relative"
                  style={{
                    fontSize: 12.5,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '2px',
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    color: active ? t.color : '#4a5878',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                    padding: '9px 18px',
                    marginBottom: -1,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#8898b8' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#4a5878' }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ZONE — full-width bg, centered content ── */}
      <div className="w-full" style={{ background: 'transparent' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-5 pb-20">
          <div style={{ display: tab === 's' ? 'block' : 'none' }}>
            <StatsPanel tab="s" />
          </div>
          <div style={{ display: tab === 'a' ? 'block' : 'none' }}>
            <StatsPanel tab="a" />
          </div>
          <div style={{ display: tab === 'c' ? 'block' : 'none' }}>
            <MidfielderPanel />
          </div>
        </div>
      </div>

    </main>
  )
}
