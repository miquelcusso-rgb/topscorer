// Shared (server + client) World Cup FAQ source.
// Lives outside the 'use client' component so the server page can import wcFaqs()
// to build the FAQPage JSON-LD from the exact same content the client renders.

export interface WcFaq { q: string; a: string }

/** WC-specific FAQs, localised. `leader` (current top scorer) makes the answers
 *  concrete/citable for GEO when the tournament is underway. */
export function wcFaqs(lang: 'es' | 'en', leader?: string): WcFaq[] {
  const en = lang === 'en'
  return [
    {
      q: en ? 'Who is the top scorer of the 2026 World Cup?' : '¿Quién es el máximo goleador del Mundial 2026?',
      a: en
        ? (leader
            ? `${leader} is the current top scorer of the 2026 World Cup. The table on this page updates live as goals go in.`
            : 'It will be decided once the tournament kicks off on June 11, 2026. This page updates the scorers table live throughout the World Cup.')
        : (leader
            ? `${leader} es ahora mismo el máximo goleador del Mundial 2026. La tabla de esta página se actualiza en directo según se marcan los goles.`
            : 'Se sabrá cuando arranque el torneo el 11 de junio de 2026. Esta página actualiza la tabla de goleadores en directo durante todo el Mundial.'),
    },
    {
      q: en ? 'Who is winning the World Cup Golden Boot?' : '¿Quién va ganando la Bota de Oro del Mundial?',
      a: en
        ? `The Golden Boot goes to the tournament's top scorer. ${leader ? leader + ' currently tops the chart. ' : 'The race opens on June 11, 2026. '}If two players are level on goals, it is decided by most assists and then fewest minutes played.`
        : `La Bota de Oro premia al máximo goleador del torneo. ${leader ? leader + ' encabeza ahora la clasificación. ' : 'La carrera arranca el 11 de junio de 2026. '}En caso de empate a goles, decide el mayor número de asistencias y, después, los menos minutos jugados.`,
    },
    {
      q: en ? 'When does the 2026 World Cup start and end?' : '¿Cuándo empieza y termina el Mundial 2026?',
      a: en
        ? 'The 2026 FIFA World Cup runs from June 11 to July 19, 2026. The opening match is on June 11 at Estadio Azteca (Mexico City) and the final is on July 19 at MetLife Stadium (New York/New Jersey).'
        : 'El Mundial 2026 se disputa del 11 de junio al 19 de julio de 2026. El partido inaugural es el 11 de junio en el Estadio Azteca (Ciudad de México) y la final, el 19 de julio en el MetLife Stadium (Nueva York/Nueva Jersey).',
    },
    {
      q: en ? 'How many teams play the 2026 World Cup?' : '¿Cuántas selecciones juegan el Mundial 2026?',
      a: en
        ? '48 teams for the first time, drawn into 12 groups of 4. The top two of each group plus the eight best third-placed teams advance to a new round of 32.'
        : '48 selecciones por primera vez, repartidas en 12 grupos de 4. Los dos primeros de cada grupo más los ocho mejores terceros avanzan a unos nuevos dieciseisavos de final.',
    },
    {
      q: en ? 'Where is the 2026 World Cup played?' : '¿Dónde se juega el Mundial 2026?',
      a: en
        ? 'Across 16 venues in three countries: the United States (11 cities), Mexico (3) and Canada (2). It is the first World Cup co-hosted by three nations.'
        : 'En 16 sedes de tres países: Estados Unidos (11 ciudades), México (3) y Canadá (2). Es el primer Mundial organizado por tres naciones.',
    },
  ]
}

/** Nation top-scorer FAQs (per WC nation) — head terms "goleadores [país] mundial
 *  2026" / "[country] top scorers world cup 2026". `topName`/`topGoals` make the
 *  answer concrete + citable for GEO when the tournament is underway. */
export function nationScorersFaqs(
  lang: 'es' | 'en',
  nation: string,
  topName?: string,
  topGoals?: number,
): WcFaq[] {
  const en = lang === 'en'
  const hasN = typeof topGoals === 'number'
  return [
    {
      q: en
        ? `Who are ${nation}'s top scorers at the 2026 World Cup?`
        : `¿Quiénes son los goleadores de ${nation} en el Mundial 2026?`,
      a: en
        ? (topName
            ? `${topName} is ${nation}'s top scorer at the 2026 World Cup${hasN ? ` with ${topGoals} ${topGoals === 1 ? 'goal' : 'goals'}` : ''}. The full list of ${nation}'s scorers on this page updates live as goals go in throughout the tournament.`
            : `${nation}'s scorers will appear here from their first match. This page lists every ${nation} goal at the 2026 World Cup and updates live as the tournament is played.`)
        : (topName
            ? `${topName} es el máximo goleador de ${nation} en el Mundial 2026${hasN ? ` con ${topGoals} ${topGoals === 1 ? 'gol' : 'goles'}` : ''}. La lista completa de goleadores de ${nation} de esta página se actualiza en directo según se marcan los goles durante el torneo.`
            : `Los goleadores de ${nation} aparecerán aquí desde su primer partido. Esta página recoge cada gol de ${nation} en el Mundial 2026 y se actualiza en directo a medida que se juega el torneo.`),
    },
    {
      q: en
        ? `How many goals has ${nation} scored at the 2026 World Cup?`
        : `¿Cuántos goles ha marcado ${nation} en el Mundial 2026?`,
      a: en
        ? `This page adds up every goal scored by ${nation} players at the 2026 World Cup and updates live. The tally starts at zero before the tournament kicks off on June 11, 2026.`
        : `Esta página suma todos los goles de los jugadores de ${nation} en el Mundial 2026 y se actualiza en directo. El recuento parte de cero antes de que arranque el torneo el 11 de junio de 2026.`,
    },
    {
      q: en
        ? `Could a ${nation} player win the 2026 World Cup Golden Boot?`
        : `¿Puede un jugador de ${nation} ganar la Bota de Oro del Mundial 2026?`,
      a: en
        ? `Any ${nation} player can win the Golden Boot — it goes to the tournament's overall top scorer, regardless of nation. If level on goals, the tie is broken by most assists, then fewest minutes played.`
        : `Cualquier jugador de ${nation} puede ganar la Bota de Oro: premia al máximo goleador de todo el torneo, sea de la selección que sea. En caso de empate a goles, decide el mayor número de asistencias y, después, los menos minutos jugados.`,
    },
  ]
}

/** Golden Boot page FAQs — head terms ("quién va líder", "cómo se decide",
 *  "cuántos goles lleva"). `leader`/`goals` make answers concrete + citable. */
export function goldenBootFaqs(lang: 'es' | 'en', leader?: string, goals?: number): WcFaq[] {
  const en = lang === 'en'
  const hasN = typeof goals === 'number'
  return [
    {
      q: en ? 'Who is leading the 2026 World Cup Golden Boot?' : '¿Quién va líder de la Bota de Oro del Mundial 2026?',
      a: en
        ? (leader
            ? `${leader} leads the 2026 World Cup Golden Boot${hasN ? ` with ${goals} goals` : ''}. The ranking on this page updates live as goals go in throughout the tournament.`
            : 'The Golden Boot race opens with the first match on June 11, 2026. From kick-off, this page ranks the top scorers live as goals go in.')
        : (leader
            ? `${leader} va líder de la Bota de Oro del Mundial 2026${hasN ? ` con ${goals} goles` : ''}. La clasificación de esta página se actualiza en directo según se marcan los goles durante el torneo.`
            : 'La carrera por la Bota de Oro arranca con el primer partido el 11 de junio de 2026. Desde el pitido inicial, esta página ordena en directo a los máximos goleadores según marcan.'),
    },
    {
      q: en ? 'How is the World Cup Golden Boot decided?' : '¿Cómo se decide la Bota de Oro del Mundial?',
      a: en
        ? 'The Golden Boot (Bota de Oro) goes to the player who scores the most goals across the whole tournament. If two or more players finish level on goals, the tie-breakers are, in order: most assists, then fewest minutes played.'
        : 'La Bota de Oro premia al jugador que marca más goles en todo el torneo. Si dos o más jugadores acaban empatados a goles, los criterios de desempate son, por este orden: más asistencias y, después, menos minutos jugados.',
    },
    {
      q: en ? 'How many goals does the top scorer have?' : '¿Cuántos goles lleva el máximo goleador?',
      a: en
        ? (leader && hasN
            ? `${leader} is the current top scorer with ${goals} goals. The full ranking updates live on this page as the World Cup goes on.`
            : 'The tally appears live once the tournament kicks off on June 11, 2026; this page shows each scorer’s exact goal count and updates as matches are played.')
        : (leader && hasN
            ? `${leader} es el máximo goleador con ${goals} goles. La clasificación completa se actualiza en directo en esta página a medida que avanza el Mundial.`
            : 'El recuento aparece en directo en cuanto arranca el torneo el 11 de junio de 2026; esta página muestra los goles exactos de cada goleador y se actualiza según se juegan los partidos.'),
    },
    {
      q: en ? 'What is the difference between the Golden Boot and the Golden Ball?' : '¿Qué diferencia hay entre la Bota de Oro y el Balón de Oro del Mundial?',
      a: en
        ? 'The Golden Boot rewards the tournament’s top scorer (most goals). The Golden Ball is a separate FIFA award for the best overall player of the World Cup, chosen by a media vote — they are often won by different players.'
        : 'La Bota de Oro premia al máximo goleador del torneo (más goles). El Balón de Oro es un premio distinto de la FIFA al mejor jugador del Mundial, elegido por votación de la prensa; suelen ganarlos jugadores diferentes.',
    },
  ]
}

/** Assists page FAQs — "quién da más asistencias", "qué cuenta como asistencia". */
export function assistsFaqs(lang: 'es' | 'en', leader?: string, assists?: number): WcFaq[] {
  const en = lang === 'en'
  const hasN = typeof assists === 'number'
  return [
    {
      q: en ? 'Who has the most assists at the 2026 World Cup?' : '¿Quién da más asistencias en el Mundial 2026?',
      a: en
        ? (leader
            ? `${leader} leads the 2026 World Cup for assists${hasN ? ` with ${assists}` : ''}. The ranking updates live on this page throughout the tournament.`
            : 'The assists ranking opens with the first match on June 11, 2026, and updates live on this page as goals are set up.')
        : (leader
            ? `${leader} lidera las asistencias del Mundial 2026${hasN ? ` con ${assists}` : ''}. La clasificación se actualiza en directo en esta página durante todo el torneo.`
            : 'El ranking de asistencias arranca con el primer partido el 11 de junio de 2026 y se actualiza en directo en esta página según se generan los goles.'),
    },
    {
      q: en ? 'What counts as an assist?' : '¿Qué cuenta como asistencia?',
      a: en
        ? 'An assist is credited to the player who makes the final pass or touch leading directly to a goal. A player can win the Golden Boot tie-break on assists, which is why the assists ranking matters during the World Cup.'
        : 'La asistencia se atribuye al jugador que da el último pase o toque que conduce directamente a un gol. Las asistencias son además el primer criterio de desempate de la Bota de Oro, por eso este ranking importa durante el Mundial.',
    },
    {
      q: en ? 'Do assists count towards the Golden Boot?' : '¿Las asistencias cuentan para la Bota de Oro?',
      a: en
        ? 'Not directly — the Golden Boot is decided on goals. But if two players finish level on goals, the first tie-breaker is assists (then fewest minutes played), so assists can decide the award.'
        : 'No de forma directa: la Bota de Oro se decide por goles. Pero si dos jugadores acaban empatados a goles, el primer criterio de desempate son las asistencias (y después, menos minutos jugados), así que pueden decidir el premio.',
    },
  ]
}
