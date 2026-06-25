'use client'
import { useState } from 'react'
import Link from 'next/link'
import Avatar from '@/components/saas/Avatar'
import CrestImg from '@/components/saas/CrestImg'
import { slugify } from '@/lib/slugify'
import type { EuroCupData, EuroFixture } from '@/lib/euro-cups'

type Tab = 'resumen' | 'clasificacion' | 'calendario' | 'eliminatorias' | 'goleadores'

function Crest({ src, size = 18 }: { src: string; size?: number }) {
  return <CrestImg src={src} size={size} />
}

function fmtDate(iso: string, en: boolean): string {
  const d = new Date(iso)
  return d.toLocaleDateString(en ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString(en ? 'en-GB' : 'es-ES', { hour: '2-digit', minute: '2-digit' })
}

function FixtureRow({ f, en }: { f: EuroFixture; en: boolean }) {
  const played = f.hg != null && f.ag != null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontWeight: f.hWin ? 700 : 400, color: 'var(--ts-text)' }}>
        <span style={{ textAlign: 'right' }}>{f.home}</span><Crest src={f.homeCrest} />
      </div>
      <div style={{ minWidth: 64, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: played ? 'var(--ts-text)' : 'var(--ts-faint)', fontSize: played ? 14 : 11 }}>
        {played ? `${f.hg}–${f.ag}` : fmtDate(f.date, en)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: f.aWin ? 700 : 400, color: 'var(--ts-text)' }}>
        <Crest src={f.awayCrest} /><span>{f.away}</span>
      </div>
    </div>
  )
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 16, ...style }}>{children}</div>
)
const Heading = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>{children}</div>
)

export default function EuroCupClient({ data, lang }: { data: EuroCupData; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const [tab, setTab] = useState<Tab>('resumen')
  const T = (es: string, e: string) => (en ? e : es)

  const tabs: [Tab, string][] = [
    ['resumen', T('Resumen', 'Overview')],
    ['clasificacion', T('Clasificación', 'Standings')],
    ['calendario', T('Calendario', 'Calendar')],
    ['eliminatorias', T('Eliminatorias', 'Knockouts')],
    ['goleadores', T('Goleadores', 'Scorers')],
  ]

  const hasKnockout = data.knockout.some(k => k.fixtures.length)
  // Default the calendar to the next upcoming matchday.
  const nowTs = Date.now() / 1000
  const upcomingRound = data.leagueRounds.find(r => r.fixtures.some(f => f.ts > nowTs)) ?? data.leagueRounds[data.leagueRounds.length - 1]
  const [calRound, setCalRound] = useState<string>(upcomingRound?.round ?? data.leagueRounds[0]?.round ?? '')

  function rankColor(rank: number, total: number): string {
    if (total < 24) return 'transparent'
    if (rank <= 8) return 'var(--ts-teal)'        // direct to R16
    if (rank <= 24) return 'var(--ts-primary)'    // play-off spots
    return 'transparent'                          // eliminated
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: `4px solid ${data.color}`, paddingLeft: 14 }}>
        <h1 style={{ margin: 0, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 34, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-text)' }}>
          {data.name}
        </h1>
        <span style={{ fontSize: 12, color: 'var(--ts-muted)', alignSelf: 'flex-end', paddingBottom: 6 }}>2025/26</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map(([k, label]) => {
          if (k === 'eliminatorias' && !hasKnockout) return null
          const active = tab === k
          return (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700,
              border: `1px solid ${active ? data.color : 'var(--ts-border)'}`,
              background: active ? data.color : 'transparent', color: active ? '#fff' : 'var(--ts-muted)',
            }}>{label}</button>
          )
        })}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Card>
            <Heading>{T('Líderes de la fase liga', 'League phase leaders')}</Heading>
            {(data.standings[0]?.rows ?? []).slice(0, 8).map(r => (
              <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
                <span style={{ width: 20, color: 'var(--ts-faint)', fontVariantNumeric: 'tabular-nums' }}>{r.rank}</span>
                <Crest src={r.crest} /><span style={{ flex: 1, color: 'var(--ts-text)' }}>{r.team}</span>
                <span style={{ fontWeight: 700, color: 'var(--ts-text)' }}>{r.pts}</span>
              </div>
            ))}
          </Card>
          <Card>
            <Heading>{T('Máximos goleadores', 'Top scorers')}</Heading>
            {data.scorers.slice(0, 8).map((s, i) => (
              <Link key={s.apiId} href={`/${lang}/jugadores/${slugify(s.name)}-${s.apiId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13, textDecoration: 'none' }}>
                <span style={{ width: 18, color: 'var(--ts-faint)' }}>{i + 1}</span>
                <Avatar name={s.name} photo={s.photo} size={26} />
                <span style={{ flex: 1, color: 'var(--ts-text)' }}>{s.name}<span style={{ color: 'var(--ts-faint)', fontSize: 11 }}> · {s.club}</span></span>
                <span style={{ fontWeight: 700, color: 'var(--ts-primary)' }}>{s.value}</span>
              </Link>
            ))}
          </Card>
        </div>
      )}

      {/* CLASIFICACIÓN */}
      {tab === 'clasificacion' && data.standings.map((g, gi) => (
        <Card key={gi}>
          {data.standings.length > 1 && <Heading>{g.name}</Heading>}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--ts-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '6px 4px' }}>{T('Equipo', 'Team')}</th>
                  <th style={{ padding: '6px 4px' }}>PJ</th><th style={{ padding: '6px 4px' }}>G</th><th style={{ padding: '6px 4px' }}>E</th><th style={{ padding: '6px 4px' }}>P</th>
                  <th style={{ padding: '6px 4px' }}>DG</th><th style={{ padding: '6px 4px' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(r => (
                  <tr key={r.rank} style={{ borderTop: '1px solid var(--ts-hairline)' }}>
                    <td style={{ padding: '6px 4px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, background: rankColor(r.rank, g.rows.length), borderRadius: 2 }} />
                      <span style={{ paddingLeft: 8, color: 'var(--ts-faint)', fontVariantNumeric: 'tabular-nums' }}>{r.rank}</span>
                    </td>
                    <td style={{ padding: '6px 4px' }}><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Crest src={r.crest} /><span style={{ color: 'var(--ts-text)' }}>{r.team}</span></span></td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--ts-muted)' }}>{r.played}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--ts-muted)' }}>{r.w}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--ts-muted)' }}>{r.d}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--ts-muted)' }}>{r.l}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700, color: 'var(--ts-text)' }}>{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {g.rows.length >= 24 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--ts-muted)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--ts-teal)', borderRadius: 2, marginRight: 5 }} />{T('Directo a octavos', 'Direct to R16')}</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--ts-primary)', borderRadius: 2, marginRight: 5 }} />{T('Play-off', 'Play-off')}</span>
            </div>
          )}
        </Card>
      ))}

      {/* CALENDARIO */}
      {tab === 'calendario' && (
        <Card>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {data.leagueRounds.map(r => {
              const active = r.round === calRound
              return <button key={r.round} onClick={() => setCalRound(r.round)} style={{
                padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                border: `1px solid ${active ? data.color : 'var(--ts-border)'}`,
                background: active ? `${data.color}22` : 'transparent', color: active ? 'var(--ts-text)' : 'var(--ts-muted)',
              }}>{r.round.replace(/League Stage - /i, en ? 'MD ' : 'J')}</button>
            })}
          </div>
          {(data.leagueRounds.find(r => r.round === calRound)?.fixtures ?? []).map(f => <FixtureRow key={f.id} f={f} en={en} />)}
        </Card>
      )}

      {/* ELIMINATORIAS */}
      {tab === 'eliminatorias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {data.knockout.map(k => (
            <Card key={k.round}>
              <Heading>{k.round}</Heading>
              {k.fixtures.map(f => <FixtureRow key={f.id} f={f} en={en} />)}
            </Card>
          ))}
        </div>
      )}

      {/* GOLEADORES */}
      {tab === 'goleadores' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[[T('Goleadores', 'Top scorers'), data.scorers] as const, [T('Asistentes', 'Top assists'), data.assists] as const].map(([title, list], idx) => (
            <Card key={idx}>
              <Heading>{title}</Heading>
              {list.map((s, i) => (
                <Link key={s.apiId} href={`/${lang}/jugadores/${slugify(s.name)}-${s.apiId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13, textDecoration: 'none' }}>
                  <span style={{ width: 18, color: 'var(--ts-faint)' }}>{i + 1}</span>
                  <Avatar name={s.name} photo={s.photo} size={28} />
                  <span style={{ flex: 1, color: 'var(--ts-text)' }}>{s.name}<span style={{ color: 'var(--ts-faint)', fontSize: 11 }}> · {s.club}</span></span>
                  <span style={{ fontWeight: 700, color: idx === 0 ? 'var(--ts-primary)' : 'var(--ts-teal)' }}>{s.value}</span>
                </Link>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
