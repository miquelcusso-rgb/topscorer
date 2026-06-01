// Short vs. full display names for players.
// `name` in PlayerData is the short/working name (what listings use).
// `fullName(player)` looks up an explicit full name where we know it (headliners),
// otherwise falls back to the short name. (audit pass 1)

import type { PlayerData } from '@/types'
import { PLAYERS } from '@/data/players'

// Known full names for headliner players. Add more as needed.
const KNOWN_FULL_NAMES: Record<string, string> = {
  'Kylian Mbappe':        'Kylian Mbappé Lottin',
  'Lionel Messi':         'Lionel Andrés Messi Cuccittini',
  'L. Messi':             'Lionel Andrés Messi Cuccittini',
  'Cristiano Ronaldo':    'Cristiano Ronaldo dos Santos Aveiro',
  'Erling Haaland':       'Erling Braut Haaland',
  'Vinicius Junior':      'Vinícius José Paixão de Oliveira Júnior',
  'Lamine Yamal':         'Lamine Yamal Nasraoui Ebana',
  'Harry Kane':           'Harry Edward Kane',
  'Mohamed Salah':        'Mohamed Salah Hamed Mahrous Ghaly',
  'Robert Lewandowski':   'Robert Lewandowski',
  'Pedri':                'Pedro González López',
  'Rodrygo':              'Rodrygo Silva de Goes',
  'Raphinha':             'Raphael Dias Belloli',
  'Bukayo Saka':          'Bukayo Ayoyinka Temidayo Saka',
  'Cole Palmer':          'Cole Jermaine Palmer',
  'Florian Wirtz':        'Florian Richard Wirtz',
  'Bruno Fernandes':      'Bruno Miguel Borges Fernandes',
  'Lautaro Martinez':     'Lautaro Javier Martínez',
  'Julian Alvarez':       'Julián Álvarez',
  'Antoine Griezmann':    'Antoine Griezmann',
  'Achraf Hakimi':        'Achraf Hakimi Mouh',
  'Khvicha Kvaratskhelia':'Khvicha Kvaratskhelia',
  'Ousmane Dembele':      'Masour Ousmane Dembélé',
  'Federico Dimarco':     'Federico Dimarco',
  'Marcus Thuram':        'Marcus Lilian Thuram-Ulien',
  'Trent Alexander-Arnold':'Trent John Alexander-Arnold',
  'Mikel Oyarzabal':      'Mikel Oyarzabal Ugarte',
  'Ferran Torres':        'Ferran Torres García',
  'Alejandro Grimaldo':   'Alejandro Grimaldo García',
  'Dani Olmo':            'Daniel Olmo Carvajal',
  'Kai Havertz':          'Kai Lukas Havertz',
  'Alex Baena':           'Álex Baena Rodríguez',
  'Alvaro Morata':        'Álvaro Borja Morata Martín',
}

// Known short / display names. If a row's `name` comes from the generated
// dataset as a full string (e.g. "Lionel Andrés Messi Cuccittini"), we display
// a compact version in listings.
const KNOWN_SHORT_NAMES: Record<string, string> = {
  'Lionel Andrés Messi Cuccittini': 'Leo Messi',
  'L. Messi':                       'Leo Messi',
  'Lionel Messi':                   'Leo Messi',
  'Cristiano Ronaldo dos Santos Aveiro': 'Cristiano Ronaldo',
  'Vinícius José Paixão de Oliveira Júnior': 'Vinícius Jr.',
  'Vinicius Junior':                'Vinícius Jr.',
  'Lamine Yamal Nasraoui Ebana':    'Lamine Yamal',
  'Kylian Mbappé Lottin':           'Kylian Mbappé',
  'Kylian Mbappe':                  'Kylian Mbappé',
}

type NameInput = PlayerData | { name: string }

export function shortName(player: NameInput): string {
  const raw = player.name
  return KNOWN_SHORT_NAMES[raw] ?? raw
}

export function fullName(player: NameInput): string {
  const raw = player.name
  // If the raw name is already a long-form string we recognise, return it.
  if (Object.values(KNOWN_FULL_NAMES).includes(raw)) return raw
  return KNOWN_FULL_NAMES[raw] ?? raw
}

/** Returns the full name *only if* it differs from the short name — useful for
 * conditionally rendering a subtitle line on the profile page. */
export function fullNameIfDifferent(player: NameInput): string | null {
  const s = shortName(player)
  const f = fullName(player)
  return f && f !== s ? f : null
}

// ─── Photo lookup by name (case/diacritic-insensitive) ───────────────────────

/** Case + diacritic-insensitive normalization for name matching. */
function normName(s: string): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.'’-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Built once: normalized player name → photo URL. Only players that actually
// carry a photo are indexed. Both the raw name and its known short/full
// aliases are keyed so an external feed using either form still matches.
let PHOTO_INDEX: Map<string, string> | null = null
function photoIndex(): Map<string, string> {
  if (PHOTO_INDEX) return PHOTO_INDEX
  const idx = new Map<string, string>()
  for (const p of PLAYERS) {
    if (!p.photo) continue
    const keys = new Set([p.name, shortName(p), fullName(p)].map(normName))
    for (const k of keys) {
      if (k && !idx.has(k)) idx.set(k, p.photo)
    }
  }
  PHOTO_INDEX = idx
  return idx
}

/**
 * Finds a player photo URL by name from the static PLAYERS dataset, matching
 * case/diacritic-insensitively (and against known short/full-name aliases).
 * Returns undefined if no dataset player with a photo matches. Pure aside from
 * a lazily-built, memoized index.
 */
export function photoForName(name?: string | null): string | undefined {
  if (!name) return undefined
  return photoIndex().get(normName(name))
}
