import { createServerClient } from './supabase'

export interface HomeRumor {
  id: string
  headline: string
  fromClub: string | null
  toClub: string | null
  likelihood: number | null
}

// Top active rumour for the home "Rumor del día" card. Fetched at build (home
// is force-static). Fully defensive: ANY error → null, so the build never
// breaks and the home simply omits the card. Refreshed on each deploy + the
// weekly data cron.
export async function getTopRumor(lang: 'es' | 'en'): Promise<HomeRumor | null> {
  try {
    const sb = createServerClient()
    const { data, error } = await sb
      .from('rumors')
      .select('id, headline_es, headline_en, from_club, to_club, likelihood')
      .eq('is_active', true)
      .order('likelihood', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    const headline = (lang === 'en' ? data.headline_en : data.headline_es) || data.headline_es || data.headline_en
    if (!headline) return null
    return {
      id: String(data.id),
      headline,
      fromClub: data.from_club ?? null,
      toClub: data.to_club ?? null,
      likelihood: typeof data.likelihood === 'number' ? data.likelihood : null,
    }
  } catch {
    return null
  }
}
