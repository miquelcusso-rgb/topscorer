'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'
import { useTheme } from '@/contexts/ThemeContext'
import StatsPanel from './StatsPanel'
import MidfielderPanel from './MidfielderPanel'
import PositionPanel from './PositionPanel'
import type { PlayerData } from '@/types'

const TABS = [
  { id: 's' as const, label: 'Goleadores',      color: '#f0c040', rgb: '240,192,64'  },
  { id: 'a' as const, label: 'Asistentes',       color: '#00c8b0', rgb: '0,200,176'   },
  { id: 'c' as const, label: 'Centrocampistas',  color: '#a060ff', rgb: '160,96,255'  },
  { id: 'd' as const, label: 'Defensas',         color: '#4090ff', rgb: '64,144,255'  },
  { id: 'g' as const, label: 'Porteros',         color: '#e05a30', rgb: '224,90,48'   },
]

function ProGateCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-16 rounded"
      style={{
        background: 'rgba(6,7,14,.9)',
        border: '1px solid rgba(240,192,64,.18)',
        borderTop: '2px solid rgba(240,192,64,.35)',
      }}
    >
      <span style={{ fontSize: 36 }}>⚡</span>
      <div className="text-center">
        <div
          className="font-bold mb-2"
          style={{ fontSize: 18, color: '#d8d8ec', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#52526e' }}>{description}</div>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 font-bold rounded-sm transition-all duration-150 cursor-pointer"
        style={{ fontSize: 13, padding: '9px 24px', background: '#f0c040', color: '#05060c', boxShadow: '0 2px 16px rgba(240,192,64,.25)' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(240,192,64,.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(240,192,64,.25)' }}
      >
        Hazte Pro →
      </Link>
    </div>
  )
}

export default function MainApp({ initialPlayers }: { initialPlayers?: PlayerData[] }) {
  const [tab, setTab] = useState<'s' | 'a' | 'c' | 'd' | 'g'>('s')
  const { user, isLoaded } = useUser()
  const proUser = isLoaded ? isPro(user?.publicMetadata as Record<string, unknown>) : false
  const activeTab = TABS.find(t => t.id === tab)!
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Hero siempre sobre fondo oscuro (gris en claro, oscuro en dark)
  const heroTitleColor = '#eef4ff'
  const heroMidText    = isLight ? 'rgba(195,210,235,.72)' : '#6888aa'
  const heroBg   = isLight
    ? 'linear-gradient(180deg, rgba(42,56,88,.84) 0%, rgba(32,46,78,.80) 100%)'
    : 'linear-gradient(180deg, rgba(8,16,32,.95) 0%, rgba(6,13,24,.88) 100%)'
  const heroBorder = 'rgba(255,255,255,.07)'

  // Colores adaptativos para zonas claras (tabla, etc.)
  const dimBorder = isLight ? 'rgba(58,82,112,.2)' : 'rgba(255,255,255,.08)'
  const dimBg    = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.03)'

  return (
    <main className="relative z-10 min-h-screen">

      {/* ── PAGE HEADER — hero section ── */}
      <div
        className="w-full page-hero"
        style={{
          background: heroBg,
          borderBottom: `1px solid ${heroBorder}`,
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
                color: heroTitleColor,
                letterSpacing: 1,
                lineHeight: 0.91,
                textTransform: 'uppercase',
              }}>
                Top <span style={{ color: activeTab.color }}>{activeTab.label}</span><br />
                <span style={{ color: heroMidText }}>de </span>
                <span style={{ color: heroTitleColor }}>Europa</span>
              </h1>
              {/* Meta pills — always on dark hero bg */}
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#f0c040',
                  padding: '4px 10px', borderRadius: 20,
                  border: 'rgba(240,192,64,.22) solid 1px',
                  background: 'rgba(240,192,64,.07)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Temporada 2025/26</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#00c8b0',
                  padding: '4px 10px', borderRadius: 20,
                  border: 'rgba(0,200,176,.2) solid 1px',
                  background: 'rgba(0,200,176,.06)',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Tiempo real</span>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#7888aa',
                  padding: '4px 10px', borderRadius: 20,
                  border: `1px solid ${dimBorder}`,
                  background: dimBg,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>8 ligas activas</span>
              </div>
            </div>

            {/* Descripción derecha — always on dark hero bg */}
            <p className="hidden md:block shrink-0" style={{
              fontSize: 12.5, color: heroMidText, lineHeight: 1.6,
              borderLeft: 'rgba(100,120,160,.45) solid 2px', paddingLeft: 14,
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
            <StatsPanel tab="s" initialPlayers={initialPlayers} />
          </div>
          <div style={{ display: tab === 'a' ? 'block' : 'none' }}>
            <StatsPanel tab="a" initialPlayers={initialPlayers} />
          </div>
          <div style={{ display: tab === 'c' ? 'block' : 'none' }}>
            {proUser
              ? <PositionPanel position="MF" accentColor="#a060ff" proUser={proUser} />
              : <ProGateCard title="Datos de Centrocampistas — Solo Pro" description="Accede a estadísticas de centrocampistas de las 8 principales ligas europeas." />
            }
          </div>
          <div style={{ display: tab === 'd' ? 'block' : 'none' }}>
            {proUser
              ? <PositionPanel position="DF" accentColor="#4090ff" proUser={proUser} />
              : <ProGateCard title="Datos de Defensas — Solo Pro" description="Accede a estadísticas de defensas de las 8 principales ligas europeas." />
            }
          </div>
          <div style={{ display: tab === 'g' ? 'block' : 'none' }}>
            {proUser
              ? <PositionPanel position="GK" accentColor="#e05a30" proUser={proUser} />
              : <ProGateCard title="Datos de Porteros — Solo Pro" description="Accede a estadísticas de porteros de las 8 principales ligas europeas." />
            }
          </div>
        </div>
      </div>

    </main>
  )
}
