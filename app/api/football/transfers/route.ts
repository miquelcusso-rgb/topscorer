import { NextRequest } from 'next/server'
import { getTransfersByTeam } from '@/lib/api-football'
import { photoForName } from '@/lib/player-name'

export const revalidate = 3600

// Top teams by league (team IDs from API-Football)
const TOP_TEAMS: Record<string, number[]> = {
  'La Liga':        [529, 530, 541, 532, 533],  // Real Madrid, Atletico, Barcelona, Valencia, Villarreal
  'Premier League': [33, 40, 42, 49, 50],        // Man United, Liverpool, Arsenal, Chelsea, Man City
  'Bundesliga':     [157, 165, 168, 169, 173],   // Bayern, Dortmund, Leipzig, Leverkusen, Frankfurt
  'Serie A':        [489, 492, 496, 499, 505],   // AC Milan, Juventus, Napoli, Roma, Inter
  'Ligue 1':        [85, 81, 91, 80, 93],        // PSG, Marseille, Lille, Lyon, Nantes
}

export async function GET(req: NextRequest) {
  const league = req.nextUrl.searchParams.get('league') ?? 'La Liga'
  const teamIds = TOP_TEAMS[league] ?? TOP_TEAMS['La Liga']

  try {
    const results = await Promise.all(teamIds.map(id => getTransfersByTeam(id)))

    // Flatten and get transfers from current year or previous year
    const currentYear = new Date().getFullYear()
    const transfers = results
      .flat()
      .flatMap(t => t.transfers.map(tr => ({
        // Backfill the player photo from the static PLAYERS dataset whenever the
        // API-Football /transfers feed returns an empty/missing photo (it often
        // does). Matched case/diacritic-insensitively by name. Falls through to
        // the feed value (or '') when the player isn't in our dataset — the UI
        // then renders an Avatar initials fallback.
        player: {
          ...t.player,
          // 1) feed photo → 2) static dataset by name → 3) derive from the
          // API-Football player id (media URLs are predictable: …/players/<id>.png),
          // which recovers most players the feed/dataset miss (Morata, Saravia…).
          photo: t.player.photo || photoForName(t.player.name)
            || (t.player.id ? `https://media.api-sports.io/football/players/${t.player.id}.png` : ''),
        },
        ...tr,
      })))
      .filter(t => t.date.startsWith(String(currentYear)) || t.date.startsWith(String(currentYear - 1)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50)

    return Response.json({ ok: true, data: transfers, league })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
