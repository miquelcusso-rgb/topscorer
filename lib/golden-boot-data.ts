// ─────────────────────────────────────────────────────────────────────────────
// Golden Boot — evergreen programmatic SEO cluster (multi-competition).
//
// Pivot post-Mundial: dejar de depender del cluster estacional del Mundial y
// posicionar "golden boot / top scorer / máximo goleador" de CUALQUIER liga o
// competición, evergreen. Cada entrada aquí genera una página estática en
// /[lang]/golden-boot/[comp] (ver app/[lang]/golden-boot/[comp]/page.tsx).
//
// 100% ESTÁTICO (datos curados, sin fetch por request) → free-tier-safe, igual
// que las páginas /goleadores-* existentes. Para añadir una competición: añade
// una entrada a COMPETITIONS con datos verificados. Contenido en inglés (las
// keywords "golden boot / top scorer" son EN-dominantes); se sirve en /en y /es.
//
// Datos verificados vía fuentes públicas (Wikipedia/MLSSoccer/ESPN) en la fecha
// de `verified`. Marca/autoría: Furiosa Studio (TopScorers).
// ─────────────────────────────────────────────────────────────────────────────

export type WinnerRow = {
  season: string
  winner: string
  club: string
  goals: number
}

export type GoldenBootComp = {
  /** URL slug → /golden-boot/<slug> */
  slug: string
  /** Display name of the competition */
  competition: string
  /** Name of the top-scorer award in this competition */
  award: string
  /** Date the curated data was last verified (YYYY-MM-DD) */
  verified: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  h1: string
  /** Lead paragraph (HTML-free) */
  intro: string
  /** 2–3 explanatory paragraphs (the citable body) */
  body: string[]
  /** Most recent award winners, newest first */
  recentWinners: WinnerRow[]
  /** Evergreen record facts (each a self-contained, citable sentence) */
  records: string[]
  faqs: { q: string; a: string }[]
}

export const COMPETITIONS: GoldenBootComp[] = [
  {
    slug: 'mls',
    competition: 'Major League Soccer (MLS)',
    award: 'MLS Golden Boot',
    verified: '2026-06-29',
    metaTitle: 'MLS Golden Boot — Winners, Top Scorers & Records',
    metaDescription:
      'MLS Golden Boot explained: every recent winner, the single-season goal record, the all-time top scorer and how the award works. Updated for the 2025 season (Lionel Messi).',
    keywords: [
      'mls golden boot',
      'mls golden boot winners',
      'mls top scorers',
      'mls top goalscorers all time',
      'mls single season goal record',
      'who won the mls golden boot',
      'mls golden boot 2025',
      'lionel messi mls golden boot',
    ],
    h1: 'MLS Golden Boot — Winners, Top Scorers & Records',
    intro:
      'The MLS Golden Boot is awarded each season to the player who scores the most regular-season goals in Major League Soccer. Here is every recent winner, the all-time scoring records, and how the race works.',
    body: [
      'The most recent MLS Golden Boot belongs to Lionel Messi, who scored 29 goals in just 28 appearances for Inter Miami in 2025 — one of the most efficient seasons the league has ever seen.',
      'The single-season goal record still stands to Carlos Vela, who scored 34 goals for LAFC in 2019. Only three other players have reached 30 in a regular season: Josef Martínez (31 in 2018), Zlatan Ibrahimović (30 in 2021) and Messi himself.',
      'The all-time MLS scoring charts are led by Chris Wondolowski with 171 regular-season goals. Wondolowski and Bradley Wright-Phillips share the record for most Golden Boot wins, with two apiece.',
    ],
    recentWinners: [
      { season: '2025', winner: 'Lionel Messi', club: 'Inter Miami', goals: 29 },
      { season: '2024', winner: 'Christian Benteke', club: 'D.C. United', goals: 23 },
      { season: '2023', winner: 'Denis Bouanga', club: 'LAFC', goals: 20 },
      { season: '2022', winner: 'Hany Mukhtar', club: 'Nashville SC', goals: 23 },
      { season: '2021', winner: 'Valentín "Taty" Castellanos', club: 'New York City FC', goals: 19 },
    ],
    records: [
      'Single-season record: Carlos Vela, 34 goals (LAFC, 2019).',
      'All-time leading scorer: Chris Wondolowski, 171 regular-season goals.',
      'Most Golden Boot wins: Chris Wondolowski and Bradley Wright-Phillips, 2 each.',
      'Most recent winner: Lionel Messi, 29 goals in 28 games (Inter Miami, 2025).',
    ],
    faqs: [
      {
        q: 'Who won the MLS Golden Boot in 2025?',
        a: 'Lionel Messi won the 2025 MLS Golden Boot with 29 goals in 28 appearances for Inter Miami, one of the most efficient scoring seasons in league history.',
      },
      {
        q: 'What is the MLS Golden Boot?',
        a: 'The MLS Golden Boot is the award given to the player who scores the most goals in the Major League Soccer regular season. If players tie on goals, assists are used as the tiebreaker.',
      },
      {
        q: 'What is the single-season goal record in MLS?',
        a: 'Carlos Vela holds the MLS single-season record with 34 goals for LAFC in 2019. Josef Martínez (31), Zlatan Ibrahimović (30) and Lionel Messi (29) are the only others to come close.',
      },
      {
        q: 'Who is the all-time leading scorer in MLS?',
        a: 'Chris Wondolowski is the all-time leading scorer in MLS regular-season play with 171 goals. He also shares the record for most Golden Boot wins with Bradley Wright-Phillips.',
      },
      {
        q: 'Where can I follow MLS top scorers live?',
        a: 'TopScorers.com tracks goalscorer rankings across the major leagues and competitions, alongside standings, results and statistics, so you can follow every Golden Boot race in one place.',
      },
    ],
  },
]

export function getComp(slug: string): GoldenBootComp | undefined {
  return COMPETITIONS.find((c) => c.slug === slug)
}
