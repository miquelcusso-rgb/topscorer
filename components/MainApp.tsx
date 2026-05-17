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

      {/* ── PAGE HEADER — full-width bg, centered content ── */}
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(180deg,#07081a,#050610)',
          borderBottom: '1px solid #151626',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5">

          {/* Title row */}
          <div className="flex items-end justify-between pt-6 pb-0">
            <div className="pb-5">
              <div
                className="font-bold tracking-[3px] uppercase mb-2"
                style={{ fontSize: 10, color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Europa &nbsp;·&nbsp; Top 25 &nbsp;·&nbsp; Temporada 2025/26
              </div>
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 30,
                  fontWeight: 700,
                  color: '#e8e8f8',
                  letterSpacing: 0.5,
                  lineHeight: 1,
                }}
              >
                Top{' '}
                <span style={{ color: activeTab.color }}>{activeTab.label}</span>
                <span style={{ color: '#52526e', fontWeight: 400 }}>{' — Europa'}</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 pb-5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: '#38c47a', boxShadow: '0 0 7px #38c47a' }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase' as const,
                  color: '#38c47a',
                }}
              >
                Live
              </span>
            </div>
          </div>

          {/* Tab bar — flush with bottom border */}
          <div className="flex items-end">
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    fontSize: 11,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 2,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    color: active ? t.color : '#3a3b52',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                    padding: '9px 22px',
                    marginBottom: -1,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#60608a' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#3a3b52' }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ZONE — full-width bg, centered content ── */}
      <div className="w-full" style={{ background: '#0b0c1a' }}>
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
