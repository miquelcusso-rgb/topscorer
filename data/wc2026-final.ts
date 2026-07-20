// FIFA World Cup 2026 — FINAL outcome, hand-curated from the official result
// (19-jul-2026, MetLife Stadium). The tournament is OVER: this data never
// changes, so it lives in the repo instead of burning api-football quota.
// Sources: FIFA match centre + major outlets, captured 20-jul-2026.

export const WC_FINAL = {
  championApi: 'Spain',            // api-football team name (→ wcNationSlugFor)
  champion: { es: 'España', en: 'Spain', flag: '🇪🇸' },
  runnerUp: { es: 'Argentina', en: 'Argentina', flag: '🇦🇷' },
  score: { home: 1, away: 0, afterExtraTime: true },
  goal: { player: 'Ferran Torres', minute: 106 },
  date: '2026-07-19',
  venue: { es: 'MetLife Stadium, Nueva York/Nueva Jersey', en: 'MetLife Stadium, New York/New Jersey' },
  attendance: 80663,
  titles: { count: 2, previous: 2010 },
} as const

export const WC_AWARDS = [
  { key: 'boot',  icon: '🥇', es: 'Bota de Oro',    en: 'Golden Boot',       name: 'Kylian Mbappé', detail_es: '10 goles · Francia', detail_en: '10 goals · France', slug: 'kylian-mbappe' },
  { key: 'ball',  icon: '⚽', es: 'Balón de Oro',   en: 'Golden Ball',       name: 'Rodri',         detail_es: 'España',             detail_en: 'Spain' },
  { key: 'glove', icon: '🧤', es: 'Guante de Oro',  en: 'Golden Glove',      name: 'Unai Simón',    detail_es: '7 porterías a cero · España', detail_en: '7 clean sheets · Spain' },
  { key: 'young', icon: '🌟', es: 'Mejor joven',    en: 'Best Young Player', name: 'Pau Cubarsí',   detail_es: 'España',             detail_en: 'Spain' },
] as const

/** Match-summary prose for the final — data-grounded, no invented events. */
export function wcFinalSummary(lang: 'es' | 'en'): string[] {
  if (lang === 'en') {
    return [
      'Spain are world champions for the second time. In the first World Cup final ever played in the United States, La Roja beat Argentina 1–0 after extra time at MetLife Stadium, in front of 80,663 fans. Ferran Torres struck the winner in the 106th minute, finishing off the possession game that carried Spain through the whole tournament.',
      'Argentina, defending champions, leaned on an inspired Emiliano Martínez — his 11 saves set a record for a World Cup final — but barely threatened Spain\'s goal across 120 minutes. The title crowns a golden generation: Spain add the 2026 trophy to their 2010 crown and their Euro 2024 title, and swept the individual awards — Rodri (Golden Ball), Unai Simón (Golden Glove) and Pau Cubarsí (Best Young Player), with France\'s Kylian Mbappé taking the Golden Boot on 10 goals.',
    ]
  }
  return [
    'España es campeona del mundo por segunda vez. En la primera final de un Mundial disputada en Estados Unidos, La Roja venció 1–0 a Argentina en la prórroga en el MetLife Stadium, ante 80.663 espectadores. Ferran Torres marcó el gol del título en el minuto 106, culminando el juego de posesión que sostuvo a España durante todo el torneo.',
    'Argentina, vigente campeona, se agarró a un inspirado Emiliano Martínez — sus 11 paradas son récord en una final de Mundial — pero apenas inquietó la portería española en 120 minutos. El título corona a una generación de oro: España suma la copa de 2026 a la de 2010 y a la Eurocopa 2024, y arrasó en los premios individuales — Rodri (Balón de Oro), Unai Simón (Guante de Oro) y Pau Cubarsí (Mejor Joven), con la Bota de Oro para el francés Kylian Mbappé con 10 goles.',
  ]
}
