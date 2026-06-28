import type { PlayerData } from '@/types'
import { CURRENT_SEASON_LONG, seasonLong } from '@/lib/season'

// Generates a data-derived prose narrative (300+ words) for a player fiche from
// the stats we already hold in the static dataset. NO external calls → free on
// the Vercel free tier and fully server-rendered (SEO-visible, unlike the
// client-fetched Wikipedia BioPanel). "Always fresh": every season reference is
// derived from lib/season (CURRENT_SEASON_*), never hardcoded; every sentence is
// gated on the underlying field actually being present, so a sparse player never
// gets invented numbers. Returns an array of paragraphs (render each as <p>).

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

export function playerNarrative(player: PlayerData, seasons: PlayerData[], lang: 'es' | 'en'): string[] {
  const en = lang === 'en'
  const name = player.fullName || player.name
  const pos = player.position ? POS_LABEL[lang][player.position] : (en ? 'player' : 'jugador')
  const gk = player.position === 'GK'
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

  const paragraphs: string[] = []

  // 1 — identity + current-season setup.
  paragraphs.push(para(
    en
      ? `${name}${player.nationality ? ` (${player.nationality})` : ''} is a${pos.match(/^[aeiou]/) ? 'n' : ''} ${pos}${player.age ? ` aged ${player.age}` : ''}.`
      : `${name}${player.nationality ? ` (${player.nationality})` : ''} es un ${pos}${player.age ? ` de ${player.age} años` : ''}.`,
    club && league
      ? (en
          ? `He plays for ${club} in ${league}, and the figures below cover the ${CURRENT_SEASON_LONG} season.`
          : `Juega en el ${club} de ${league}, y las cifras siguientes corresponden a la temporada ${CURRENT_SEASON_LONG}.`)
      : club
        ? (en ? `He plays for ${club} this ${CURRENT_SEASON_LONG} season.` : `Juega en el ${club} esta temporada ${CURRENT_SEASON_LONG}.`)
        : '',
    player.captain
      ? (en ? `He wears the captain's armband for his side.` : `Ejerce de capitán de su equipo.`)
      : '',
    (player.height || player.weight || player.birthPlace)
      ? (en
          ? `${player.height ? `He stands ${player.height}` : ''}${player.height && player.weight ? ' and weighs ' + player.weight : player.weight ? `He weighs ${player.weight}` : ''}${(player.height || player.weight) ? '.' : ''}${player.birthPlace ? ` He was born in ${player.birthPlace}.` : ''}`.trim()
          : `${player.height ? `Mide ${player.height}` : ''}${player.height && player.weight ? ' y pesa ' + player.weight : player.weight ? `Pesa ${player.weight}` : ''}${(player.height || player.weight) ? '.' : ''}${player.birthPlace ? ` Nació en ${player.birthPlace}.` : ''}`.trim())
      : '',
  ))

  // 2 — production. GK gets a goalkeeping line instead of goals/assists.
  if (gk) {
    paragraphs.push(para(
      en
        ? `Across ${apps} appearance${apps === 1 ? '' : 's'} this season he has kept goal for ${club || 'his club'}${player.saves != null ? `, making ${player.saves} save${player.saves === 1 ? '' : 's'}` : ''}.`
        : `En ${apps} partido${apps === 1 ? '' : 's'} esta temporada ha defendido la portería del ${club || 'su club'}${player.saves != null ? `, con ${player.saves} parada${player.saves === 1 ? '' : 's'}` : ''}.`,
      player.goalsConceded != null
        ? (en ? `He has conceded ${player.goalsConceded} goal${player.goalsConceded === 1 ? '' : 's'} in that span.` : `Ha encajado ${player.goalsConceded} gol${player.goalsConceded === 1 ? '' : 'es'} en ese tramo.`)
        : '',
      player.penaltySaved != null && player.penaltySaved > 0
        ? (en ? `He has also stopped ${player.penaltySaved} penalt${player.penaltySaved === 1 ? 'y' : 'ies'}.` : `Además ha detenido ${player.penaltySaved} penalti${player.penaltySaved === 1 ? '' : 's'}.`)
        : '',
    ))
  } else {
    paragraphs.push(para(
      en
        ? `So far he has scored ${goals} goal${goals === 1 ? '' : 's'} and provided ${assists} assist${assists === 1 ? '' : 's'} in ${apps} appearance${apps === 1 ? '' : 's'}, a combined ${ga} goal contribution${ga === 1 ? '' : 's'}.`
        : `Hasta ahora suma ${goals} gol${goals === 1 ? '' : 'es'} y ${assists} asistencia${assists === 1 ? '' : 's'} en ${apps} partido${apps === 1 ? '' : 's'}, lo que hace ${ga} ${ga === 1 ? 'participación' : 'participaciones'} en gol.`,
      minutes
        ? (en ? `That comes across ${minutes.toLocaleString('en-US')} minutes on the pitch${goalsP90 != null ? `, or ${goalsP90} goals per 90 minutes` : ''}${gaP90 != null ? ` and ${gaP90} goal involvements per 90` : ''}.`
              : `Todo ello en ${minutes.toLocaleString('es-ES')} minutos disputados${goalsP90 != null ? `, es decir ${goalsP90} goles cada 90 minutos` : ''}${gaP90 != null ? ` y ${gaP90} participaciones de gol cada 90` : ''}.`)
        : '',
      player.lineups != null
        ? (en ? `He has started ${player.lineups} of those matches.` : `Ha sido titular en ${player.lineups} de esos encuentros.`)
        : '',
      (goals > 0 && minutes && minutes >= 90)
        ? (en ? `That works out to a goal roughly every ${Math.round(minutes / goals)} minutes.` : `Eso supone un gol aproximadamente cada ${Math.round(minutes / goals)} minutos.`)
        : '',
    ))
  }

  // 3 — finishing + creativity (outfield) / shot-stopping context (GK handled above).
  if (!gk) {
    const finishing = para(
      shots != null
        ? (en ? `From ${shots} shot${shots === 1 ? '' : 's'}${onTarget != null ? `, ${onTarget}% on target` : ''}, his shot conversion is ${conv}%.`
              : `De ${shots} disparo${shots === 1 ? '' : 's'}${onTarget != null ? `, un ${onTarget}% entre los tres palos` : ''}, su conversión es del ${conv}%.`)
        : '',
      keyPasses != null
        ? (en ? `He creates chances too, with ${keyPasses} key pass${keyPasses === 1 ? '' : 'es'}${passPct != null ? ` and ${passPct}% passing accuracy` : ''}.`
              : `También genera juego, con ${keyPasses} pase${keyPasses === 1 ? '' : 's'} clave${passPct != null ? ` y un ${passPct}% de acierto en el pase` : ''}.`)
        : (passPct != null ? (en ? `His passing accuracy stands at ${passPct}%.` : `Su acierto en el pase es del ${passPct}%.`) : ''),
      dribblePct != null
        ? (en ? `In one-on-ones he completes ${dribblePct}% of his dribbles.` : `En el uno contra uno completa el ${dribblePct}% de sus regates.`)
        : '',
    )
    if (finishing) paragraphs.push(finishing)
  }

  // 4 — duels, discipline, penalties, market value.
  const physical = para(
    duelPct != null
      ? (en ? `He wins ${duelPct}% of his duels` : `Gana el ${duelPct}% de sus duelos`)
      : '',
    (player.tacklesTotal != null || player.interceptions != null)
      ? (en ? `${duelPct != null ? ', and' : 'He'} contributes ${player.tacklesTotal ?? 0} tackle${player.tacklesTotal === 1 ? '' : 's'} and ${player.interceptions ?? 0} interception${player.interceptions === 1 ? '' : 's'} defensively.`
            : `${duelPct != null ? ', y' : ''} aporta ${player.tacklesTotal ?? 0} entrada${player.tacklesTotal === 1 ? '' : 's'} y ${player.interceptions ?? 0} ${player.interceptions === 1 ? 'intercepción' : 'intercepciones'} en tareas defensivas.`)
      : (duelPct != null ? '.' : ''),
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
  )
  if (physical) paragraphs.push(physical)

  // 5 — career context derived from the season history we hold.
  if (seasons.length > 1) {
    const codes = seasons.map(s => s.season).filter(Boolean) as string[]
    const sorted = [...codes].sort()
    const firstCode = sorted[0]
    const careerGoals = seasons.reduce((t, s) => t + (s.goles ?? 0), 0)
    const best = seasons.reduce((b, s) => ((s.goles ?? 0) > (b.goles ?? 0) ? s : b), seasons[0])
    paragraphs.push(para(
      firstCode
        ? (en ? `Our records track ${name} back to the ${seasonLong(firstCode)} season across ${seasons.length} campaigns.`
              : `Nuestros registros siguen a ${name} desde la temporada ${seasonLong(firstCode)}, a lo largo de ${seasons.length} campañas.`)
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
