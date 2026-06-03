'use client'
import { useState, useEffect } from 'react'

interface Bio { title: string; extract: string; url: string; thumbnail?: string }

export default function BioPanel({ name, lang }: { name: string; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const [bio, setBio] = useState<Bio | null>(null)
  useEffect(() => {
    let cancel = false
    fetch(`/api/player-bio?name=${encodeURIComponent(name)}&lang=${lang}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && j.bio) setBio(j.bio) })
      .catch(() => {})
    return () => { cancel = true }
  }, [name, lang])

  if (!bio) return null
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {bio.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bio.thumbnail} alt={bio.title} width={64} height={64} loading="lazy"
          style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 6 }}>
          {en ? 'Biography' : 'Biografía'}
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--ts-text)' }}>{bio.extract}</p>
        <a href={bio.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--ts-primary)', textDecoration: 'none', fontWeight: 600 }}>
          {en ? 'Read more on Wikipedia →' : 'Leer más en Wikipedia →'}
        </a>
      </div>
    </div>
  )
}
