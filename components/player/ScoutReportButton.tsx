'use client'
import { useUser } from '@clerk/nextjs'
import type { Plan } from '@/types'

// Scout-only: download this player's PDF scouting report (/api/scout/report).
// Non-Scout users see nothing (the IIG-breakdown card above already upsells).
export default function ScoutReportButton({ slug, lang }: { slug: string; lang: 'es' | 'en' }) {
  const { user, isLoaded } = useUser()
  const isScout = isLoaded && user && (user.publicMetadata?.plan as Plan) === 'scout'
  if (!isScout) return null
  const en = lang === 'en'
  return (
    <a href={`/api/scout/report?slug=${encodeURIComponent(slug)}`} target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '8px 14px', borderRadius: 999, background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
      ⬇ {en ? 'Scout report (PDF)' : 'Informe scout (PDF)'} <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--ts-primary)' }}>SCOUT</span>
    </a>
  )
}
