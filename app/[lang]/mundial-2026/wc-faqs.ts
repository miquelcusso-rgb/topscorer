// Shared (server + client) World Cup FAQ source.
// Lives outside the 'use client' component so the server page can import wcFaqs()
// to build the FAQPage JSON-LD from the exact same content the client renders.

export interface WcFaq { q: string; a: string }

/** WC-specific FAQs, localised. The tournament is OVER (final 19-jul-2026):
 *  answers state the final outcome — concrete, citable facts for GEO. The old
 *  `leader` param is kept for call-site compatibility but no longer needed. */
export function wcFaqs(lang: 'es' | 'en', _leader?: string): WcFaq[] {
  const en = lang === 'en'
  return [
    {
      q: en ? 'Who won the 2026 World Cup?' : '¿Quién ganó el Mundial 2026?',
      a: en
        ? 'Spain won the 2026 FIFA World Cup, beating Argentina 1-0 after extra time in the final on July 19, 2026 at MetLife Stadium (New York/New Jersey). Ferran Torres scored the winning goal in the 106th minute. It is Spain\'s second world title after 2010.'
        : 'España ganó el Mundial 2026 al vencer 1-0 a Argentina en la prórroga de la final, el 19 de julio de 2026 en el MetLife Stadium (Nueva York/Nueva Jersey). Ferran Torres marcó el gol del título en el minuto 106. Es el segundo Mundial de España tras el de 2010.',
    },
    {
      q: en ? 'Who was the top scorer of the 2026 World Cup?' : '¿Quién fue el máximo goleador del Mundial 2026?',
      a: en
        ? 'Kylian Mbappé (France) won the 2026 World Cup Golden Boot with 10 goals — the first player to reach double figures in a single World Cup since Gerd Müller in 1970. The full scorers table is on this page.'
        : 'Kylian Mbappé (Francia) ganó la Bota de Oro del Mundial 2026 con 10 goles — el primer jugador en llegar a cifras dobles en un solo Mundial desde Gerd Müller en 1970. La tabla completa de goleadores está en esta página.',
    },
    {
      q: en ? 'Who won the individual awards at the 2026 World Cup?' : '¿Quién ganó los premios individuales del Mundial 2026?',
      a: en
        ? 'Golden Ball: Rodri (Spain). Golden Boot: Kylian Mbappé (France, 10 goals). Golden Glove: Unai Simón (Spain, 7 clean sheets). Best Young Player: Pau Cubarsí (Spain).'
        : 'Balón de Oro: Rodri (España). Bota de Oro: Kylian Mbappé (Francia, 10 goles). Guante de Oro: Unai Simón (España, 7 porterías a cero). Mejor Jugador Joven: Pau Cubarsí (España).',
    },
    {
      q: en ? 'When was the 2026 World Cup played?' : '¿Cuándo se jugó el Mundial 2026?',
      a: en
        ? 'The 2026 FIFA World Cup ran from June 11 to July 19, 2026. The opening match was on June 11 at Estadio Azteca (Mexico City) and the final on July 19 at MetLife Stadium (New York/New Jersey), where Spain beat Argentina 1-0.'
        : 'El Mundial 2026 se disputó del 11 de junio al 19 de julio de 2026. El partido inaugural fue el 11 de junio en el Estadio Azteca (Ciudad de México) y la final, el 19 de julio en el MetLife Stadium (Nueva York/Nueva Jersey), donde España venció 1-0 a Argentina.',
    },
    {
      q: en ? 'How many teams played the 2026 World Cup?' : '¿Cuántas selecciones jugaron el Mundial 2026?',
      a: en
        ? '48 teams for the first time, drawn into 12 groups of 4. The top two of each group plus the eight best third-placed teams advanced to a new round of 32.'
        : '48 selecciones por primera vez, repartidas en 12 grupos de 4. Los dos primeros de cada grupo más los ocho mejores terceros avanzaron a unos nuevos dieciseisavos de final.',
    },
    {
      q: en ? 'Where was the 2026 World Cup played?' : '¿Dónde se jugó el Mundial 2026?',
      a: en
        ? 'Across 16 venues in three countries: the United States (11 cities), Mexico (3) and Canada (2). It was the first World Cup co-hosted by three nations.'
        : 'En 16 sedes de tres países: Estados Unidos (11 ciudades), México (3) y Canadá (2). Fue el primer Mundial organizado por tres naciones.',
    },
  ]
}

/** Facts a nation FAQ needs, all taken from the frozen tournament snapshot. */
export interface NationFaqFacts {
  topName?: string
  topGoals?: number
  /** How many different players of this nation scored. */
  scorerCount: number
  /** Goals the nation scored across the whole tournament. */
  totalGoals: number
  /** Localised end-of-run clause ("and won the tournament" / "y cayó en octavos"). */
  outcome?: string
  /** Matches played at the tournament. */
  played: number
  /** The top scorer's finishing rank in the Golden Boot race, when top-20. */
  rank?: number | null
}

/** Nation top-scorer FAQs (per WC nation) — head terms "goleadores [país] mundial
 *  2026" / "[country] top scorers world cup 2026". The tournament is OVER, so
 *  every answer states a final, citable number instead of promising live updates
 *  (which is what made these snippets worthless for CTR). */
export function nationScorersFaqs(
  lang: 'es' | 'en',
  nation: string,
  facts: NationFaqFacts,
): WcFaq[] {
  const en = lang === 'en'
  const { topName, topGoals, scorerCount, totalGoals, outcome, played, rank } = facts
  const g = (n: number) => (en ? `${n} ${n === 1 ? 'goal' : 'goals'}` : `${n} ${n === 1 ? 'gol' : 'goles'}`)

  const faqs: WcFaq[] = []

  faqs.push({
    q: en
      ? `Who was ${nation}'s top scorer at the 2026 World Cup?`
      : `¿Quién fue el máximo goleador de ${nation} en el Mundial 2026?`,
    a: topName && typeof topGoals === 'number'
      ? (en
          ? `${topName} was ${nation}'s top scorer at the 2026 World Cup with ${g(topGoals)}${rank ? `, which placed him ${ordinal(rank, 'en')} in the tournament's Golden Boot race` : ''}. ${scorerCount > 1 ? `${scorerCount} ${nation} players scored in total.` : `He was the only ${nation} player to score.`}`
          : `${topName} fue el máximo goleador de ${nation} en el Mundial 2026 con ${g(topGoals)}${rank ? `, lo que le situó ${ordinal(rank, 'es')} en la carrera por la Bota de Oro del torneo` : ''}. ${scorerCount > 1 ? `En total marcaron ${scorerCount} jugadores de ${nation}.` : `Fue el único jugador de ${nation} que marcó.`}`)
      : played === 0
        ? (en
            ? `${nation} did not qualify for the 2026 World Cup, so they had no scorers at the tournament. Spain won it, beating Argentina 1-0 after extra time in the final.`
            : `${nation} no se clasificó para el Mundial 2026, así que no tuvo goleadores en el torneo. Lo ganó España, que venció 1-0 a Argentina en la prórroga de la final.`)
        : (en
            ? `No ${nation} player scored at the 2026 World Cup.`
            : `Ningún jugador de ${nation} marcó en el Mundial 2026.`),
  })

  if (played === 0) return faqs

  faqs.push({
    q: en
      ? `How many goals did ${nation} score at the 2026 World Cup?`
      : `¿Cuántos goles marcó ${nation} en el Mundial 2026?`,
    a: en
      ? `${nation} scored ${g(totalGoals)} at the 2026 World Cup across ${played} ${played === 1 ? 'match' : 'matches'}${outcome ? ` ${outcome}` : ''}. That works out at ${(totalGoals / Math.max(played, 1)).toFixed(2)} goals per match.`
      : `${nation} marcó ${g(totalGoals)} en el Mundial 2026 en ${played} ${played === 1 ? 'partido' : 'partidos'}${outcome ? ` ${outcome}` : ''}. Son ${(totalGoals / Math.max(played, 1)).toFixed(2)} goles por partido.`,
  })

  faqs.push({
    q: en
      ? `Who won the 2026 World Cup Golden Boot?`
      : `¿Quién ganó la Bota de Oro del Mundial 2026?`,
    a: en
      ? `Kylian Mbappé (France) won the 2026 World Cup Golden Boot with 10 goals.${topName && typeof topGoals === 'number' ? ` ${nation}'s best was ${topName} on ${g(topGoals)}.` : ''} When players finish level on goals the award is decided by assists, then by fewest minutes played.`
      : `Kylian Mbappé (Francia) ganó la Bota de Oro del Mundial 2026 con 10 goles.${topName && typeof topGoals === 'number' ? ` El mejor de ${nation} fue ${topName}, con ${g(topGoals)}.` : ''} Cuando dos jugadores empatan a goles, decide el número de asistencias y, después, los menos minutos jugados.`,
  })

  return faqs
}

/** "3rd" / "3.º" — used to phrase a Golden Boot finishing position. */
function ordinal(n: number, lang: 'es' | 'en'): string {
  if (lang === 'es') return `${n}.º`
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
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
    {
      q: en ? 'Who is the top scorer after the group stage?' : '¿Quién es el máximo goleador tras la fase de grupos?',
      a: en
        ? (leader
            ? `${leader} tops the 2026 World Cup scoring chart${hasN ? ` with ${goals} goals` : ''}. The group stage runs June 11–27, 2026; this page updates live, so it always shows the current top scorers and Golden Boot standings after the group stage and through the knockout rounds.`
            : 'The group stage runs June 11–27, 2026. From the opening matches this page shows the live top-scorer standings, so you can see who leads the Golden Boot after the group stage and into the knockouts.')
        : (leader
            ? `${leader} encabeza la clasificación de goleadores del Mundial 2026${hasN ? ` con ${goals} goles` : ''}. La fase de grupos va del 11 al 27 de junio de 2026; esta página se actualiza en directo, así que siempre muestra los máximos goleadores y la clasificación de la Bota de Oro tras la fase de grupos y durante las eliminatorias.`
            : 'La fase de grupos va del 11 al 27 de junio de 2026. Desde los primeros partidos esta página muestra la clasificación de goleadores en directo, para que veas quién lidera la Bota de Oro tras la fase de grupos y en las eliminatorias.'),
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
