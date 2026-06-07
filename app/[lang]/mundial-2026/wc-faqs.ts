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
