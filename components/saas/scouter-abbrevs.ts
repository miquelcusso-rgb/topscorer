// Shared (server + client safe) source of truth for the Scouter table's column
// abbreviations + the "What is IIG?" FAQ. Lives outside any 'use client'
// component so server pages can import the FAQ source to build FAQPage JSON-LD
// from the EXACT same text the client renders (citable in both DOM + schema).
//
// ADDITIVE only — these pages stay free, indexable and ungated.

import { IIG_NAME, IIG_EXPLAINER } from '@/lib/iig'

export type Lang = 'es' | 'en'

export interface Abbrev {
  /** The short token shown in the table header / UI. */
  abbr: string
  /** Full localised name. */
  term: Record<Lang, string>
  /** One-line localised definition (used in tooltip + legend). */
  def: Record<Lang, string>
}

/** The abbreviations used across the Scouter Top-20 table, in display order. */
export const SCOUTER_ABBREVS: Abbrev[] = [
  {
    abbr: 'IIG',
    term: { es: IIG_NAME.es, en: IIG_NAME.en },
    def: {
      es: 'Índice de Impacto del Goleador (Furiosa Studio): goles × fuerza de la liga + nota + asistencias. Solo stats reales.',
      en: 'Goal Impact Index (Furiosa Studio): goals × league strength + rating + assists. Real stats only.',
    },
  },
  {
    abbr: 'Rating',
    term: { es: 'Nota', en: 'Rating' },
    def: {
      es: 'Nota media de rendimiento.',
      en: 'Average performance rating.',
    },
  },
  {
    abbr: 'G',
    term: { es: 'Goles', en: 'Goals' },
    def: { es: 'Goles.', en: 'Goals.' },
  },
  {
    abbr: 'A',
    term: { es: 'Asistencias', en: 'Assists' },
    def: { es: 'Asistencias.', en: 'Assists.' },
  },
  {
    abbr: 'MP',
    term: { es: 'Partidos jugados', en: 'Matches played' },
    def: { es: 'Partidos jugados.', en: 'Matches played.' },
  },
]

/** Quick lookup of the localised definition for an abbr (for tooltips). */
export const abbrevDef = (abbr: string, lang: Lang): string => {
  const a = SCOUTER_ABBREVS.find((x) => x.abbr === abbr)
  return a ? a.def[lang] : abbr
}

export interface ScouterFaq { q: string; a: string }

/** "What is IIG?" FAQ — self-contained + citable. High-level on the formula (no
 *  secret sauce), why it beats raw goals, and that it's free. `leagueName`
 *  makes the per-league page answers concrete. */
export function iigFaqs(lang: Lang, leagueName?: string): ScouterFaq[] {
  const en = lang === 'en'
  const inLeague = leagueName ? (en ? ` in ${leagueName}` : ` de ${leagueName}`) : ''
  return [
    {
      q: en ? 'What is the IIG?' : '¿Qué es el IIG?',
      a: en
        ? `IIG stands for Goal Impact Index (Índice de Impacto del Goleador), a metric built by Furiosa Studio for TopScorers. It ranks the best players${inLeague} by combining their goals — weighted by how hard their league is — with their average rating and assists. It is built only from real season stats, nothing invented.`
        : `IIG son las siglas de Índice de Impacto del Goleador, una métrica creada por Furiosa Studio para TopScorers. Ordena a los mejores jugadores${inLeague} combinando sus goles —ponderados por la dificultad de su liga— con su nota media y sus asistencias. Se calcula solo con estadísticas reales de la temporada, nada inventado.`,
    },
    {
      q: en ? 'How is the IIG calculated?' : '¿Cómo se calcula el IIG?',
      a: en
        ? 'At a high level: goals weighted by league difficulty + average performance rating + assists. ' + IIG_EXPLAINER.en + ' Every input is a real, public season stat — no per-match guesswork.'
        : 'A grandes rasgos: goles ponderados por la dificultad de la liga + nota media de rendimiento + asistencias. ' + IIG_EXPLAINER.es + ' Cada dato de entrada es una estadística real y pública de la temporada, sin invenciones.',
    },
    {
      q: en ? 'Why is the IIG better than counting raw goals?' : '¿Por qué el IIG es mejor que contar solo los goles?',
      a: en
        ? 'A goal in a Top-5 league is harder than one in a weaker competition, so the IIG weights goals by league strength and then adds overall match quality (rating) and creativity (assists). That surfaces the most impactful players across leagues, not just whoever scored the most in the easiest division.'
        : 'Un gol en una liga Top-5 vale más que uno en una competición más débil, por eso el IIG pondera los goles por la fuerza de la liga y suma además la calidad global (nota) y la creación de juego (asistencias). Así destaca a los jugadores con más impacto entre distintas ligas, no solo a quien más marcó en la división más fácil.',
    },
    {
      q: en ? 'Is the Scouter ranking free?' : '¿El ranking Scouter es gratis?',
      a: en
        ? 'Yes. The Scouter Top-20 leaderboards and the IIG index are completely free to read — no login or subscription required.'
        : 'Sí. Los rankings Scouter Top-20 y el índice IIG son totalmente gratuitos —no hace falta registrarse ni suscribirse.',
    },
  ]
}
