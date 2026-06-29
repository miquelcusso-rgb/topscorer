// Primary brand colour per club, for the PRO "my club" sidebar accent.
// Keyed by the club names used in the dataset. Extend as needed.
export const CLUB_COLORS: Record<string, string> = {
  'Real Madrid': '#febe10',
  'Barcelona': '#a50044',
  'Atletico Madrid': '#cb3524', 'Atlético Madrid': '#cb3524',
  'Sevilla': '#d51b22', 'Real Betis': '#00954c', 'Valencia': '#ee3524',
  'Athletic Club': '#ee2523', 'Real Sociedad': '#0067b1', 'Villarreal': '#ffe667',
  'Man City': '#6caddf', 'Manchester City': '#6caddf',
  'Manchester United': '#da291c', 'Man United': '#da291c',
  'Liverpool': '#c8102e', 'Arsenal': '#ef0107', 'Chelsea': '#034694',
  'Tottenham': '#132257', 'Newcastle': '#241f20', 'Aston Villa': '#95bfe5',
  'Bayern München': '#dc052d', 'Bayern Munich': '#dc052d',
  'Borussia Dortmund': '#fde100', 'Dortmund': '#fde100',
  'Bayer Leverkusen': '#e32219', 'RB Leipzig': '#dd0741', 'Stuttgart': '#e32219',
  'Inter': '#0068a8', 'AC Milan': '#fb090b', 'Milan': '#fb090b',
  'Juventus': '#000000', 'Napoli': '#0a9cda', 'Roma': '#8e1f2f', 'Lazio': '#87d8f7',
  'Atalanta': '#1d71b8', 'Fiorentina': '#592c82',
  'PSG': '#004170', 'Paris Saint Germain': '#004170', 'Monaco': '#e63329',
  'Marseille': '#2faee0', 'Lyon': '#1b3c8f',
  'Benfica': '#e30613', 'Porto': '#00428c', 'Sporting CP': '#008057',
  'Ajax': '#d2122e', 'PSV': '#ed1c24', 'Feyenoord': '#e30613',
  'Galatasaray': '#fbb000', 'Fenerbahçe': '#163962', 'Beşiktaş': '#000000',
  'Celtic': '#018749', 'Rangers': '#1b458f',
  'Inter Miami': '#f7b5cd', 'LA Galaxy': '#00245d',
  'Boca Juniors': '#0b3a6f', 'River Plate': '#e1101e',
  'Flamengo': '#e30613', 'Palmeiras': '#006437',
}

/** Resolve a club's accent colour, normalising a trailing reserve/age suffix. */
export function clubColor(club?: string): string | undefined {
  if (!club) return undefined
  if (CLUB_COLORS[club]) return CLUB_COLORS[club]
  const base = club.replace(/\s+(2|3|II|III|B|R|U\d{2}|\(R\))$/i, '').trim()
  return CLUB_COLORS[base]
}

/** Clubs that have a known colour, for the picker. */
// Canonical display name for a club, folding the accent / short-form variants
// the dataset and colour map carry for the SAME club (the source of the
// "Atletico Madrid" + "Atlético Madrid", "Bayern Munich" + "München", "PSG" +
// "Paris Saint Germain" duplicates). Keyed by accent-folded lowercase name.
const _normClub = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const CLUB_CANONICAL: Record<string, string> = {
  'atletico madrid': 'Atlético Madrid',
  'manchester city': 'Manchester City', 'man city': 'Manchester City',
  'manchester united': 'Manchester United', 'man united': 'Manchester United',
  'bayern munich': 'Bayern München', 'bayern munchen': 'Bayern München',
  'borussia dortmund': 'Borussia Dortmund', 'dortmund': 'Borussia Dortmund',
  'ac milan': 'AC Milan', 'milan': 'AC Milan',
  'paris saint germain': 'Paris Saint-Germain', 'paris saint-germain': 'Paris Saint-Germain', 'psg': 'Paris Saint-Germain',
  'inter milan': 'Inter', 'inter': 'Inter',
}

/** One canonical display name for a club, collapsing accent/short-form variants. */
export function canonicalClubName(club: string): string {
  return CLUB_CANONICAL[_normClub(club)] ?? club
}

/** Clubs that have a known colour, for the picker — deduped to ONE canonical
 *  name per club (no accent/short-form doubles), sorted. */
export function clubColorOptions(): { value: string; label: string }[] {
  const seen = new Set<string>()
  const out: { value: string; label: string }[] = []
  for (const c of Object.keys(CLUB_COLORS)) {
    const canon = canonicalClubName(c)
    const key = _normClub(canon)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ value: canon, label: canon })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}
