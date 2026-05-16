'use client'

import { useState } from 'react'
import StatsPanel from './StatsPanel'

export default function MainApp() {
  const [tab, setTab] = useState<'s' | 'a'>('s')

  return (
    <main className="relative z-10 max-w-[1480px] mx-auto px-3 py-5 pb-16">

      {/* Header */}
      <div className="pl-4 mb-4" style={{ borderLeft: '4px solid #f0c040' }}>
        <div className="text-[9.5px] font-bold tracking-[3px] uppercase" style={{ color: '#f0c040' }}>
          Temporada 2024-25 &amp; 2025-26 · Liga doméstica
        </div>
        <h1
          className="leading-none mt-0.5"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(24px, 4.5vw, 50px)', letterSpacing: 2 }}
        >
          TOP 25 <span style={{ color: '#f0c040' }}>GOLEADORES</span> &amp; ASISTENTES
        </h1>
        <div className="text-[11.5px] mt-1" style={{ color: '#5a5a7a' }}>
          Siempre 25 posiciones · Filtra por edad y liga · Añade jugadores manualmente · Hover para más info
        </div>
      </div>

      {/* Notice */}
      <div
        className="px-4 py-2 mb-3 text-[11.5px] leading-relaxed rounded-sm"
        style={{
          background: 'rgba(224,90,48,.07)',
          border: '1px solid rgba(224,90,48,.22)',
          borderLeft: '3px solid #e05a30',
          color: 'rgba(229,229,242,.6)',
        }}
      >
        <strong style={{ color: '#e05a30' }}>⚠ Datos:</strong> 25-26 de{' '}
        <strong style={{ color: 'rgba(229,229,242,.65)' }}>europeangoldenshoe.com</strong> + FotMob (mayo 2026).
        24-25 de artículos fin de temporada. 23-24 compilado.{' '}
        <span className="inline-flex items-center gap-1 ml-2">
          <span className="px-1.5 py-px text-[9px] font-bold rounded-sm" style={{ color: '#38c47a', background: 'rgba(56,196,122,.14)', border: '1px solid rgba(56,196,122,.28)' }}>Live</span>{' '}
          fuente directa
        </span>
        <span className="inline-flex items-center gap-1 ml-2">
          <span className="px-1.5 py-px text-[9px] font-bold rounded-sm" style={{ color: '#4a9eff', background: 'rgba(74,158,255,.12)', border: '1px solid rgba(74,158,255,.22)' }}>Búsqueda</span>{' '}
          artículos
        </span>
        <span className="inline-flex items-center gap-1 ml-2">
          <span className="px-1.5 py-px text-[9px] font-bold rounded-sm" style={{ color: '#e05a30', background: 'rgba(224,90,48,.10)', border: '1px solid rgba(224,90,48,.22)' }}>Estimado</span>{' '}
          datos parciales
        </span>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '2px solid #1e1e34' }}>
        {[
          { id: 's' as const, label: '⚽ Goleadores' },
          { id: 'a' as const, label: '🎯 Asistentes' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2.5 text-[11.5px] font-bold tracking-[1.5px] uppercase transition-all duration-200 cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #f0c040' : '2px solid transparent',
              marginBottom: -2,
              color: tab === t.id ? '#f0c040' : '#5a5a7a',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels — keep both mounted so state persists */}
      <div style={{ display: tab === 's' ? 'block' : 'none' }}>
        <StatsPanel tab="s" />
      </div>
      <div style={{ display: tab === 'a' ? 'block' : 'none' }}>
        <StatsPanel tab="a" />
      </div>
    </main>
  )
}
