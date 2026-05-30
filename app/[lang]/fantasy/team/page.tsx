import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import FantasyTeamEditor from './FantasyTeamEditor'

type Props = { params: Promise<{ lang: string }> }

export default async function FantasyTeamPage({ params }: Props) {
  const { lang } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/${lang}/sign-in?redirect_url=/${lang}/fantasy/team`)

  const sb = createServerClient()
  const { data: existing } = await sb
    .from('fantasy_teams')
    .select('team_name, fantasy_team_picks(player_slug, player_name, slot, captain)')
    .eq('clerk_id', userId)
    .eq('season', '2526')
    .maybeSingle()

  // Eligible players: current season, ranked by goals desc (top 200).
  const eligible = PLAYERS
    .filter(p => p.season === '2526')
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 200)
    .map(p => ({ slug: slugify(p.name), name: p.name, club: p.club, league: p.league, goals: p.goles, assists: p.asist }))

  return (
    <FantasyTeamEditor
      lang={lang}
      initialTeamName={existing?.team_name ?? ''}
      initialPicks={(existing?.fantasy_team_picks as unknown as Array<{ player_slug: string; player_name: string; slot: number; captain: boolean }>) ?? []}
      eligible={eligible}
    />
  )
}
