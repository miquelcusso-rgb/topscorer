import type { BracketRound } from '@/components/Brackets'

// Static bracket data. Replace with API-Football fixtures pipeline later.

export const UCL_2425: BracketRound[] = [
  {
    label: 'Round of 16',
    matches: [
      { id: 'r1', home: { name: 'Real Madrid', short: 'RMA', score: 5, winner: true }, away: { name: 'Atlético Madrid', short: 'ATM', score: 2 }, meta: 'Mar · agg' },
      { id: 'r2', home: { name: 'Bayer Leverkusen', short: 'B04', score: 2 }, away: { name: 'Bayern München', short: 'BAY', score: 5, winner: true }, meta: 'Mar' },
      { id: 'r3', home: { name: 'PSV', short: 'PSV', score: 1 }, away: { name: 'Arsenal', short: 'ARS', score: 9, winner: true }, meta: 'Mar' },
      { id: 'r4', home: { name: 'Real Betis', short: 'BET', score: 0 }, away: { name: 'Borussia Dortmund', short: 'BVB', score: 4, winner: true }, meta: 'Mar' },
      { id: 'r5', home: { name: 'PSG', short: 'PSG', score: 4, winner: true }, away: { name: 'Liverpool', short: 'LIV', score: 1 }, meta: 'Mar' },
      { id: 'r6', home: { name: 'Inter', short: 'INT', score: 4, winner: true }, away: { name: 'Feyenoord', short: 'FEY', score: 1 }, meta: 'Mar' },
      { id: 'r7', home: { name: 'Aston Villa', short: 'AVL', score: 6, winner: true }, away: { name: 'Club Brugge', short: 'CLB', score: 1 }, meta: 'Mar' },
      { id: 'r8', home: { name: 'Lille', short: 'LIL', score: 2 }, away: { name: 'Dortmund 2', short: '—', score: 3, winner: true }, meta: 'Mar' },
    ],
  },
  {
    label: 'Quarter-final',
    matches: [
      { id: 'q1', home: { name: 'Real Madrid', short: 'RMA', winner: true, score: 2 }, away: { name: 'Arsenal', short: 'ARS', score: 5 }, meta: 'Apr' },
      { id: 'q2', home: { name: 'Bayern', short: 'BAY' }, away: { name: 'Inter', short: 'INT', winner: true }, meta: 'Apr' },
      { id: 'q3', home: { name: 'PSG', short: 'PSG', winner: true }, away: { name: 'Aston Villa', short: 'AVL' }, meta: 'Apr' },
      { id: 'q4', home: { name: 'Borussia Dortmund', short: 'BVB' }, away: { name: 'Barcelona', short: 'BAR', winner: true }, meta: 'Apr' },
    ],
  },
  {
    label: 'Semi-final',
    matches: [
      { id: 's1', home: { name: 'Arsenal', short: 'ARS' }, away: { name: 'PSG', short: 'PSG', winner: true }, meta: 'Apr/May' },
      { id: 's2', home: { name: 'Inter', short: 'INT', winner: true }, away: { name: 'Barcelona', short: 'BAR' }, meta: 'Apr/May' },
    ],
  },
  {
    label: 'Final',
    matches: [
      { id: 'f', home: { name: 'PSG', short: 'PSG', winner: true, score: 5 }, away: { name: 'Inter', short: 'INT', score: 0 }, meta: '31 May · Munich' },
    ],
  },
]

export const TOURNAMENTS: Record<string, { name: string; rounds: BracketRound[] }> = {
  'champions-league-2425': { name: 'UEFA Champions League 2024/25', rounds: UCL_2425 },
}
