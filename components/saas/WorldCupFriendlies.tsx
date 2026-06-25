import type { ApiFixture } from '@/lib/api-football'
import WinProbabilityBar from '@/components/saas/WinProbabilityBar'
import CrestImg from '@/components/saas/CrestImg'

// World Cup 2026 build-up section: international friendlies played between the
// end of the club season and the tournament kickoff. Server component — data is
// fetched with getFriendlies (1 h ISR) so new matches/scores appear on their own.

function Row({ f, lang }: { f: ApiFixture; lang: 'es' | 'en' }) {
  const played = f.fixture.status.short === 'FT' || f.fixture.status.short === 'AET' || f.fixture.status.short === 'PEN'
  const live = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(f.fixture.status.short)
  const d = new Date(f.fixture.date)
  const dateStr = d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })
  const timeStr = d.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'es-ES', { hour: '2-digit', minute: '2-digit' })
  const gh = f.goals.home, ga = f.goals.away
  const homeWin = played && gh != null && ga != null && gh > ga
  const awayWin = played && gh != null && ga != null && ga > gh
  const Team = ({ name, logo, win, align }: { name: string; logo: string; win: boolean; align: 'right' | 'left' }) => (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      {align === 'left' && logo && <CrestImg src={logo} alt={name} size={22} />}
      <span style={{ fontSize: 13, fontWeight: win ? 700 : 500, color: win ? 'var(--ts-text)' : 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      {align === 'right' && logo && <CrestImg src={logo} alt={name} size={22} />}
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--ts-divider)' }}>
      <span style={{ width: 52, flexShrink: 0, fontSize: 11, color: 'var(--ts-faint)', fontVariantNumeric: 'tabular-nums' }}>{dateStr}</span>
      <Team name={f.teams.home.name} logo={f.teams.home.logo} win={homeWin} align="right" />
      <span style={{
        flexShrink: 0, minWidth: 56, textAlign: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: 16, fontVariantNumeric: 'tabular-nums',
        color: live ? 'var(--ts-red, #c0392b)' : played ? 'var(--ts-text)' : 'var(--ts-muted)',
      }}>
        {played || live ? `${gh ?? 0} - ${ga ?? 0}` : timeStr}
      </span>
      <Team name={f.teams.away.name} logo={f.teams.away.logo} win={awayWin} align="left" />
    </div>
  )
}

export default function WorldCupFriendlies({ fixtures, lang }: { fixtures: ApiFixture[]; lang: 'es' | 'en' }) {
  if (!fixtures.length) return null
  const en = lang === 'en'
  const now = Date.now()
  const upcomingAll = fixtures.filter(f => f.fixture.timestamp * 1000 >= now && !['FT', 'AET', 'PEN'].includes(f.fixture.status.short))
  const playedAll = fixtures.filter(f => !upcomingAll.includes(f)).reverse() // newest first
  // Keep the section tight: nearest upcoming + most-recent results.
  const upcoming = upcomingAll.slice(0, 24)
  const played = playedAll.slice(0, 24)

  return (
    <section id="wc-friendlies" style={{ marginTop: 28, scrollMarginTop: 80 }}>
      <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--ts-text)', margin: '0 0 4px' }}>
        {en ? 'Build-up · Friendlies' : 'Previa · Amistosos'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: '0 0 14px' }}>
        {en
          ? 'International friendlies from the end of the club season to the 2026 World Cup kickoff. Updates automatically as matches are played.'
          : 'Amistosos internacionales desde el final de la temporada de clubes hasta el inicio del Mundial 2026. Se actualiza solo según se juegan los partidos.'}
      </p>

      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-teal)', margin: '12px 0 6px' }}>
            {en ? 'Upcoming' : 'Próximos'}
          </div>
          <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
            {upcoming.map(f => (
              <div key={f.fixture.id}>
                <Row f={f} lang={lang} />
                {/* Win-probability bar (only renders once /predictions has data) */}
                <WinProbabilityBar fixtureId={f.fixture.id} en={en} />
              </div>
            ))}
          </div>
        </>
      )}

      {played.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)', margin: '16px 0 6px' }}>
            {en ? 'Results' : 'Resultados'}
          </div>
          <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
            {played.map(f => <Row key={f.fixture.id} f={f} lang={lang} />)}
          </div>
        </>
      )}
    </section>
  )
}
