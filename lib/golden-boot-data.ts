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

export type AllTimeRow = {
  player: string
  /** Country / club / era — context shown next to the name */
  detail: string
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
  /** Most recent award winners, newest first (optional — annual competitions) */
  recentWinners?: WinnerRow[]
  /** All-time top scorers (optional — evergreen, ideal for cup competitions) */
  allTime?: AllTimeRow[]
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

// ── UEFA Champions League ─────────────────────────────────────────────────────
COMPETITIONS.push({
  slug: 'champions-league',
  competition: 'UEFA Champions League',
  award: 'Champions League top scorer',
  verified: '2026-06-29',
  metaTitle: 'Champions League Top Scorers — All-Time & By Season',
  metaDescription:
    'UEFA Champions League top scorers: the all-time list led by Cristiano Ronaldo (140) and Lionel Messi (129), the season-by-season top scorers and the competition records.',
  keywords: [
    'champions league top scorers',
    'champions league all time top scorers',
    'ucl top scorers',
    'most goals in champions league history',
    'cristiano ronaldo champions league goals',
    'messi champions league goals',
    'champions league top scorer 2026',
  ],
  h1: 'Champions League Top Scorers — All-Time & By Season',
  intro:
    'The UEFA Champions League top scorer is the player who nets the most goals in a single edition of Europe’s premier club competition. Below is the all-time scoring list, the most recent season winners and the records.',
  body: [
    'Cristiano Ronaldo is the all-time leading scorer in Champions League history with 140 goals in 183 appearances, ahead of Lionel Messi on 129. Robert Lewandowski (105) and Karim Benzema (90) complete the group of players to have passed 90.',
    'Kylian Mbappé was the outright top scorer of the 2025/26 Champions League with 15 goals for Real Madrid — only Cristiano Ronaldo has ever scored more in a single campaign. The previous season, 2024/25, the award was shared by Raphinha and Serhou Guirassy on 13 goals each.',
    'Unlike a domestic Golden Boot, the Champions League top-scorer race rewards goals across the league phase and knockout rounds, so a deep run to the final is usually decisive in winning it.',
  ],
  recentWinners: [
    { season: '2025/26', winner: 'Kylian Mbappé', club: 'Real Madrid', goals: 15 },
    { season: '2024/25', winner: 'Raphinha & S. Guirassy', club: 'Barcelona / Dortmund', goals: 13 },
  ],
  allTime: [
    { player: 'Cristiano Ronaldo', detail: 'Man Utd / Real Madrid / Juventus', goals: 140 },
    { player: 'Lionel Messi', detail: 'Barcelona / PSG', goals: 129 },
    { player: 'Robert Lewandowski', detail: 'Dortmund / Bayern / Barcelona', goals: 105 },
    { player: 'Karim Benzema', detail: 'Lyon / Real Madrid', goals: 90 },
  ],
  records: [
    'All-time top scorer: Cristiano Ronaldo, 140 goals in 183 games.',
    'Second all-time: Lionel Messi, 129 goals.',
    'Most goals in a single season after Ronaldo: Kylian Mbappé, 15 (2025/26).',
    'Most recent top scorer: Kylian Mbappé, 15 goals (Real Madrid, 2025/26).',
  ],
  faqs: [
    {
      q: 'Who is the all-time top scorer in the Champions League?',
      a: 'Cristiano Ronaldo is the all-time leading scorer in the UEFA Champions League with 140 goals in 183 appearances, ahead of Lionel Messi with 129.',
    },
    {
      q: 'Who was the Champions League top scorer in 2025/26?',
      a: 'Kylian Mbappé was the outright top scorer of the 2025/26 Champions League with 15 goals for Real Madrid, the most in a single campaign by anyone other than Cristiano Ronaldo.',
    },
    {
      q: 'How many Champions League goals does Lionel Messi have?',
      a: 'Lionel Messi has 129 Champions League goals, second only to Cristiano Ronaldo on the all-time list.',
    },
    {
      q: 'Where can I follow Champions League scorers live?',
      a: 'TopScorers.com tracks goalscorer rankings across the Champions League and the major European leagues, alongside standings, results and statistics.',
    },
  ],
})

// ── Africa Cup of Nations (AFCON) ─────────────────────────────────────────────
COMPETITIONS.push({
  slug: 'afcon',
  competition: 'Africa Cup of Nations (AFCON)',
  award: 'AFCON top scorer',
  verified: '2026-06-29',
  metaTitle: 'AFCON Top Scorers — All-Time Africa Cup of Nations Goals',
  metaDescription:
    'Africa Cup of Nations all-time top scorers: Samuel Eto’o leads with 18 goals, ahead of Laurent Pokou (14) and Rashidi Yekini (13). Full list, records and the single-tournament record.',
  keywords: [
    'afcon top scorers',
    'afcon all time top scorers',
    'africa cup of nations top scorers',
    'samuel etoo afcon goals',
    'afcon golden boot',
    'most goals africa cup of nations',
  ],
  h1: 'AFCON Top Scorers — All-Time Africa Cup of Nations Goals',
  intro:
    'The Africa Cup of Nations (AFCON) top scorer, or Golden Boot, goes to the leading goalscorer of each tournament. Here is the all-time AFCON scoring list and the competition records.',
  body: [
    'Samuel Eto’o is the all-time top scorer in Africa Cup of Nations history with 18 goals across six tournaments, winning the title in 2000 and 2002 and the Golden Boot in 2006 and 2008. Ivory Coast’s Laurent Pokou (14) and Nigeria’s Rashidi Yekini (13) follow him.',
    'A cluster of modern greats sits on 11 goals each — Didier Drogba, Patrick Mboma, Mohamed Salah, Hossam Hassan and Sadio Mané — showing how the AFCON scoring charts mix legends from the 1970s with current stars.',
    'The single-tournament record still belongs to Ndaye Mulamba, who scored 9 goals for Zaire (now DR Congo) at the 1974 edition — a mark that has stood for half a century.',
  ],
  allTime: [
    { player: 'Samuel Eto’o', detail: 'Cameroon', goals: 18 },
    { player: 'Laurent Pokou', detail: 'Ivory Coast', goals: 14 },
    { player: 'Rashidi Yekini', detail: 'Nigeria', goals: 13 },
    { player: 'Hassan El-Shazly', detail: 'Egypt', goals: 12 },
    { player: 'Didier Drogba', detail: 'Ivory Coast', goals: 11 },
    { player: 'Patrick Mboma', detail: 'Cameroon', goals: 11 },
    { player: 'Mohamed Salah', detail: 'Egypt', goals: 11 },
    { player: 'Hossam Hassan', detail: 'Egypt', goals: 11 },
    { player: 'Sadio Mané', detail: 'Senegal', goals: 11 },
  ],
  records: [
    'All-time top scorer: Samuel Eto’o, 18 goals (Golden Boot in 2006 and 2008).',
    'Single-tournament record: Ndaye Mulamba, 9 goals (Zaire, 1974).',
    'Most goals by an active player: Mohamed Salah and Sadio Mané, 11 each.',
  ],
  faqs: [
    {
      q: 'Who is the all-time top scorer of the Africa Cup of Nations?',
      a: 'Samuel Eto’o is the all-time top scorer of the Africa Cup of Nations with 18 goals, scored across six tournaments between 1996 and 2010.',
    },
    {
      q: 'What is the record for most goals in a single AFCON tournament?',
      a: 'Ndaye Mulamba holds the record with 9 goals for Zaire (now DR Congo) at the 1974 Africa Cup of Nations, a mark that still stands.',
    },
    {
      q: 'Which active players are among AFCON’s top scorers?',
      a: 'Mohamed Salah and Sadio Mané are the leading active scorers in AFCON history, each on 11 goals and tied with legends like Didier Drogba and Patrick Mboma.',
    },
    {
      q: 'Where can I follow AFCON top scorers live?',
      a: 'TopScorers.com tracks goalscorer rankings across international and club competitions, including the Africa Cup of Nations, with standings, results and statistics.',
    },
  ],
})

export function getComp(slug: string): GoldenBootComp | undefined {
  return COMPETITIONS.find((c) => c.slug === slug)
}
