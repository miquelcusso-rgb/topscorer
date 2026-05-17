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
          background: 'linear-gradient(180deg,#0c0d18,#090a14)',
          borderBottom: '1px solid #1e2033',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5">

          {/* Compact title strip */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex flex-col">
              <span
                className="font-bold uppercase tracking-[1.5px]"
                style={{ fontSize: 12, color: '#9090a8', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Top Goleadores Europa
              </span>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 700, color: '#eeeef5', letterSpacing: 0.5, lineHeight: 1, marginTop: 4 }}>
                Top <span style={{ color: activeTab.color }}>{activeTab.label}</span>
                <span style={{ color: '#3a3d5c', fontWeight: 400 }}> — Europa</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                style={{ color: '#52526e', background: '#0d0e1c', border: '1px solid #1a1b2e', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}
              >
                2025/26
              </span>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#38c47a', boxShadow: '0 0 6px #38c47a' }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase' as const,
                  color: '#38c47a',
                  fontFamily: "'Barlow Condensed', sans-serif",
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
                  className="cursor-pointer transition-all duration-150 relative"
                  style={{
                    fontSize: 13,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 2,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    color: active ? t.color : '#3a3b52',
                    background: active ? `rgba(${t.rgb},.06)` : 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                    padding: '8px 18px',
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
      <div className="w-full" style={{ background: '#080910' }}>
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
