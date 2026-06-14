'use client'

import { useLang } from '@/contexts/LangContext'
import NewsFeed from '@/components/saas/NewsFeed'

// ─── News panel (Noticias) ────────────────────────────────────────────────────
// Thin wrapper so the route page can render the shared NewsFeed with the WC scope
// while reading the active locale from context (same as every other WC panel).

export default function NewsPanel() {
  const { lang } = useLang()
  return <NewsFeed scope="worldcup" lang={lang} />
}
