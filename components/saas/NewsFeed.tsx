'use client'
import { useState, useEffect } from 'react'

interface NewsItem { title: string; link: string; source: string; date: string; image?: string; isPriority?: boolean }

function dayBucket(iso: string, en: boolean): string {
  const d = new Date(iso), now = new Date()
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day(now) - day(d)) / 86400000)
  if (diff <= 0) return en ? 'Today' : 'Hoy'
  if (diff === 1) return en ? 'Yesterday' : 'Ayer'
  return d.toLocaleDateString(en ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
const fmtTime = (iso: string, en: boolean) => new Date(iso).toLocaleTimeString(en ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })

export default function NewsFeed({ scope = 'general', lang }: { scope?: 'general' | 'worldcup'; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancel = false
    fetch(`/api/news?lang=${lang}&scope=${scope}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setItems(j.items ?? []) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [lang, scope])

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--ts-faint)' }}>{en ? 'Loading news…' : 'Cargando noticias…'}</div>
  if (!items.length) return <div style={{ padding: '24px 0', fontSize: 13, color: 'var(--ts-muted)' }}>{en ? 'No news right now.' : 'Sin noticias ahora mismo.'}</div>

  // Group consecutive items by day bucket (items already sorted newest-first).
  const groups: { label: string; items: NewsItem[] }[] = []
  for (const it of items) {
    const label = dayBucket(it.date, en)
    let g = groups.find(x => x.label === label)
    if (!g) { g = { label, items: [] }; groups.push(g) }
    g.items.push(it)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map(g => (
        <div key={g.label}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {g.label}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {g.items.map((it, i) => (
              <a
                key={i}
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', gap: 12, padding: 10, background: 'var(--ts-card)',
                  border: '1px solid var(--ts-border)', borderRadius: 10, textDecoration: 'none', color: 'inherit', minWidth: 0,
                }}
              >
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" width={84} height={64} loading="lazy" style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: 'var(--ts-card2)' }} />
                )}
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {it.isPriority && <span style={{ color: 'var(--ts-primary)' }}>★ </span>}{it.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{it.source} · {fmtTime(it.date, en)}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {en ? 'Headlines via public RSS — tap to read at the source.' : 'Titulares vía RSS público — pulsa para leer en la fuente.'}
      </p>
    </div>
  )
}
