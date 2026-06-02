import type { PlayerData } from '@/types'
import SaasShell from '@/components/saas/SaasShell'
import IdentityCard from '@/components/player/IdentityCard'
import PlayerCareer from '@/components/player/PlayerCareer'
import MarketValueChart from '@/components/player/MarketValueChart'
import ProfileTabs from '@/components/player/ProfileTabs'
import RadarCard from '@/components/player/RadarCard'
import type { Plan } from '@/types'
import { shortName } from '@/lib/player-name'
import { iig, IIG_NAME, IIG_EXPLAINER } from '@/lib/iig'

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

interface Props {
  player: PlayerData
  lang: 'es' | 'en'
  slug: string
  userPlan: Plan
  /** All season rows for this player (newest first), for the history table. */
  seasons?: PlayerData[]
}


// Canonical SaaS player profile — real season stats from the static dataset
// (no live per-player API call → free + fast). Used by /jugadores/[slug].
export default function PlayerProfile({ player, lang, slug, userPlan, seasons = [] }: Props) {
  const en = lang === 'en'
  const breadcrumb = en ? ['Players', player.club, shortName(player)] : ['Jugadores', player.club, shortName(player)]
  const cta = en ? 'Share' : 'Compartir'
  const perf = en ? 'Performance profile' : 'Perfil de rendimiento'
  const vsTop = en ? 'vs. league peers' : 'vs. su posición en la liga'

  const clampPct = (v: number) => Math.max(8, Math.min(100, Math.round(v)))
  const shots = player.shotsTotal ?? 0
  const conv = shots ? Math.round(((player.goles ?? 0) / shots) * 100) : 0
  const onTarget = shots ? Math.round(((player.shotsOn ?? 0) / shots) * 100) : 0

  const radarAxes = [
    { label: en ? 'Goals' : 'Goles',      value: player.goles ?? 0, pct: clampPct(((player.goles ?? 0) / 36) * 100) },
    { label: en ? 'Assists' : 'Asist.',   value: player.asist ?? 0, pct: clampPct(((player.asist ?? 0) / 22) * 100) },
    { label: en ? 'Shots' : 'Tiros',      value: shots, pct: clampPct((shots / 130) * 100) },
    { label: en ? 'On tgt' : '% Puerta',  value: `${onTarget}%`, pct: clampPct(onTarget) },
    { label: en ? 'Conv.' : 'Conversión', value: `${conv}%`, pct: clampPct(conv * 3) },
    { label: en ? 'Key P.' : 'P. clave',  value: player.keyPasses ?? 0, pct: clampPct(((player.keyPasses ?? 0) / 100) * 100) },
  ]
  const radarStats = [
    { value: player.rating != null ? player.rating.toFixed(2) : '—', label: en ? 'Rating' : 'Nota', tone: 'primary' as const },
    { value: player.keyPasses ?? '—', label: en ? 'Key P.' : 'P. clave' },
    { value: `${conv}%`, label: 'Conv.', tone: 'teal' as const },
    { value: player.passAccuracy != null ? `${player.passAccuracy}%` : '—', label: en ? 'Pass %' : 'Pase %' },
  ]

  return (
    <SaasShell activeKey="players" breadcrumb={breadcrumb} primaryCta={{ label: cta, icon: 'share' }} plan={userPlan}>
      <IdentityCard
        player={player}
        iigBadge={{ value: iig(player), title: `${IIG_NAME[lang]} · ${IIG_EXPLAINER[lang]}` }}
      />
      <ProfileTabs
        compareHref={`/${lang}/estadisticas/comparador?p1=${slug}`}
        compareLabel={en ? '↗ Compare this player' : '↗ Comparar este jugador'}
      />
      <div className="saas-profile-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 320px', gap: 18 }}>
        <RadarCard title={perf} subtitle={vsTop} axes={radarAxes} stats={radarStats} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatGroup title={en ? 'Attack' : 'Ataque'} items={[
            [en ? 'Goals' : 'Goles', player.goles ?? 0, 'primary'],
            [en ? 'Shots' : 'Tiros', player.shotsTotal ?? '—', 'text'],
            [en ? 'On target' : 'A puerta', player.shotsOn ?? '—', 'text'],
            [en ? 'Conversion' : 'Conversión', `${conv}%`, 'teal'],
          ]} />
          <StatGroup title={en ? 'Creation' : 'Creación'} items={[
            [en ? 'Assists' : 'Asist.', player.asist ?? 0, 'teal'],
            [en ? 'Key passes' : 'Pases clave', player.keyPasses ?? '—', 'primary'],
            [en ? 'Passes' : 'Pases', player.passes ?? '—', 'text'],
            [en ? 'Pass %' : '% Acierto', player.passAccuracy != null ? `${player.passAccuracy}%` : '—', 'text'],
          ]} />
          <StatGroup title={en ? 'Defending' : 'Defensa'} items={[
            [en ? 'Tackles' : 'Entradas', player.tacklesTotal ?? '—', 'teal'],
            [en ? 'Interceptions' : 'Intercep.', player.interceptions ?? '—', 'text'],
            [en ? 'Duels won' : 'Duelos gan.', player.duelsWon ?? '—', 'text'],
            [en ? 'Duel %' : '% Duelos', player.duelsTotal ? `${Math.round((player.duelsWon ?? 0) / player.duelsTotal * 100)}%` : '—', 'text'],
          ]} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatGroup title={en ? 'General' : 'General'} items={[
            [en ? 'Apps' : 'PJ', player.pj ?? 0, 'text'],
            [en ? 'Minutes' : 'Minutos', player.minutes ?? '—', 'text'],
            [en ? 'Rating' : 'Nota', player.rating != null ? player.rating.toFixed(2) : '—', 'primary'],
            [en ? 'Age' : 'Edad', player.age ?? '—', 'text'],
          ]} />
          <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>
              {en ? 'Profile' : 'Ficha'}
            </div>
            {([
              [en ? 'Club' : 'Club', player.club],
              [en ? 'League' : 'Liga', player.league],
              [en ? 'Position' : 'Posición', player.position ?? '—'],
              [en ? 'Nationality' : 'Nacionalidad', `${player.flag ?? ''} ${player.nationality ?? '—'}`.trim()],
              ...(player.marketValue ? [[en ? 'Market value' : 'Valor mercado', player.marketValue]] : []),
            ] as Array<[string, string]>).map(([k, v], idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--ts-hairline)', fontSize: 13 }}>
                <span style={{ color: 'var(--ts-muted)' }}>{k}</span>
                <span style={{ color: 'var(--ts-text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MarketValueChart name={player.fullName || player.name} en={en} />

      <PlayerCareer apiId={player.apiId} seasons={seasons} en={en} />
    </SaasShell>
  )
}
