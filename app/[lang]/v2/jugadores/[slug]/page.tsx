import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { isLocale, type Lang } from '@/lib/i18n'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import { getUserPlan } from '@/lib/plans'
import SaasShell from '@/components/saas/SaasShell'
import LockedSection from '@/components/saas/LockedSection'
import IdentityCard from '@/components/player/IdentityCard'
import ProfileTabs from '@/components/player/ProfileTabs'
import RadarCard from '@/components/player/RadarCard'

type Tone = 'primary' | 'teal' | 'text'
function StatGroup({ title, items }: { title: string; items: Array<[string, string | number, Tone]> }) {
  const color = (t: Tone) => t === 'primary' ? 'var(--ts-primary)' : t === 'teal' ? 'var(--ts-teal)' : 'var(--ts-text)'
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {items.map(([label, value, tone], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 26, lineHeight: 1, color: color(tone), fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function V2PlayerPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: rawLang, slug } = await params
  if (!isLocale(rawLang)) notFound()
  const lang: Lang = rawLang

  const user = await currentUser()
  const userPlan = getUserPlan(user?.publicMetadata as Record<string, unknown> | undefined)

  const player =
    PLAYERS.find(p => slugify(p.name) === slug) ??
    PLAYERS.find(p => p.name.toLowerCase().includes('haaland')) ??
    PLAYERS[0]
  if (!player) notFound()

  const labels =
    lang === 'en'
      ? {
          breadcrumb: ['Players', player.club, player.name],
          cta: 'Share',
          perf: 'Performance profile',
          vsTop: 'vs. Top-5 Europe forwards',
          matchTitle: 'Stats per matchday',
          matchSub: `Last 10 matches · ${player.club} · 25/26`,
          seasonTitle: 'Stats per season',
          seasonSub: 'Full career · 7 seasons · 226 matches',
        }
      : {
          breadcrumb: ['Jugadores', player.club, player.name],
          cta: 'Compartir',
          perf: 'Perfil de rendimiento',
          vsTop: 'vs. delanteros Top-5 Europa',
          matchTitle: 'Estadísticas por jornada',
          matchSub: `Últimos 10 partidos · ${player.club} · Temporada 25/26`,
          seasonTitle: 'Estadísticas por temporada',
          seasonSub: 'Carrera completa · 7 temporadas · 226 partidos',
        }

  // Real performance radar derived from the player's season stats.
  const clampPct = (v: number) => Math.max(8, Math.min(100, Math.round(v)))
  const shots = player.shotsTotal ?? 0
  const conv = shots ? Math.round(((player.goles ?? 0) / shots) * 100) : 0
  const onTarget = shots ? Math.round(((player.shotsOn ?? 0) / shots) * 100) : 0
  const radarAxes = [
    { label: 'Goles',      value: player.goles ?? 0, pct: clampPct(((player.goles ?? 0) / 36) * 100) },
    { label: 'Asist.',     value: player.asist ?? 0, pct: clampPct(((player.asist ?? 0) / 22) * 100) },
    { label: 'Tiros',      value: shots, pct: clampPct((shots / 130) * 100) },
    { label: '% Puerta',   value: `${onTarget}%`, pct: clampPct(onTarget) },
    { label: 'Conversión', value: `${conv}%`, pct: clampPct(conv * 3) },
    { label: 'P. clave',   value: player.keyPasses ?? 0, pct: clampPct(((player.keyPasses ?? 0) / 100) * 100) },
  ]
  const radarStats = [
    { value: player.rating != null ? player.rating.toFixed(2) : '—', label: lang === 'en' ? 'Rating' : 'Nota', tone: 'primary' as const },
    { value: player.keyPasses ?? '—', label: lang === 'en' ? 'Key P.' : 'P. clave' },
    { value: `${conv}%`, label: 'Conv.', tone: 'teal' as const },
    { value: player.passAccuracy != null ? `${player.passAccuracy}%` : '—', label: lang === 'en' ? 'Pass %' : 'Pase %' },
  ]

  return (
    <SaasShell
      activeKey="players"
      breadcrumb={labels.breadcrumb}
      primaryCta={{ label: labels.cta, icon: 'share' }}
    >
      <IdentityCard player={player} />
      <ProfileTabs
        compareHref={`/${lang}/estadisticas/comparador?p1=${slug}`}
        compareLabel={lang === 'en' ? '↗ Compare this player' : '↗ Comparar este jugador'}
      />
      <div className="saas-profile-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 320px', gap: 18 }}>
        <LockedSection requiredPlan="pro" userPlan={userPlan}>
          <RadarCard
            title={labels.perf}
            subtitle={labels.vsTop}
            axes={radarAxes}
            stats={radarStats}
          />
        </LockedSection>

        <div id="seasons" style={{ display: 'flex', flexDirection: 'column', gap: 18, scrollMarginTop: 80 }}>
          <StatGroup title={lang === 'en' ? 'Attack' : 'Ataque'} items={[
            [lang === 'en' ? 'Goals' : 'Goles', player.goles ?? 0, 'primary'],
            [lang === 'en' ? 'Shots' : 'Tiros', player.shotsTotal ?? '—', 'text'],
            [lang === 'en' ? 'On target' : 'A puerta', player.shotsOn ?? '—', 'text'],
            [lang === 'en' ? 'Conversion' : 'Conversión', `${conv}%`, 'teal'],
          ]} />
          <StatGroup title={lang === 'en' ? 'Creation' : 'Creación'} items={[
            [lang === 'en' ? 'Assists' : 'Asist.', player.asist ?? 0, 'teal'],
            [lang === 'en' ? 'Key passes' : 'Pases clave', player.keyPasses ?? '—', 'primary'],
            [lang === 'en' ? 'Passes' : 'Pases', player.passes ?? '—', 'text'],
            [lang === 'en' ? 'Pass %' : '% Acierto', player.passAccuracy != null ? `${player.passAccuracy}%` : '—', 'text'],
          ]} />
          <StatGroup title={lang === 'en' ? 'Defending' : 'Defensa'} items={[
            [lang === 'en' ? 'Tackles' : 'Entradas', player.tacklesTotal ?? '—', 'teal'],
            [lang === 'en' ? 'Interceptions' : 'Intercep.', player.interceptions ?? '—', 'text'],
            [lang === 'en' ? 'Duels won' : 'Duelos gan.', player.duelsWon ?? '—', 'text'],
            [lang === 'en' ? 'Duel %' : '% Duelos', player.duelsTotal ? `${Math.round((player.duelsWon ?? 0) / player.duelsTotal * 100)}%` : '—', 'text'],
          ]} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatGroup title={lang === 'en' ? 'General' : 'General'} items={[
            [lang === 'en' ? 'Apps' : 'PJ', player.pj ?? 0, 'text'],
            [lang === 'en' ? 'Minutes' : 'Minutos', player.minutes ?? '—', 'text'],
            [lang === 'en' ? 'Rating' : 'Nota', player.rating != null ? player.rating.toFixed(2) : '—', 'primary'],
            [lang === 'en' ? 'Age' : 'Edad', player.age ?? '—', 'text'],
          ]} />
          <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>
              {lang === 'en' ? 'Profile' : 'Ficha'}
            </div>
            {[
              [lang === 'en' ? 'Club' : 'Club', player.club],
              [lang === 'en' ? 'League' : 'Liga', player.league],
              [lang === 'en' ? 'Position' : 'Posición', player.position ?? '—'],
              [lang === 'en' ? 'Nationality' : 'Nacionalidad', `${player.flag ?? ''} ${player.nationality ?? '—'}`.trim()],
              ...(player.marketValue ? [[lang === 'en' ? 'Market value' : 'Valor mercado', player.marketValue]] : []),
            ].map(([k, v], idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
                <span style={{ color: 'var(--ts-muted)' }}>{k}</span>
                <span style={{ color: 'var(--ts-text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SaasShell>
  )
}
