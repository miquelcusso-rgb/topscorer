import Link from 'next/link'
import type { Lang } from '@/lib/i18n'
import {
  getStandings, getTeamSeasonStats, getTeamFixtures, getTransfersByTeam, getLeagueInjuries,
  type ApiFixture,
} from '@/lib/api-football'

// Rich, Transfermarkt-style team dossier rendered server-side (ISR-cached via the
// page + each source's own cache). Everything is defensive: any missing source
// simply omits its card, so the page never errors. Brand --ts-* tokens only.
// Sources: api-football standings / team statistics / fixtures / transfers /
// injuries. Author: Furiosa Studio.

const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18 }
const eyebrow: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 12 }
const sub: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }

function FormBadges({ form }: { form: string }) {
  const last = form.slice(-5).split('')
  const color = (c: string) => c === 'W' ? '#16a34a' : c === 'D' ? '#a3a30f' : c === 'L' ? '#dc2626' : 'var(--ts-faint)'
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {last.map((c, i) => (
        <span key={i} style={{ width: 18, height: 18, borderRadius: 4, background: color(c), color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c}</span>
      ))}
    </div>
  )
}

function KV({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, lineHeight: 1, color: accent ?? 'var(--ts-text)' }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 3 }}>{label}</div>
    </div>
  )
}

function fixtureRow(f: ApiFixture, teamId: number, lang: Lang): React.ReactNode {
  const home = f.teams.home, away = f.teams.away
  const opp = home.id === teamId ? away : home
  const isHome = home.id === teamId
  const played = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
  const gh = f.goals.home, ga = f.goals.away
  const my = isHome ? gh : ga, their = isHome ? ga : gh
  const res = played && my != null && their != null ? (my > their ? 'W' : my < their ? 'L' : 'D') : null
  const resColor = res === 'W' ? '#16a34a' : res === 'L' ? '#dc2626' : res === 'D' ? '#a3a30f' : 'var(--ts-faint)'
  const date = new Date(f.fixture.date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })
  return (
    <div key={f.fixture.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
      <span style={{ width: 42, flexShrink: 0, fontSize: 11, color: 'var(--ts-faint)' }}>{date}</span>
      <span style={{ width: 14, flexShrink: 0, fontSize: 10, color: 'var(--ts-muted)' }}>{isHome ? (lang === 'en' ? 'H' : 'L') : (lang === 'en' ? 'A' : 'V')}</span>
      {opp.logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={opp.logo} alt="" width={18} height={18} loading="lazy" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} /> : <span style={{ width: 18 }} />}
      <span style={{ flex: 1, minWidth: 0, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opp.name}</span>
      {played && my != null && their != null
        ? <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{my}-{their}</span>
            <span style={{ width: 16, height: 16, borderRadius: 3, background: resColor, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{res}</span>
          </span>
        : <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--ts-faint)' }}>{new Date(f.fixture.date).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
    </div>
  )
}

export default async function TeamEnrichment({
  teamId, leagueId, teamName, lang,
}: { teamId: number; leagueId?: number; teamName: string; lang: Lang }) {
  const en = lang === 'en'
  const [standings, stats, fixtures, transfers, injuriesGroups] = await Promise.all([
    leagueId ? getStandings(leagueId) : Promise.resolve([]),
    leagueId ? getTeamSeasonStats(teamId, leagueId) : Promise.resolve(null),
    getTeamFixtures(teamId),
    getTransfersByTeam(teamId),
    leagueId ? getLeagueInjuries(leagueId) : Promise.resolve([]),
  ])

  const row = standings.find(s => s.team.id === teamId)
  const recent = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)).sort((a, b) => b.fixture.timestamp - a.fixture.timestamp).slice(0, 6)
  const upcoming = fixtures.filter(f => ['NS', 'TBD', 'PST'].includes(f.fixture.status.short)).sort((a, b) => a.fixture.timestamp - b.fixture.timestamp).slice(0, 6)

  // Transfers: dedupe per player, keep the most recent move involving this team.
  const seenIn = new Set<number>(), seenOut = new Set<number>()
  const arrivals: { name: string; photo: string; from: string; type: string; date: string }[] = []
  const departures: { name: string; photo: string; to: string; type: string; date: string }[] = []
  for (const t of transfers) {
    const moves = [...t.transfers].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    for (const m of moves) {
      if (m.teams.in?.id === teamId && !seenIn.has(t.player.id)) { seenIn.add(t.player.id); arrivals.push({ name: t.player.name, photo: t.player.photo, from: m.teams.out?.name ?? '', type: m.type, date: m.date }); break }
      if (m.teams.out?.id === teamId && !seenOut.has(t.player.id)) { seenOut.add(t.player.id); departures.push({ name: t.player.name, photo: t.player.photo, to: m.teams.in?.name ?? '', type: m.type, date: m.date }); break }
    }
  }
  arrivals.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  departures.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const arr = arrivals.slice(0, 8), dep = departures.slice(0, 8)

  const injured = injuriesGroups.find(g => g.teamId === teamId)?.players ?? []

  const hasSeason = row || stats
  const hasFixtures = recent.length || upcoming.length
  const hasTransfers = arr.length || dep.length
  if (!hasSeason && !hasFixtures && !hasTransfers && !injured.length) return null

  return (
    <>
      {/* Season: standing + statistics */}
      {hasSeason && (
        <section style={card}>
          <div style={eyebrow}>{en ? 'This season' : 'Temporada'} · {stats?.leagueName || row?.team.name ? (stats?.leagueName ?? '') : ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {row ? <KV label={en ? 'Position' : 'Posición'} value={`${row.rank}º`} accent="var(--ts-primary)" /> : null}
            {row ? <KV label={en ? 'Points' : 'Puntos'} value={String(row.points)} /> : null}
            {row ? <KV label={en ? 'Played' : 'PJ'} value={String(row.all.played)} /> : null}
            {row ? <KV label="V-E-D" value={`${row.all.win}-${row.all.draw}-${row.all.lose}`} /> : null}
            {row ? <KV label={en ? 'Goals' : 'Goles'} value={`${row.all.goals.for}:${row.all.goals.against}`} /> : null}
            {stats ? <KV label={en ? 'Clean sheets' : 'Porterías 0'} value={String(stats.cleanSheet.total)} /> : null}
            {(row?.form || stats?.form) ? (
              <div>
                <div style={{ marginBottom: 5 }}><FormBadges form={row?.form || stats?.form || ''} /></div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{en ? 'Form' : 'Forma'}</div>
              </div>
            ) : null}
          </div>
          {stats ? (
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14, fontSize: 12.5, color: 'var(--ts-muted)' }}>
              {stats.lineups[0] ? <span>{en ? 'Formation' : 'Formación'}: <strong style={{ color: 'var(--ts-text)' }}>{stats.lineups[0].formation}</strong></span> : null}
              {stats.biggestWinHome || stats.biggestWinAway ? <span>{en ? 'Biggest win' : 'Mayor victoria'}: <strong style={{ color: 'var(--ts-text)' }}>{stats.biggestWinHome || stats.biggestWinAway}</strong></span> : null}
              <span>{en ? 'Goals/game' : 'Goles/partido'}: <strong style={{ color: 'var(--ts-text)' }}>{stats.goalsForAvg.total}</strong></span>
              <span>{en ? 'Conceded/game' : 'Encajados/partido'}: <strong style={{ color: 'var(--ts-text)' }}>{stats.goalsAgainstAvg.total}</strong></span>
            </div>
          ) : null}
        </section>
      )}

      {/* Fixtures */}
      {hasFixtures && (
        <section style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {upcoming.length ? (
            <div>
              <div style={sub}>{en ? 'Upcoming' : 'Próximos partidos'}</div>
              {upcoming.map(f => fixtureRow(f, teamId, lang))}
            </div>
          ) : null}
          {recent.length ? (
            <div>
              <div style={sub}>{en ? 'Recent results' : 'Últimos resultados'}</div>
              {recent.map(f => fixtureRow(f, teamId, lang))}
            </div>
          ) : null}
        </section>
      )}

      {/* Transfers */}
      {hasTransfers && (
        <section style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {arr.length ? (
            <div>
              <div style={sub}>{en ? 'Arrivals' : 'Altas'} ↓</div>
              {arr.map((p, i) => (
                <div key={p.name + i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
                  {p.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt="" width={26} height={26} loading="lazy" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--ts-card2)' }} /> : null}
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ts-text)' }}>{p.name}<span style={{ color: 'var(--ts-faint)' }}> · {p.from}</span></span>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'var(--ts-teal)' }}>{p.type === 'N/A' ? '—' : p.type}</span>
                </div>
              ))}
            </div>
          ) : null}
          {dep.length ? (
            <div>
              <div style={sub}>{en ? 'Departures' : 'Bajas'} ↑</div>
              {dep.map((p, i) => (
                <div key={p.name + i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
                  {p.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt="" width={26} height={26} loading="lazy" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--ts-card2)' }} /> : null}
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ts-text)' }}>{p.name}<span style={{ color: 'var(--ts-faint)' }}> · {p.to}</span></span>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'var(--ts-muted)' }}>{p.type === 'N/A' ? '—' : p.type}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* Injuries */}
      {injured.length ? (
        <section style={card}>
          <div style={eyebrow}>{en ? 'Injuries & absences' : 'Lesionados y bajas'}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {injured.slice(0, 12).map((p, i) => (
              <div key={p.playerId + '' + i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < Math.min(injured.length, 12) - 1 ? '1px solid var(--ts-hairline)' : 'none', fontSize: 13 }}>
                {p.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt="" width={26} height={26} loading="lazy" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--ts-card2)' }} /> : null}
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ts-text)' }}>{p.player}</span>
                <span style={{ flexShrink: 0, fontSize: 11.5, color: 'var(--ts-red, #dc2626)' }}>{p.reason || p.type}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
