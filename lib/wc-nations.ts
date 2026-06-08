import { slugify } from '@/lib/slugify'

// ─── World Cup 2026 nations ───────────────────────────────────────────────────
// A nation entry maps a stable URL slug to the API-Football country `name`
// (English, the form the API expects in /teams?name=) plus localized display
// names and an editorial "curious fact". The slug is derived from the Spanish
// display name (e.g. "España" → "espana", "Estados Unidos" → "estados-unidos")
// so URLs read naturally in the default (ES) locale, while EN visitors get the
// English label in the UI. Resolution also accepts the English slug as a fallback.
//
// Coverage caveat: not all 48 berths are decided yet (some confederation play-offs
// + the inter-confederation play-off resolve in spring 2026). We list the three
// hosts (auto-qualified) + the established favourites / likely qualifiers. Any
// country not listed still resolves by slug→Title-Case → API lookup, so the page
// works for late qualifiers too — it just won't carry a hand-written fact.

export interface WcNation {
  /** API-Football country name (English) — used for /teams?name= */
  api: string
  es: string
  en: string
  /** FIFA ranking / titles / star-player editorial line. */
  fact_es?: string
  fact_en?: string
}

export const WC_NATIONS: WcNation[] = [
  // Hosts (auto-qualified)
  { api: 'USA',         es: 'Estados Unidos', en: 'United States', fact_es: 'Coanfitriona del Mundial 2026 junto a México y Canadá; juega en casa por primera vez desde 1994.', fact_en: 'Co-host of the 2026 World Cup with Mexico and Canada; plays at home for the first time since 1994.' },
  { api: 'Mexico',      es: 'México', en: 'Mexico', fact_es: 'Coanfitriona y primer país en albergar tres Mundiales (1970, 1986 y 2026). El Estadio Azteca abre el torneo.', fact_en: 'Co-host and first country to stage three World Cups (1970, 1986 and 2026). Estadio Azteca opens the tournament.' },
  { api: 'Canada',      es: 'Canadá', en: 'Canada', fact_es: 'Coanfitriona; disputará su tercer Mundial tras 1986 y 2022.', fact_en: 'Co-host; will play its third World Cup after 1986 and 2022.' },
  // Established favourites / likely qualifiers
  { api: 'Brazil',      es: 'Brasil', en: 'Brazil', fact_es: 'Máxima ganadora de la historia con 5 títulos (1958, 1962, 1970, 1994 y 2002) y la única que ha jugado todas las ediciones.', fact_en: 'Record 5-time champion (1958, 1962, 1970, 1994 and 2002) and the only side to have played every edition.' },
  { api: 'Argentina',   es: 'Argentina', en: 'Argentina', fact_es: 'Campeona del mundo vigente (Qatar 2022) y triple campeona; llega como una de las grandes favoritas.', fact_en: 'Reigning world champion (Qatar 2022) and three-time winner; arrives among the top favourites.' },
  { api: 'France',      es: 'Francia', en: 'France', fact_es: 'Doble campeona (1998 y 2018) y finalista en 2022; una de las plantillas más profundas del mundo.', fact_en: 'Two-time champion (1998 and 2018) and 2022 finalist; one of the deepest squads in the world.' },
  { api: 'Spain',       es: 'España', en: 'Spain', fact_es: 'Campeona en 2010 y vigente campeona de Europa (2024); generación joven liderada por Lamine Yamal.', fact_en: '2010 world champion and reigning European champion (2024); a young generation led by Lamine Yamal.' },
  { api: 'England',     es: 'Inglaterra', en: 'England', fact_es: 'Campeona en 1966; finalista de la Eurocopa 2020 y 2024, busca su primer Mundial en seis décadas.', fact_en: '1966 champion; runner-up at Euro 2020 and 2024, chasing a first World Cup in six decades.' },
  { api: 'Germany',     es: 'Alemania', en: 'Germany', fact_es: 'Cuádruple campeona (1954, 1974, 1990 y 2014); busca recuperar el nivel tras dos Mundiales decepcionantes.', fact_en: 'Four-time champion (1954, 1974, 1990 and 2014); looking to bounce back after two disappointing World Cups.' },
  { api: 'Portugal',    es: 'Portugal', en: 'Portugal', fact_es: 'Campeona de Europa en 2016; generación de oro con Cristiano Ronaldo, Bruno Fernandes y Rafael Leão.', fact_en: '2016 European champion; a golden generation with Cristiano Ronaldo, Bruno Fernandes and Rafael Leão.' },
  { api: 'Netherlands', es: 'Países Bajos', en: 'Netherlands', fact_es: 'Tres veces finalista (1974, 1978 y 2010); aún busca su primer título mundial.', fact_en: 'Three-time runner-up (1974, 1978 and 2010); still chasing a first world title.' },
  { api: 'Belgium',     es: 'Bélgica', en: 'Belgium', fact_es: 'Tercera en 2018, su mejor resultado; transición de la "generación dorada".', fact_en: 'Third in 2018, its best-ever finish; transitioning from its "golden generation".' },
  { api: 'Croatia',     es: 'Croacia', en: 'Croatia', fact_es: 'Finalista en 2018 y tercera en 2022 pese a ser un país de menos de 4 millones de habitantes.', fact_en: '2018 finalist and third in 2022 despite a population under 4 million.' },
  { api: 'Uruguay',     es: 'Uruguay', en: 'Uruguay', fact_es: 'Doble campeona (1930 y 1950) y la nación más pequeña que ha ganado el Mundial.', fact_en: 'Two-time champion (1930 and 1950) and the smallest nation ever to win the World Cup.' },
  { api: 'Italy',       es: 'Italia', en: 'Italy', fact_es: 'Cuádruple campeona (1934, 1938, 1982 y 2006), aunque ha faltado a las dos últimas citas.', fact_en: 'Four-time champion (1934, 1938, 1982 and 2006), though absent from the last two editions.' },
  { api: 'Morocco',     es: 'Marruecos', en: 'Morocco', fact_es: 'Primera selección africana en alcanzar unas semifinales del Mundial (Qatar 2022).', fact_en: 'First African nation to reach a World Cup semi-final (Qatar 2022).' },
  { api: 'Japan',       es: 'Japón', en: 'Japan', fact_es: 'Habitual de octavos; en Qatar 2022 venció a Alemania y España en la fase de grupos.', fact_en: 'A regular in the knockouts; beat Germany and Spain in the Qatar 2022 group stage.' },
  { api: 'South Korea', es: 'Corea del Sur', en: 'South Korea', fact_es: 'Semifinalista en 2002 como anfitriona; liderada por Son Heung-min.', fact_en: 'Semi-finalist as host in 2002; led by Son Heung-min.' },
  { api: 'Senegal',     es: 'Senegal', en: 'Senegal', fact_es: 'Campeona de África 2021; sorprendió en su debut mundialista de 2002 llegando a cuartos.', fact_en: '2021 Africa Cup of Nations champion; reached the quarter-finals on its 2002 World Cup debut.' },
  { api: 'Colombia',    es: 'Colombia', en: 'Colombia', fact_es: 'Cuartofinalista en 2014 con James Rodríguez como Bota de Oro del torneo.', fact_en: '2014 quarter-finalist, with James Rodríguez winning that tournament’s Golden Boot.' },
  { api: 'Switzerland', es: 'Suiza', en: 'Switzerland', fact_es: 'Clasificada a octavos en cuatro de los últimos cinco Mundiales.', fact_en: 'Reached the knockouts in four of the last five World Cups.' },
  { api: 'Denmark',     es: 'Dinamarca', en: 'Denmark', fact_es: 'Campeona de Europa en 1992; selección sólida y muy física.', fact_en: '1992 European champion; a solid, physical side.' },
  { api: 'Australia',   es: 'Australia', en: 'Australia', fact_es: 'Los "Socceroos" alcanzaron octavos en 2006 y 2022.', fact_en: 'The "Socceroos" reached the Round of 16 in 2006 and 2022.' },
]

// slug → nation. Built once from both the ES and EN display names so either
// localized slug resolves.
const BY_SLUG: Map<string, WcNation> = (() => {
  const m = new Map<string, WcNation>()
  for (const n of WC_NATIONS) {
    m.set(slugify(n.es), n)
    m.set(slugify(n.en), n)
  }
  return m
})()

/** Canonical slug (Spanish-derived) for a nation. */
export function nationSlug(n: WcNation): string {
  return slugify(n.es)
}

/**
 * Resolve a slug → { api, es, en, fact* }. Known nations come from the table;
 * unknown slugs (late qualifiers) degrade to a Title-Cased guess used both as
 * the API query and the display name, so the page still works.
 */
export function resolveNation(slug: string): WcNation {
  const hit = BY_SLUG.get(slug)
  if (hit) return hit
  const title = slug.split('-').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ')
  return { api: title, es: title, en: title }
}

export function nationName(n: WcNation, lang: 'es' | 'en'): string {
  return lang === 'en' ? n.en : n.es
}

export function nationFact(n: WcNation, lang: 'es' | 'en'): string | undefined {
  return lang === 'en' ? n.fact_en : n.fact_es
}
