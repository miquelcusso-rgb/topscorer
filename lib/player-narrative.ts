import type { PlayerData } from '@/types'
import { CURRENT_SEASON_LONG, seasonLong } from '@/lib/season'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { iig } from '@/lib/iig'

// Generates a data-derived prose narrative for a player fiche from the stats we
// already hold in the static dataset. NO external calls → free on the Vercel
// free tier and fully server-rendered (SEO-visible, unlike the client-fetched
// Wikipedia BioPanel). Every sentence is gated on the underlying field actually
// being present, so a sparse player never gets invented numbers.
//
// Anti-duplication design (AdSense "low value content" fix, 2026-07): the copy
// is assembled from VARIANT POOLS chosen per profile (pure scorer / creator /
// midfielder / defender / goalkeeper, with age & form nuances) and picked
// DETERMINISTICALLY from a hash of the player's identity — stable across
// builds (no Math.random), but different players land on different phrasings,
// so the ~1.2k fiches stop reading as clones of one template.

const POS_LABEL: Record<'es' | 'en', Record<NonNullable<PlayerData['position']>, string>> = {
  es: { FW: 'delantero', MF: 'centrocampista', DF: 'defensa', GK: 'portero' },
  en: { FW: 'forward', MF: 'midfielder', DF: 'defender', GK: 'goalkeeper' },
}

// Join sentence fragments into a paragraph, dropping empties. Collapses runs of
// whitespace and removes the stray space before punctuation that appears when a
// fragment intentionally starts with ", …" / ". …".
function para(...sentences: Array<string | false | null | undefined>): string {
  return sentences.filter(Boolean).join(' ').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim()
}

function per90(total: number | undefined, minutes: number | undefined): number | null {
  if (!total || !minutes || minutes < 90) return null
  return Math.round((total / minutes) * 90 * 100) / 100
}

// FNV-1a — tiny, deterministic, good spread for short identity strings.
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// Independent picks per slot: salt shifts the seed so the same player doesn't
// always land on variant N of every pool.
function pick<T>(pool: T[], seed: number, salt: number): T {
  return pool[((seed + Math.imul(salt, 2654435761)) >>> 0) % pool.length]
}

type Profile = 'gk' | 'scorer' | 'creator' | 'attacker' | 'midfielder' | 'defender'

function classify(p: PlayerData): Profile {
  if (p.position === 'GK') return 'gk'
  if (p.position === 'DF') return 'defender'
  const goals = p.goles ?? 0
  const assists = p.asist ?? 0
  const keyPasses = p.keyPasses ?? p.passesKey ?? 0
  const creatorish = (assists >= 4 && assists >= goals) || keyPasses >= 35
  if (p.position === 'MF') return creatorish ? 'creator' : 'midfielder'
  // FW (or unknown, treated as attacker): split pure finishers from creators.
  if (goals >= 6 && goals >= assists * 2) return 'scorer'
  if (creatorish) return 'creator'
  return 'attacker'
}

interface Ctx {
  name: string
  pos: string
  club: string
  league: string
  age: number | undefined
  goals: number
  assists: number
  ga: number
  apps: number
  season: string
}

// League rank by goals among the primary (current-season) rows we hold — a
// real, checkable claim ("among the league's top scorers"), only surfaced when
// the player is actually near the top.
function leagueGoalRank(p: PlayerData): number | null {
  if (!p.league || !(p.goles > 0)) return null
  const peers = PRIMARY_PLAYERS.filter(x => x.league === p.league)
  if (peers.length < 10) return null
  const better = peers.filter(x => (x.goles ?? 0) > p.goles).length
  const rank = better + 1
  return rank <= 15 ? rank : null
}

const nfES = (n: number) => n.toLocaleString('es-ES')
const nfEN = (n: number) => n.toLocaleString('en-US')

export function playerNarrative(player: PlayerData, seasons: PlayerData[], lang: 'es' | 'en'): string[] {
  const en = lang === 'en'
  const name = player.fullName || player.name
  const pos = player.position ? POS_LABEL[lang][player.position] : (en ? 'player' : 'jugador')
  const profile = classify(player)
  const gk = profile === 'gk'
  const club = player.club
  const league = player.league
  const goals = player.goles ?? 0
  const assists = player.asist ?? 0
  const ga = goals + assists
  const apps = player.pj ?? 0
  const minutes = player.minutes
  const shots = player.shotsTotal
  const conv = shots ? Math.round((goals / shots) * 100) : null
  const onTarget = shots ? Math.round(((player.shotsOn ?? 0) / shots) * 100) : null
  const goalsP90 = per90(goals, minutes)
  const gaP90 = per90(ga, minutes)
  const dribblePct = player.dribblesAttempts ? Math.round(((player.dribblesSuccess ?? 0) / player.dribblesAttempts) * 100) : null
  const duelPct = player.duelsTotal ? Math.round(((player.duelsWon ?? 0) / player.duelsTotal) * 100) : null
  const passPct = player.passAccuracy ?? player.passesAccuracy
  const keyPasses = player.keyPasses ?? player.passesKey
  const age = player.age || undefined
  const young = age != null && age <= 21
  const veteran = age != null && age >= 33
  const rating = player.rating
  const impact = iig(player)
  const rank = leagueGoalRank(player)

  const seed = hash(`${player.name}|${player.apiId ?? ''}|${player.club}`)
  const ctx: Ctx = { name, pos, club, league, age, goals, assists, ga, apps, season: CURRENT_SEASON_LONG }

  const paragraphs: string[] = []

  // ── 1 · Opening: identity + role, phrased per profile ──────────────────────
  const nat = player.nationality ? ` (${player.nationality})` : ''
  const ageBitES = age ? `, de ${age} años,` : ''
  const ageBitEN = age ? `, aged ${age},` : ''
  const clubLeagueES = club && league ? `${club} (${league})` : club || ''
  const clubLeagueEN = clubLeagueES

  const OPENERS: Record<Profile, Array<(c: Ctx) => string>> = en
    ? {
        scorer: [
          c => `${c.name}${nat}${ageBitEN} leads the line for ${clubLeagueEN} in ${c.season}, and his job description is simple: goals.`,
          c => `Few things define ${c.name}${nat} better than the scoresheet — the ${clubLeagueEN} ${c.pos} is one of the squad's main goal threats in ${c.season}.`,
          c => `${c.name}${nat} is the reference point of the ${clubLeagueEN} attack this ${c.season} season${age ? ` at ${age}` : ''}.`,
        ],
        creator: [
          c => `${c.name}${nat}${ageBitEN} is the creative hub of ${clubLeagueEN} in ${c.season}: the numbers below show a player who makes others score.`,
          c => `Chances tend to pass through ${c.name}${nat} — the ${clubLeagueEN} ${c.pos} shapes much of his side's attacking play in ${c.season}.`,
          c => `${c.name}${nat} does his best work between the lines for ${clubLeagueEN}, and his ${c.season} numbers lean clearly toward creation.`,
        ],
        attacker: [
          c => `${c.name}${nat}${ageBitEN} is part of the attacking rotation at ${clubLeagueEN} this ${c.season} season.`,
          c => `${c.name}${nat} gives ${clubLeagueEN} another option up front in ${c.season}, mixing finishing with link-up play.`,
          c => `At ${clubLeagueEN}, ${c.name}${nat} covers the forward positions in ${c.season} — here is what his season looks like in numbers.`,
        ],
        midfielder: [
          c => `${c.name}${nat}${ageBitEN} runs the midfield for ${clubLeagueEN} in ${c.season}, balancing ball progression with defensive work.`,
          c => `${c.name}${nat} is a fixture of the ${clubLeagueEN} engine room this ${c.season} season.`,
          c => `Much of what ${clubLeagueEN} do goes through ${c.name}${nat} in midfield — his ${c.season} season, measured below.`,
        ],
        defender: [
          c => `${c.name}${nat}${ageBitEN} anchors the ${clubLeagueEN} back line in ${c.season}.`,
          c => `${c.name}${nat} earns his living stopping attacks: the ${c.pos} is part of the ${clubLeagueEN} defensive core in ${c.season}.`,
          c => `For ${clubLeagueEN}, ${c.name}${nat} is first about defending — his ${c.season} numbers tell that story.`,
        ],
        gk: [
          c => `${c.name}${nat}${ageBitEN} guards the goal for ${clubLeagueEN} in ${c.season}.`,
          c => `Between the posts at ${clubLeagueEN}, ${c.name}${nat} is the last line of defence this ${c.season} season.`,
          c => `${c.name}${nat} is the ${clubLeagueEN} goalkeeper — a position where every number below carries weight.`,
        ],
      }
    : {
        scorer: [
          c => `${c.name}${nat}${ageBitES} lidera el ataque del ${clubLeagueES} en la ${c.season}, y su oficio se resume en una palabra: gol.`,
          c => `Pocas cosas definen a ${c.name}${nat} mejor que la tabla de goleadores — el ${c.pos} del ${clubLeagueES} es una de las principales amenazas de su equipo en la ${c.season}.`,
          c => `${c.name}${nat} es la referencia ofensiva del ${clubLeagueES} esta temporada ${c.season}${age ? `, a sus ${age} años` : ''}.`,
        ],
        creator: [
          c => `${c.name}${nat}${ageBitES} es el eje creativo del ${clubLeagueES} en la ${c.season}: los números que siguen dibujan a un jugador que hace marcar a los demás.`,
          c => `Las ocasiones del ${clubLeagueES} suelen pasar por las botas de ${c.name}${nat}, que dirige buena parte del juego ofensivo en la ${c.season}.`,
          c => `${c.name}${nat} rinde entre líneas para el ${clubLeagueES}, y sus cifras de la ${c.season} se inclinan claramente hacia la creación.`,
        ],
        attacker: [
          c => `${c.name}${nat}${ageBitES} forma parte de la rotación ofensiva del ${clubLeagueES} esta temporada ${c.season}.`,
          c => `${c.name}${nat} da al ${clubLeagueES} una alternativa más en ataque en la ${c.season}, combinando remate y asociación.`,
          c => `En el ${clubLeagueES}, ${c.name}${nat} ocupa las posiciones de ataque en la ${c.season} — así se ve su temporada en números.`,
        ],
        midfielder: [
          c => `${c.name}${nat}${ageBitES} gobierna el centro del campo del ${clubLeagueES} en la ${c.season}, equilibrando la salida de balón con el trabajo defensivo.`,
          c => `${c.name}${nat} es un fijo en la medular del ${clubLeagueES} esta temporada ${c.season}.`,
          c => `Buena parte del juego del ${clubLeagueES} pasa por ${c.name}${nat} en el mediocampo — su ${c.season}, medida abajo.`,
        ],
        defender: [
          c => `${c.name}${nat}${ageBitES} sostiene la zaga del ${clubLeagueES} en la ${c.season}.`,
          c => `${c.name}${nat} se gana la vida frenando ataques: el ${c.pos} forma parte del bloque defensivo del ${clubLeagueES} en la ${c.season}.`,
          c => `En el ${clubLeagueES}, lo primero para ${c.name}${nat} es defender — sus números de la ${c.season} cuentan esa historia.`,
        ],
        gk: [
          c => `${c.name}${nat}${ageBitES} custodia la portería del ${clubLeagueES} en la ${c.season}.`,
          c => `Bajo palos del ${clubLeagueES}, ${c.name}${nat} es la última línea de defensa esta temporada ${c.season}.`,
          c => `${c.name}${nat} es el portero del ${clubLeagueES} — una posición donde cada número de abajo pesa.`,
        ],
      }

  const opener = club
    ? pick(OPENERS[profile], seed, 1)(ctx)
    : (en ? `${name}${nat} is a ${pos}${age ? ` aged ${age}` : ''}.` : `${name}${nat} es un ${pos}${age ? ` de ${age} años` : ''}.`)
  // Don't repeat the age when the chosen opener variant already states it.
  // Matched against the exact phrasings the openers use — a bare includes(age)
  // would false-positive on the season string ("2025/26" contains "20").
  const openerHasAge = age != null &&
    [`aged ${age}`, `at ${age}`, `de ${age} años`, `a sus ${age}`].some(m => opener.toLowerCase().includes(m))
  const ageNuance = young
    ? (en ? `${openerHasAge ? 'He' : `At ${age}, he`} is still at the start of his career, which makes these numbers a projection as much as a record.`
          : `${openerHasAge ? 'Está' : `A sus ${age} años está`} aún al principio de su carrera, lo que convierte estos números en proyección además de registro.`)
    : veteran
      ? (en ? `${openerHasAge ? 'He' : `At ${age}, he`} brings the experience of a long career to the dressing room.`
            : `${openerHasAge ? 'Aporta' : `A sus ${age} años aporta`} al vestuario la experiencia de una carrera larga.`)
      : ''

  const physical = (player.height || player.birthPlace)
    ? (en
        ? `${player.height ? `He stands ${player.height}${player.weight ? ` and weighs ${player.weight}` : ''}.` : ''}${player.birthPlace ? ` He was born in ${player.birthPlace}.` : ''}`.trim()
        : `${player.height ? `Mide ${player.height}${player.weight ? ` y pesa ${player.weight}` : ''}.` : ''}${player.birthPlace ? ` Nació en ${player.birthPlace}.` : ''}`.trim())
    : ''

  paragraphs.push(para(
    opener,
    player.captain ? (en ? `He also wears the captain's armband.` : `Además, ejerce de capitán.`) : '',
    ageNuance,
    physical,
  ))

  // ── 2 · Production, phrased per profile ────────────────────────────────────
  if (gk) {
    paragraphs.push(para(
      pick(en
        ? [
            () => `Across ${apps} appearance${apps === 1 ? '' : 's'} this season he has kept goal${player.saves != null ? `, making ${player.saves} save${player.saves === 1 ? '' : 's'}` : ''}.`,
            () => `His season so far: ${apps} match${apps === 1 ? '' : 'es'} played${player.saves != null ? ` and ${player.saves} save${player.saves === 1 ? '' : 's'} made` : ''}.`,
          ]
        : [
            () => `En ${apps} partido${apps === 1 ? '' : 's'} esta temporada ha defendido la portería${player.saves != null ? `, con ${player.saves} parada${player.saves === 1 ? '' : 's'}` : ''}.`,
            () => `Su temporada hasta ahora: ${apps} encuentro${apps === 1 ? '' : 's'} disputado${apps === 1 ? '' : 's'}${player.saves != null ? ` y ${player.saves} parada${player.saves === 1 ? '' : 's'}` : ''}.`,
          ], seed, 2)(),
      player.goalsConceded != null
        ? (en ? `He has conceded ${player.goalsConceded} goal${player.goalsConceded === 1 ? '' : 's'} in that span${minutes ? ` over ${nfEN(minutes)} minutes` : ''}.`
              : `Ha encajado ${player.goalsConceded} gol${player.goalsConceded === 1 ? '' : 'es'} en ese tramo${minutes ? ` a lo largo de ${nfES(minutes)} minutos` : ''}.`)
        : '',
      player.penaltySaved != null && player.penaltySaved > 0
        ? (en ? `He has also stopped ${player.penaltySaved} penalt${player.penaltySaved === 1 ? 'y' : 'ies'}.` : `Además ha detenido ${player.penaltySaved} penalti${player.penaltySaved === 1 ? '' : 's'}.`)
        : '',
      rating != null
        ? (en ? `His average match rating is ${rating.toFixed(2)}.` : `Su nota media por partido es ${rating.toFixed(2)}.`)
        : '',
    ))
  } else {
    const PROD: Array<(c: Ctx) => string> = en
      ? [
          c => `So far he has scored ${c.goals} goal${c.goals === 1 ? '' : 's'} and provided ${c.assists} assist${c.assists === 1 ? '' : 's'} in ${c.apps} appearance${c.apps === 1 ? '' : 's'} — ${c.ga} goal contribution${c.ga === 1 ? '' : 's'} in total.`,
          c => `His ledger reads ${c.goals} goal${c.goals === 1 ? '' : 's'} plus ${c.assists} assist${c.assists === 1 ? '' : 's'} from ${c.apps} match${c.apps === 1 ? '' : 'es'}, ${c.ga} direct contribution${c.ga === 1 ? '' : 's'} in all.`,
          c => `Over ${c.apps} appearance${c.apps === 1 ? '' : 's'} he has been directly involved in ${c.ga} goal${c.ga === 1 ? '' : 's'}: ${c.goals} scored, ${c.assists} set up.`,
        ]
      : [
          c => `Hasta ahora suma ${c.goals} gol${c.goals === 1 ? '' : 'es'} y ${c.assists} asistencia${c.assists === 1 ? '' : 's'} en ${c.apps} partido${c.apps === 1 ? '' : 's'} — ${c.ga} ${c.ga === 1 ? 'participación' : 'participaciones'} de gol en total.`,
          c => `Su cuenta marca ${c.goals} gol${c.goals === 1 ? '' : 'es'} más ${c.assists} asistencia${c.assists === 1 ? '' : 's'} en ${c.apps} encuentro${c.apps === 1 ? '' : 's'}, ${c.ga} ${c.ga === 1 ? 'intervención directa' : 'intervenciones directas'} en jugadas de gol.`,
          c => `En ${c.apps} partido${c.apps === 1 ? '' : 's'} ha participado directamente en ${c.ga} gol${c.ga === 1 ? '' : 'es'}: ${c.goals} marcado${c.goals === 1 ? '' : 's'} y ${c.assists} servido${c.assists === 1 ? '' : 's'}.`,
        ]
    paragraphs.push(para(
      pick(PROD, seed, 3)(ctx),
      minutes
        ? (en ? `That comes across ${nfEN(minutes)} minutes on the pitch${goalsP90 != null ? `, or ${goalsP90} goals per 90 minutes` : ''}${gaP90 != null ? ` and ${gaP90} goal involvements per 90` : ''}.`
              : `Todo ello en ${nfES(minutes)} minutos disputados${goalsP90 != null ? `, es decir ${goalsP90} goles cada 90 minutos` : ''}${gaP90 != null ? ` y ${gaP90} participaciones de gol cada 90` : ''}.`)
        : '',
      player.lineups != null
        ? (en ? `He has started ${player.lineups} of those matches.` : `Ha sido titular en ${player.lineups} de esos encuentros.`)
        : '',
      (goals > 0 && minutes && minutes >= 90 && profile === 'scorer')
        ? (en ? `That works out to a goal roughly every ${Math.round(minutes / goals)} minutes.` : `Eso supone un gol aproximadamente cada ${Math.round(minutes / goals)} minutos.`)
        : '',
      rank != null && league
        ? (en ? `Those ${goals} goals place him ${rank === 1 ? 'top of' : `#${rank} in`} the ${league} scoring charts on this site.`
              : `Esos ${goals} goles lo sitúan ${rank === 1 ? 'en lo más alto de' : `como #${rank} en`} la tabla de goleadores de ${league} de este sitio.`)
        : '',
    ))
  }

  // ── 3 · Role-specific detail (finishing / creation / defending) ────────────
  if (!gk) {
    const finishing = shots != null
      ? pick(en
          ? [
              () => `From ${shots} shot${shots === 1 ? '' : 's'}${onTarget != null ? `, ${onTarget}% on target` : ''}, his shot conversion is ${conv}%.`,
              () => `He has attempted ${shots} shot${shots === 1 ? '' : 's'}${onTarget != null ? ` (${onTarget}% finding the frame)` : ''} and converts ${conv}% of them.`,
            ]
          : [
              () => `De ${shots} disparo${shots === 1 ? '' : 's'}${onTarget != null ? `, un ${onTarget}% entre los tres palos` : ''}, su conversión es del ${conv}%.`,
              () => `Ha intentado ${shots} disparo${shots === 1 ? '' : 's'}${onTarget != null ? ` (el ${onTarget}% a puerta)` : ''} y convierte el ${conv}% en gol.`,
            ], seed, 4)()
      : ''
    const creation = keyPasses != null
      ? pick(en
          ? [
              () => `He creates chances too, with ${keyPasses} key pass${keyPasses === 1 ? '' : 'es'}${passPct != null ? ` and ${passPct}% passing accuracy` : ''}.`,
              () => `On the creative side he has produced ${keyPasses} key pass${keyPasses === 1 ? '' : 'es'}${passPct != null ? ` while completing ${passPct}% of his passes` : ''}.`,
            ]
          : [
              () => `También genera juego, con ${keyPasses} pase${keyPasses === 1 ? '' : 's'} clave${passPct != null ? ` y un ${passPct}% de acierto en el pase` : ''}.`,
              () => `En faceta creativa acumula ${keyPasses} pase${keyPasses === 1 ? '' : 's'} clave${passPct != null ? `, completando el ${passPct}% de sus entregas` : ''}.`,
            ], seed, 5)()
      : (passPct != null ? (en ? `His passing accuracy stands at ${passPct}%.` : `Su acierto en el pase es del ${passPct}%.`) : '')
    const defending = (profile === 'defender' || profile === 'midfielder') && (player.tacklesTotal != null || player.interceptions != null)
      ? (en ? `Off the ball he has made ${player.tacklesTotal ?? 0} tackle${player.tacklesTotal === 1 ? '' : 's'} and ${player.interceptions ?? 0} interception${player.interceptions === 1 ? '' : 's'}${duelPct != null ? `, winning ${duelPct}% of his duels` : ''}.`
            : `Sin balón acumula ${player.tacklesTotal ?? 0} entrada${player.tacklesTotal === 1 ? '' : 's'} y ${player.interceptions ?? 0} ${player.interceptions === 1 ? 'intercepción' : 'intercepciones'}${duelPct != null ? `, ganando el ${duelPct}% de sus duelos` : ''}.`)
      : ''
    const dribbling = dribblePct != null && (profile === 'scorer' || profile === 'attacker' || profile === 'creator')
      ? (en ? `In one-on-ones he completes ${dribblePct}% of his dribbles.` : `En el uno contra uno completa el ${dribblePct}% de sus regates.`)
      : ''
    // Order role-appropriately: finishers lead with shooting, creators with passing.
    const detail = profile === 'creator'
      ? para(creation, finishing, dribbling, defending)
      : para(finishing, creation, dribbling, defending)
    if (detail) paragraphs.push(detail)
  }

  // ── 4 · Duels, discipline, market value, IIG ────────────────────────────────
  const closing = para(
    duelPct != null && profile !== 'defender' && profile !== 'midfielder'
      ? (en ? `He wins ${duelPct}% of his duels.` : `Gana el ${duelPct}% de sus duelos.`)
      : '',
    player.penaltiesScored != null && player.penaltiesScored > 0
      ? (en ? `${player.penaltiesScored} of his goals have come from the penalty spot.` : `${player.penaltiesScored} de sus goles han llegado desde el punto de penalti.`)
      : '',
    (player.yellowCards != null || player.redCards != null)
      ? (en ? `Disciplinary record this season: ${player.yellowCards ?? 0} yellow${player.redCards ? ` and ${player.redCards} red` : ''}.`
            : `Su disciplina esta temporada: ${player.yellowCards ?? 0} amarilla${(player.yellowCards ?? 0) === 1 ? '' : 's'}${player.redCards ? ` y ${player.redCards} roja${player.redCards === 1 ? '' : 's'}` : ''}.`)
      : '',
    player.marketValue
      ? (en ? `His market value is estimated at ${player.marketValue}.` : `Su valor de mercado se estima en ${player.marketValue}.`)
      : '',
    !gk && impact > 0
      ? pick(en
          ? [
              () => `All of it condenses into an IIG (Striker Impact Index) of ${impact} this season — our league-weighted composite of goals, rating and assists.`,
              () => `Put together, his season yields an IIG of ${impact}, the league-weighted impact score explained on our about page.`,
            ]
          : [
              () => `Todo ello se condensa en un IIG (Índice de Impacto del Goleador) de ${impact} esta temporada — nuestro compuesto de goles, nota y asistencias ponderado por liga.`,
              () => `En conjunto, su temporada arroja un IIG de ${impact}, la puntuación de impacto ponderada por liga que explicamos en la página "sobre el proyecto".`,
            ], seed, 6)()
      : '',
  )
  if (closing) paragraphs.push(closing)

  // ── 5 · Career context derived from the season history we hold ─────────────
  if (seasons.length > 1) {
    const codes = seasons.map(s => s.season).filter(Boolean) as string[]
    const sorted = [...codes].sort()
    const firstCode = sorted[0]
    const careerGoals = seasons.reduce((t, s) => t + (s.goles ?? 0), 0)
    const best = seasons.reduce((b, s) => ((s.goles ?? 0) > (b.goles ?? 0) ? s : b), seasons[0])
    paragraphs.push(para(
      firstCode
        ? pick(en
            ? [
                () => `Our records track ${name} back to the ${seasonLong(firstCode)} season across ${seasons.length} campaigns.`,
                () => `This site's dataset follows ${name} through ${seasons.length} campaigns, starting in ${seasonLong(firstCode)}.`,
              ]
            : [
                () => `Nuestros registros siguen a ${name} desde la temporada ${seasonLong(firstCode)}, a lo largo de ${seasons.length} campañas.`,
                () => `El dataset de este sitio acompaña a ${name} durante ${seasons.length} campañas, desde la ${seasonLong(firstCode)}.`,
              ], seed, 7)()
        : '',
      !gk && careerGoals > 0
        ? (en ? `In that time he has scored ${careerGoals} league goal${careerGoals === 1 ? '' : 's'} in the competitions we cover` : `En ese periodo acumula ${careerGoals} gol${careerGoals === 1 ? '' : 'es'} de liga en las competiciones que cubrimos`)
        : '',
      !gk && best && (best.goles ?? 0) > 0 && best.season
        ? (en ? `, with his best return of ${best.goles} coming in ${seasonLong(best.season)}.` : `, con su mejor registro de ${best.goles} en ${seasonLong(best.season)}.`)
        : (careerGoals > 0 ? '.' : ''),
    ))
  }

  return paragraphs.filter(Boolean)
}
