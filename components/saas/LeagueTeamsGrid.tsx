import Link from 'next/link'
import type { Lang } from '@/lib/i18n'
import type { TeamIndexEntry } from '@/data/teams-index'
import { teamSlug } from '@/lib/team-data'

// A grid of a league's teams (from the canonical teams index), each linking to
// its /equipo/<slug> page. Used on league pages — the whole squad view for a
// division. Server component, brand --ts-* tokens. Author: Furiosa Studio.

export default function LeagueTeamsGrid({
  teams, lang, title,
}: { teams: TeamIndexEntry[]; lang: Lang; title?: string }) {
  if (!teams.length) return null
  const en = lang === 'en'
  return (
    <section style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 14 }}>
        {title ?? (en ? `Teams · ${teams.length}` : `Equipos · ${teams.length}`)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {teams.map(t => (
          <Link key={t.teamId} href={`/${lang}/equipo/${teamSlug(t.name)}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', minHeight: 44, borderRadius: 10,
              background: 'var(--ts-card2)', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.logo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={t.logo} alt="" width={26} height={26} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span aria-hidden style={{ fontSize: 15 }}>🛡️</span>}
            </div>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
