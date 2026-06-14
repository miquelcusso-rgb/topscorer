// Shared (server + client safe) World Cup constants + helpers.
// Extracted from the former monolithic Mundial2026Client so every WC route page
// and panel reuses the SAME data/logic — no duplication.

export type Lang = 'es' | 'en'

export const t = (lang: Lang, es: string, en: string) => (lang === 'en' ? en : es)

// ─── Country → flag emoji ─────────────────────────────────────────────────────
// Small inline map covering the qualified / likely WC 2026 nations referenced on
// this page (groups + favourites + venues). Used to make the page more visual.
const FLAG: Record<string, string> = {
  Qatar: '🇶🇦', Ecuador: '🇪🇨', Senegal: '🇸🇳', Netherlands: '🇳🇱',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Iran: '🇮🇷', USA: '🇺🇸', Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  Argentina: '🇦🇷', 'Saudi Arabia': '🇸🇦', Mexico: '🇲🇽', Poland: '🇵🇱',
  France: '🇫🇷', Australia: '🇦🇺', Denmark: '🇩🇰', Tunisia: '🇹🇳',
  Spain: '🇪🇸', 'Costa Rica': '🇨🇷', Germany: '🇩🇪', Japan: '🇯🇵',
  Belgium: '🇧🇪', Canada: '🇨🇦', Morocco: '🇲🇦', Croatia: '🇭🇷',
  Brazil: '🇧🇷', Serbia: '🇷🇸', Switzerland: '🇨🇭', Cameroon: '🇨🇲',
  Portugal: '🇵🇹', Ghana: '🇬🇭', Uruguay: '🇺🇾', 'South Korea': '🇰🇷',
  Italy: '🇮🇹', Colombia: '🇨🇴', Egypt: '🇪🇬',
  Chile: '🇨🇱', Austria: '🇦🇹', Algeria: '🇩🇿',
  'New Zealand': '🇳🇿', 'Ivory Coast': '🇨🇮', Iraq: '🇮🇶',
  Peru: '🇵🇪', Slovenia: '🇸🇮',
}
export const flagOf = (country: string): string => FLAG[country] ?? '🏳️'

// ─── Static WC 2026 data ──────────────────────────────────────────────────────

export const VENUES = [
  { city: 'New York/New Jersey', stadium: 'MetLife Stadium', country: 'USA', capacity: '82,500', final: true },
  { city: 'Los Angeles', stadium: 'SoFi Stadium', country: 'USA', capacity: '70,240', final: false },
  { city: 'Dallas', stadium: 'AT&T Stadium', country: 'USA', capacity: '80,000', final: false },
  { city: 'San Francisco', stadium: 'Levi\'s Stadium', country: 'USA', capacity: '68,500', final: false },
  { city: 'Miami', stadium: 'Hard Rock Stadium', country: 'USA', capacity: '64,767', final: false },
  { city: 'Seattle', stadium: 'Lumen Field', country: 'USA', capacity: '69,000', final: false },
  { city: 'Boston', stadium: 'Gillette Stadium', country: 'USA', capacity: '65,878', final: false },
  { city: 'Philadelphia', stadium: 'Lincoln Financial Field', country: 'USA', capacity: '69,176', final: false },
  { city: 'Kansas City', stadium: 'Arrowhead Stadium', country: 'USA', capacity: '76,416', final: false },
  { city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', country: 'USA', capacity: '71,000', final: false },
  { city: 'Houston', stadium: 'NRG Stadium', country: 'USA', capacity: '72,220', final: false },
  { city: 'Toronto', stadium: 'BMO Field', country: 'Canada', capacity: '30,000', final: false },
  { city: 'Vancouver', stadium: 'BC Place', country: 'Canada', capacity: '54,500', final: false },
  { city: 'Guadalajara', stadium: 'Estadio Akron', country: 'Mexico', capacity: '49,850', final: false },
  { city: 'Ciudad de México', stadium: 'Estadio Azteca', country: 'Mexico', capacity: '87,523', final: false },
  { city: 'Monterrey', stadium: 'Estadio BBVA', country: 'Mexico', capacity: '53,500', final: false },
]

// Opening match: 11 Jun 2026, 19:00 local (Estadio Azteca, CDMX = UTC-6 → 01:00 UTC Jun 12).
export const KICKOFF = new Date('2026-06-12T01:00:00Z')
export const END_DATE = new Date('2026-07-19T23:59:00Z')

// Official FIFA-announced phase schedule for the 2026 World Cup. Individual
// match-by-match fixtures depend on the December 2025 draw; we show the
// confirmed phase windows + key milestones (real, public dates).
export const WC_SCHEDULE: { es: string; en: string; dates_es: string; dates_en: string; note_es?: string; note_en?: string; highlight?: boolean }[] = [
  { es: 'Partido inaugural', en: 'Opening match', dates_es: '11 jun 2026', dates_en: 'Jun 11, 2026', note_es: 'Estadio Azteca, Ciudad de México', note_en: 'Estadio Azteca, Mexico City', highlight: true },
  { es: 'Fase de grupos', en: 'Group stage', dates_es: '11 – 27 jun 2026', dates_en: 'Jun 11 – 27, 2026', note_es: '12 grupos × 4 · 72 partidos', note_en: '12 groups × 4 · 72 matches' },
  { es: 'Dieciseisavos (R32)', en: 'Round of 32', dates_es: '28 jun – 3 jul 2026', dates_en: 'Jun 28 – Jul 3, 2026' },
  { es: 'Octavos (R16)', en: 'Round of 16', dates_es: '4 – 7 jul 2026', dates_en: 'Jul 4 – 7, 2026' },
  { es: 'Cuartos de final', en: 'Quarter-finals', dates_es: '9 – 11 jul 2026', dates_en: 'Jul 9 – 11, 2026' },
  { es: 'Semifinales', en: 'Semi-finals', dates_es: '14 – 15 jul 2026', dates_en: 'Jul 14 – 15, 2026' },
  { es: 'Tercer puesto', en: 'Third place', dates_es: '18 jul 2026', dates_en: 'Jul 18, 2026' },
  { es: 'FINAL', en: 'FINAL', dates_es: '19 jul 2026', dates_en: 'Jul 19, 2026', note_es: 'MetLife Stadium, Nueva York/Nueva Jersey', note_en: 'MetLife Stadium, New York/New Jersey', highlight: true },
]
