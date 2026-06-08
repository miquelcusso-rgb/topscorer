import type { PlayerData } from '@/types'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import SaasShell from '@/components/saas/SaasShell'
import IdentityCard from '@/components/player/IdentityCard'
import PlayerCareer from '@/components/player/PlayerCareer'
import MarketValueChart from '@/components/player/MarketValueChart'
import PlayerHonors from '@/components/player/PlayerHonors'
import PlayerRadar from '@/components/player/PlayerRadar'
import ScoutPanel from '@/components/player/ScoutPanel'
import BioPanel from '@/components/player/BioPanel'
import ProfileTabbed from '@/components/player/ProfileTabbed'
import RadarCard from '@/components/player/RadarCard'
import type { Plan } from '@/types'
import { shortName } from '@/lib/player-name'
import { iig, IIG_NAME, IIG_EXPLAINER } from '@/lib/iig'
import { playerAttributes, isGoalkeeper } from '@/lib/player-attributes'

type Tone = 'primary' | 'teal' | 'text'

// SofaScore-style "attribute overview": 4–5 labelled 0–100 bars derived from
// our per-90 / ratio stats. Compact, on-brand, sits beside the percentile radar.
function AttributeOverview({ player, en }: { player: PlayerData; en: boolean }) {
  const attrs = playerAttributes(player)
  if (attrs.length < 2) return null
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>
        {en ? 'Attribute overview' : 'Resumen de atributos'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {attrs.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 90, flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--ts-text)' }}>{en ? a.en : a.es}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--ts-card2)', overflow: 'hidden' }}>
              <div style={{ width: `${a.score}%`, height: '100%', borderRadius: 4, background: a.score >= 66 ? 'var(--ts-primary)' : a.score >= 40 ? 'var(--ts-teal)' : 'var(--ts-muted)' }} />
            </div>
            <span style={{ width: 26, flexShrink: 0, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{a.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatGroup({ title, items }: { title: string; items: Array<[string, string | number, Tone]> }) {
  const color = (t: Tone) => t === 'primary' ? 'var(--ts-primary)' : t === 'teal' ? 'var(--ts-teal)' : 'var(--ts-text)'
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 12, rowGap: 8 }}>
        {items.map(([label, value, tone], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 22, lineHeight: 1, color: color(tone), fontVariantNumeric: 'tabular-nums' }}>
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
  const gk = isGoalkeeper(player)
  // Show a real value when present, "—" only when genuinely null/undefined.
  const val = (v: number | string | null | undefined, suffix = ''): string | number =>
    v == null || v === '' ? '—' : (typeof v === 'number' ? `${v}${suffix}` : v)
  const pct = (v: number | null | undefined): string => (v == null ? '—' : `${Math.round(v)}%`)
  const dribblePct = player.dribblesAttempts ? Math.round(((player.dribblesSuccess ?? 0) / player.dribblesAttempts) * 100) : null
  const duelPct = player.duelsTotal ? Math.round(((player.duelsWon ?? 0) / player.duelsTotal) * 100) : null
  const concededPer90 = (player.goalsConceded != null && player.minutes) ? Math.round((player.goalsConceded / player.minutes) * 90 * 100) / 100 : null

  // Fallback radar (only when a player has no apiId → no percentile radar). Bars
  // are RELATIVE to the best in the same broad position within our dataset, so a
  // value isn't measured against an arbitrary fixed max. (apiId players get the
  // true percentile radar in PlayerRadar.)
  const broadPos = player.position
  const peers = PRIMARY_PLAYERS.filter(p => p.position === broadPos)
  const poolMax = (sel: (p: PlayerData) => number) => Math.max(1, ...peers.map(sel))
  const rel = (v: number, max: number) => clampPct((v / max) * 100)
  const maxG = poolMax(p => p.goles ?? 0), maxA = poolMax(p => p.asist ?? 0)
  const maxSh = poolMax(p => p.shotsTotal ?? 0), maxKp = poolMax(p => p.keyPasses ?? 0)
  const radarAxes = [
    { label: en ? 'Goals' : 'Goles',      value: player.goles ?? 0, pct: rel(player.goles ?? 0, maxG) },
    { label: en ? 'Assists' : 'Asist.',   value: player.asist ?? 0, pct: rel(player.asist ?? 0, maxA) },
    { label: en ? 'Shots' : 'Tiros',      value: shots, pct: rel(shots, maxSh) },
    { label: en ? 'On tgt' : '% Puerta',  value: `${onTarget}%`, pct: clampPct(onTarget) },
    { label: en ? 'Conv.' : 'Conversión', value: `${conv}%`, pct: clampPct(conv * 3) },
    { label: en ? 'Key P.' : 'P. clave',  value: player.keyPasses ?? 0, pct: rel(player.keyPasses ?? 0, maxKp) },
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
      <ProfileTabbed
        compareHref={`/${lang}/estadisticas/comparador?p1=${slug}`}
        compareLabel={en ? '↗ Compare this player' : '↗ Comparar este jugador'}
        en={en}
        resumen={<>
      <div className="saas-profile-grid" style={{ display: 'grid', gridTemplateColumns: '400px 1fr 320px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {player.apiId
            ? <PlayerRadar apiId={player.apiId} en={en} />
            : <RadarCard title={perf} subtitle={vsTop} axes={radarAxes} stats={radarStats} />}
          <AttributeOverview player={player} en={en} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {gk ? (
            <StatGroup title={en ? 'Goalkeeping' : 'Portería'} items={[
              [en ? 'Saves' : 'Paradas', val(player.saves), 'primary'],
              [en ? 'Conceded' : 'Encajados', val(player.goalsConceded), 'text'],
              [en ? 'Conceded/90' : 'Encaj./90', val(concededPer90), 'teal'],
              [en ? 'Pen. saved' : 'Pen. parados', val(player.penaltySaved), 'text'],
            ]} />
          ) : (
            <StatGroup title={en ? 'Attack' : 'Ataque'} items={[
              [en ? 'Goals' : 'Goles', val(player.goles), 'primary'],
              [en ? 'Shots' : 'Tiros', val(player.shotsTotal), 'text'],
              [en ? 'On target' : 'A puerta', val(player.shotsOn), 'text'],
              [en ? 'Conversion' : 'Conversión', shots ? `${conv}%` : '—', 'teal'],
            ]} />
          )}
          <StatGroup title={en ? 'Creation' : 'Creación'} items={[
            [en ? 'Assists' : 'Asist.', val(player.asist), 'teal'],
            [en ? 'Key passes' : 'Pases clave', val(player.keyPasses ?? player.passesKey), 'primary'],
            [en ? 'Passes' : 'Pases', val(player.passes), 'text'],
            [en ? 'Pass %' : '% Acierto', pct(player.passAccuracy ?? player.passesAccuracy), 'text'],
          ]} />
          <StatGroup title={en ? 'Defending' : 'Defensa'} items={[
            [en ? 'Tackles' : 'Entradas', val(player.tacklesTotal), 'teal'],
            [en ? 'Interceptions' : 'Intercep.', val(player.interceptions), 'text'],
            [en ? 'Duels won' : 'Duelos gan.', val(player.duelsWon), 'text'],
            [en ? 'Duel %' : '% Duelos', duelPct == null ? '—' : `${duelPct}%`, 'text'],
          ]} />
          {!gk && (player.dribblesAttempts != null || player.foulsDrawn != null) && (
            <StatGroup title={en ? 'Dribbling & discipline' : 'Regate y disciplina'} items={[
              [en ? 'Dribbles' : 'Regates', val(player.dribblesSuccess), 'teal'],
              [en ? 'Dribble %' : '% Regate', dribblePct == null ? '—' : `${dribblePct}%`, 'text'],
              [en ? 'Fouls drawn' : 'Faltas recib.', val(player.foulsDrawn), 'text'],
              [en ? 'Yellow' : 'Amarillas', val(player.yellowCards), 'text'],
            ]} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StatGroup title={en ? 'General' : 'General'} items={[
            [en ? 'Apps' : 'PJ', val(player.pj), 'text'],
            [en ? 'Minutes' : 'Minutos', val(player.minutes), 'text'],
            [en ? 'Rating' : 'Nota', player.rating != null ? player.rating.toFixed(2) : '—', 'primary'],
            [en ? 'Starts' : 'Titular', val(player.lineups), 'text'],
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

      <ScoutPanel name={player.fullName || player.name} en={en} releaseClause={player.releaseClause} />

      <BioPanel name={player.fullName || player.name} lang={lang} />
        </>}
        historico={<>
          <MarketValueChart name={player.fullName || player.name} en={en} />
          <PlayerHonors apiId={player.apiId} en={en} />
          <PlayerCareer apiId={player.apiId} seasons={seasons} en={en} />
        </>}
      />
    </SaasShell>
  )
}
