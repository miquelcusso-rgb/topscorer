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
  /** Extra slug aliases that should resolve to this nation (e.g. the slugified
   *  API team name "korea-republic", or "bosnia" for the long official name). */
  aliases?: string[]
  /** FIFA ranking / titles / star-player editorial line. */
  fact_es?: string
  fact_en?: string
}

export const WC_NATIONS: WcNation[] = [
  // Hosts (auto-qualified)
  { api: 'USA',         es: 'Estados Unidos', en: 'United States', aliases: ['usa', 'us', 'united-states-of-america'], fact_es: 'Coanfitriona del Mundial 2026 junto a México y Canadá; juega en casa por primera vez desde 1994.', fact_en: 'Co-host of the 2026 World Cup with Mexico and Canada; plays at home for the first time since 1994.' },
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
  { api: 'Netherlands', es: 'Países Bajos', en: 'Netherlands', aliases: ['holanda', 'holland'], fact_es: 'Tres veces finalista (1974, 1978 y 2010); aún busca su primer título mundial.', fact_en: 'Three-time runner-up (1974, 1978 and 2010); still chasing a first world title.' },
  { api: 'Belgium',     es: 'Bélgica', en: 'Belgium', fact_es: 'Tercera en 2018, su mejor resultado; transición de la "generación dorada".', fact_en: 'Third in 2018, its best-ever finish; transitioning from its "golden generation".' },
  { api: 'Croatia',     es: 'Croacia', en: 'Croatia', fact_es: 'Finalista en 2018 y tercera en 2022 pese a ser un país de menos de 4 millones de habitantes.', fact_en: '2018 finalist and third in 2022 despite a population under 4 million.' },
  { api: 'Uruguay',     es: 'Uruguay', en: 'Uruguay', fact_es: 'Doble campeona (1930 y 1950) y la nación más pequeña que ha ganado el Mundial.', fact_en: 'Two-time champion (1930 and 1950) and the smallest nation ever to win the World Cup.' },
  { api: 'Italy',       es: 'Italia', en: 'Italy', fact_es: 'Cuádruple campeona (1934, 1938, 1982 y 2006), aunque ha faltado a las dos últimas citas.', fact_en: 'Four-time champion (1934, 1938, 1982 and 2006), though absent from the last two editions.' },
  { api: 'Morocco',     es: 'Marruecos', en: 'Morocco', fact_es: 'Primera selección africana en alcanzar unas semifinales del Mundial (Qatar 2022).', fact_en: 'First African nation to reach a World Cup semi-final (Qatar 2022).' },
  { api: 'Japan',       es: 'Japón', en: 'Japan', fact_es: 'Habitual de octavos; en Qatar 2022 venció a Alemania y España en la fase de grupos.', fact_en: 'A regular in the knockouts; beat Germany and Spain in the Qatar 2022 group stage.' },
  { api: 'South Korea', es: 'Corea del Sur', en: 'South Korea', aliases: ['korea-republic', 'republic-of-korea', 'korea-south'], fact_es: 'Semifinalista en 2002 como anfitriona; liderada por Son Heung-min.', fact_en: 'Semi-finalist as host in 2002; led by Son Heung-min.' },
  { api: 'Senegal',     es: 'Senegal', en: 'Senegal', fact_es: 'Campeona de África 2021; sorprendió en su debut mundialista de 2002 llegando a cuartos.', fact_en: '2021 Africa Cup of Nations champion; reached the quarter-finals on its 2002 World Cup debut.' },
  { api: 'Colombia',    es: 'Colombia', en: 'Colombia', fact_es: 'Cuartofinalista en 2014 con James Rodríguez como Bota de Oro del torneo.', fact_en: '2014 quarter-finalist, with James Rodríguez winning that tournament’s Golden Boot.' },
  { api: 'Switzerland', es: 'Suiza', en: 'Switzerland', aliases: ['schweiz', 'svizzera'], fact_es: 'Clasificada a octavos en cuatro de los últimos cinco Mundiales.', fact_en: 'Reached the knockouts in four of the last five World Cups.' },
  { api: 'Denmark',     es: 'Dinamarca', en: 'Denmark', fact_es: 'Campeona de Europa en 1992; selección sólida y muy física.', fact_en: '1992 European champion; a solid, physical side.' },
  { api: 'Australia',   es: 'Australia', en: 'Australia', fact_es: 'Los "Socceroos" alcanzaron octavos en 2006 y 2022.', fact_en: 'The "Socceroos" reached the Round of 16 in 2006 and 2022.' },
  // ── Wider 2026 field: top-30 FIFA sides, confirmed/likely qualifiers and the
  //    nations users look up by name. Some carry no editorial fact yet. ──
  { api: 'Croatia',     es: 'Croacia', en: 'Croatia', aliases: ['hrvatska'], fact_es: 'Finalista en 2018 y tercera en 2022 pese a ser un país de menos de 4 millones de habitantes.', fact_en: '2018 finalist and third in 2022 despite a population under 4 million.' },
  { api: 'Austria',     es: 'Austria', en: 'Austria', aliases: ['osterreich'], fact_es: 'Selección en alza dirigida por Ralf Rangnick; suele competir de tú a tú con las grandes de Europa.', fact_en: 'A rising side under Ralf Rangnick that regularly trades blows with Europe’s elite.' },
  { api: 'Bosnia and Herzegovina', es: 'Bosnia y Herzegovina', en: 'Bosnia and Herzegovina', aliases: ['bosnia', 'bosnia-herzegovina', 'bosnia-and-herzegovina'], fact_es: 'Debutó en un Mundial en 2014 con Edin Džeko como referente ofensivo.', fact_en: 'Made its World Cup debut in 2014, spearheaded by Edin Džeko.' },
  { api: 'Serbia',      es: 'Serbia', en: 'Serbia', fact_es: 'Generación talentosa con Vlahović y Mitrović al frente del ataque.', fact_en: 'A talented generation led up front by Vlahović and Mitrović.' },
  { api: 'Poland',      es: 'Polonia', en: 'Poland', fact_es: 'Liderada por Robert Lewandowski, uno de los mejores delanteros del siglo.', fact_en: 'Led by Robert Lewandowski, one of the finest strikers of the century.' },
  { api: 'Ukraine',     es: 'Ucrania', en: 'Ukraine', fact_es: 'Cuartofinalista de la Eurocopa 2020; juega sus partidos como local fuera de casa.', fact_en: 'Euro 2020 quarter-finalist, currently playing its home matches abroad.' },
  { api: 'Turkey',      es: 'Turquía', en: 'Türkiye', aliases: ['turkiye', 'turkey'], fact_es: 'Tercera en el Mundial 2002; cuartofinalista en la Eurocopa 2024.', fact_en: 'Third at the 2002 World Cup; quarter-finalist at Euro 2024.' },
  { api: 'Sweden',      es: 'Suecia', en: 'Sweden', fact_es: 'Tercera en 1950 y 1994; finalista como anfitriona en 1958.', fact_en: 'Third in 1950 and 1994; runner-up as host in 1958.' },
  { api: 'Norway',      es: 'Noruega', en: 'Norway', fact_es: 'Resurge con Erling Haaland y Martin Ødegaard tras décadas de ausencia.', fact_en: 'Resurgent with Erling Haaland and Martin Ødegaard after decades away.' },
  { api: 'Scotland',    es: 'Escocia', en: 'Scotland', fact_es: 'Una de las federaciones más antiguas del mundo; busca volver a un Mundial tras 1998.', fact_en: 'One of the oldest football nations; chasing a first World Cup since 1998.' },
  { api: 'Wales',       es: 'Gales', en: 'Wales', aliases: ['gales'], fact_es: 'Semifinalista de la Eurocopa 2016; volvió a un Mundial en 2022 tras 64 años.', fact_en: 'Euro 2016 semi-finalist; returned to the World Cup in 2022 after 64 years.' },
  { api: 'Hungary',     es: 'Hungría', en: 'Hungary', fact_es: 'La "Hungría Mágica" de Puskás fue finalista en 1954.', fact_en: 'Puskás’s "Magical Magyars" reached the 1954 final.' },
  { api: 'Greece',      es: 'Grecia', en: 'Greece', fact_es: 'Campeona sorpresa de la Eurocopa 2004.', fact_en: 'Surprise champion of Euro 2004.' },
  { api: 'Czech Republic', es: 'Chequia', en: 'Czechia', aliases: ['czechia', 'czech-republic', 'republica-checa'], fact_es: 'Finalista de la Eurocopa 1996 (como República Checa).', fact_en: 'Runner-up at Euro 1996 (as the Czech Republic).' },
  { api: 'Slovakia',    es: 'Eslovaquia', en: 'Slovakia', fact_es: 'Alcanzó octavos en su debut mundialista de 2010.', fact_en: 'Reached the Round of 16 on its 2010 World Cup debut.' },
  { api: 'Slovenia',    es: 'Eslovenia', en: 'Slovenia', fact_es: 'Pequeña nación de los Balcanes con un bloque defensivo muy competitivo.', fact_en: 'A small Balkan nation built around a very competitive defensive block.' },
  { api: 'Romania',     es: 'Rumanía', en: 'Romania', fact_es: 'Cuartofinalista en 1994 con la "Generación de Oro" de Gheorghe Hagi.', fact_en: '1994 quarter-finalist with Gheorghe Hagi’s "Golden Generation".' },
  { api: 'Ireland',     es: 'Irlanda', en: 'Ireland', fact_es: 'Cuartofinalista en su debut mundialista de 1990.', fact_en: 'Quarter-finalist on its 1990 World Cup debut.' },
  { api: 'Russia',      es: 'Rusia', en: 'Russia', fact_es: 'Cuartofinalista como anfitriona en 2018.', fact_en: 'Quarter-finalist as host in 2018.' },
  // CONMEBOL
  { api: 'Ecuador',     es: 'Ecuador', en: 'Ecuador', fact_es: 'Habitual de los Mundiales recientes con un bloque joven y físico.', fact_en: 'A regular at recent World Cups with a young, physical squad.' },
  { api: 'Paraguay',    es: 'Paraguay', en: 'Paraguay', fact_es: 'Cuartofinalista en 2010, su mejor actuación en un Mundial.', fact_en: '2010 quarter-finalist, its best-ever World Cup run.' },
  { api: 'Peru',        es: 'Perú', en: 'Peru', fact_es: 'Volvió a un Mundial en 2018 tras 36 años de ausencia.', fact_en: 'Returned to the World Cup in 2018 after a 36-year absence.' },
  { api: 'Chile',       es: 'Chile', en: 'Chile', fact_es: 'Doble campeona de la Copa América (2015 y 2016).', fact_en: 'Two-time Copa América champion (2015 and 2016).' },
  { api: 'Venezuela',   es: 'Venezuela', en: 'Venezuela', fact_es: 'La "Vinotinto" persigue su primera clasificación mundialista.', fact_en: 'The "Vinotinto" chasing a first-ever World Cup qualification.' },
  { api: 'Bolivia',     es: 'Bolivia', en: 'Bolivia', fact_es: 'Muy fuerte como local en la altitud de La Paz.', fact_en: 'Formidable at home in the altitude of La Paz.' },
  // CONCACAF
  { api: 'Costa Rica',  es: 'Costa Rica', en: 'Costa Rica', fact_es: 'Cuartofinalista sorpresa en Brasil 2014.', fact_en: 'Surprise quarter-finalist at Brazil 2014.' },
  { api: 'Panama',      es: 'Panamá', en: 'Panama', fact_es: 'Debutó en un Mundial en 2018.', fact_en: 'Made its World Cup debut in 2018.' },
  { api: 'Jamaica',     es: 'Jamaica', en: 'Jamaica', fact_es: 'Los "Reggae Boyz" jugaron su único Mundial en 1998.', fact_en: 'The "Reggae Boyz" played their only World Cup in 1998.' },
  { api: 'Honduras',    es: 'Honduras', en: 'Honduras', fact_es: 'Ha disputado tres Mundiales (1982, 2010 y 2014).', fact_en: 'Has played three World Cups (1982, 2010 and 2014).' },
  // CAF
  { api: 'Senegal',     es: 'Senegal', en: 'Senegal', fact_es: 'Campeona de África 2021; sorprendió en su debut mundialista de 2002 llegando a cuartos.', fact_en: '2021 Africa Cup of Nations champion; reached the quarter-finals on its 2002 World Cup debut.' },
  { api: 'Tunisia',     es: 'Túnez', en: 'Tunisia', aliases: ['tunez'], fact_es: 'Habitual de la Copa Mundial; venció a Francia en la fase de grupos de 2022.', fact_en: 'A World Cup regular; beat France in the 2022 group stage.' },
  { api: 'Egypt',       es: 'Egipto', en: 'Egypt', aliases: ['egipto'], fact_es: 'Récord de siete títulos de la Copa África; liderada por Mohamed Salah.', fact_en: 'Record seven Africa Cup of Nations titles; led by Mohamed Salah.' },
  { api: 'Algeria',     es: 'Argelia', en: 'Algeria', fact_es: 'Campeona de África 2019; alcanzó octavos en Brasil 2014.', fact_en: '2019 Africa Cup of Nations champion; reached the Round of 16 at Brazil 2014.' },
  { api: 'Nigeria',     es: 'Nigeria', en: 'Nigeria', fact_es: 'Triple campeona de África; clásico de los octavos del Mundial.', fact_en: 'Three-time African champion and a World Cup last-16 regular.' },
  { api: 'Ghana',       es: 'Ghana', en: 'Ghana', fact_es: 'Cuartofinalista en 2010, a un penalti de las semifinales.', fact_en: '2010 quarter-finalist, a penalty away from the semi-finals.' },
  { api: 'Cameroon',    es: 'Camerún', en: 'Cameroon', fact_es: 'Primera selección africana en alcanzar cuartos de un Mundial (1990).', fact_en: 'First African side to reach a World Cup quarter-final (1990).' },
  { api: 'Ivory Coast', es: 'Costa de Marfil', en: 'Ivory Coast', aliases: ['cote-divoire', 'cote-d-ivoire', 'costa-de-marfil'], fact_es: 'Campeona de África 2023 como anfitriona.', fact_en: '2023 Africa Cup of Nations champion as host.' },
  { api: 'Mali',        es: 'Malí', en: 'Mali', fact_es: 'Potencia emergente del fútbol africano de formación.', fact_en: 'A rising power in African youth development.' },
  { api: 'DR Congo',    es: 'RD del Congo', en: 'DR Congo', aliases: ['congo-dr', 'dr-congo', 'democratic-republic-of-congo'], fact_es: 'Semifinalista de la Copa África 2024.', fact_en: '2024 Africa Cup of Nations semi-finalist.' },
  { api: 'Congo',       es: 'Congo', en: 'Congo', aliases: ['congo-republic', 'republic-of-congo'], fact_es: 'La República del Congo fue tercera en la Copa África 1972.', fact_en: 'The Republic of the Congo finished third at the 1972 Africa Cup of Nations.' },
  { api: 'South Africa', es: 'Sudáfrica', en: 'South Africa', fact_es: 'Anfitriona del primer Mundial africano, en 2010.', fact_en: 'Host of the first African World Cup, in 2010.' },
  { api: 'Cape Verde',  es: 'Cabo Verde', en: 'Cape Verde', aliases: ['cabo-verde'], fact_es: 'Una de las grandes historias del fútbol africano reciente.', fact_en: 'One of the great recent stories of African football.' },
  // AFC
  { api: 'Iran',        es: 'Irán', en: 'Iran', aliases: ['ir-iran', 'iran'], fact_es: 'Una de las selecciones más fuertes y constantes de Asia.', fact_en: 'One of Asia’s strongest and most consistent sides.' },
  { api: 'Saudi Arabia', es: 'Arabia Saudí', en: 'Saudi Arabia', aliases: ['arabia-saudi', 'saudi', 'ksa'], fact_es: 'Venció a la futura campeona Argentina en la fase de grupos de 2022.', fact_en: 'Beat eventual champion Argentina in the 2022 group stage.' },
  { api: 'Iraq',        es: 'Irak', en: 'Iraq', aliases: ['irak'], fact_es: 'Campeona de la Copa Asiática 2007, una gesta histórica.', fact_en: 'Champion of the 2007 Asian Cup, a landmark triumph.' },
  { api: 'Qatar',       es: 'Catar', en: 'Qatar', aliases: ['catar'], fact_es: 'Anfitriona del Mundial 2022 y bicampeona asiática (2019 y 2023).', fact_en: 'Host of the 2022 World Cup and two-time Asian champion (2019 and 2023).' },
  { api: 'Uzbekistan',  es: 'Uzbekistán', en: 'Uzbekistan', fact_es: 'Potencia emergente de Asia Central rumbo a su primer Mundial.', fact_en: 'A rising Central Asian power heading for a first World Cup.' },
  // OFC / others
  { api: 'New Zealand', es: 'Nueva Zelanda', en: 'New Zealand', aliases: ['nueva-zelanda'], fact_es: 'Invicta en el Mundial 2010 (tres empates).', fact_en: 'Unbeaten at the 2010 World Cup (three draws).' },
]

// slug → nation. Built once from the ES + EN display names, the API name, and
// any explicit aliases (slugified API team names like "korea-republic"/"ir-iran",
// short forms like "bosnia"), so links from anywhere — localized URLs, the WC
// groups/standings rows, the favourites list — all land on the right page.
const BY_SLUG: Map<string, WcNation> = (() => {
  const m = new Map<string, WcNation>()
  const put = (s: string, n: WcNation) => { const k = slugify(s); if (k && !m.has(k)) m.set(k, n) }
  for (const n of WC_NATIONS) {
    put(n.es, n)
    put(n.en, n)
    put(n.api, n)
    for (const a of n.aliases ?? []) put(a, n)
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
