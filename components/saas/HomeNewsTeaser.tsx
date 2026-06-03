import Link from 'next/link'
import { getNews } from '@/lib/news'

function ago(iso: string, en: boolean): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return en ? 'just now' : 'ahora'
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return en ? `${d}d ago` : `hace ${d}d`
}

// Server component — top headlines teaser on the home, linking to /noticias.
export default async function HomeNewsTeaser({ lang }: { lang: 'es' | 'en' }) {
  const en = lang === 'en'
  let items: Awaited<ReturnType<typeof getNews>> = []
  try { items = (await getNews(lang, 'general', 6)).slice(0, 6) } catch { /* feeds down → hide */ }
  if (!items.length) return null

  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
          📰 {en ? 'Latest news' : 'Últimas noticias'}
        </span>
        <Link href={`/${lang}/noticias`} style={{ fontSize: 12, color: 'var(--ts-primary)', textDecoration: 'none', fontWeight: 600 }}>
          {en ? 'See all →' : 'Ver todo →'}
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
        {items.map((it, i) => (
          <a key={i} href={it.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--ts-hairline)', textDecoration: 'none' }}>
            {it.isPriority && <span style={{ color: 'var(--ts-primary)', fontSize: 10 }}>●</span>}
            <span style={{ fontSize: 13, color: 'var(--ts-text)', lineHeight: 1.35, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {it.title}
            </span>
            <span style={{ fontSize: 10, color: 'var(--ts-faint)', whiteSpace: 'nowrap' }}>{it.source} · {ago(it.date, en)}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
