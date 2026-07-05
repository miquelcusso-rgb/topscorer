'use client'
import { useState, useEffect } from 'react'
import { notifyClubChange } from '@/lib/use-club-accent'
import { canonicalClubName } from '@/lib/club-colors'

// "Make this my team" on a team page — same localStorage 'ts-club' the sidebar
// typeahead uses, so the badge crest, workspace tint and home block update live.
// Shows the active state when this club is already the favourite. Author: Furiosa Studio.

const norm = (s: string) => canonicalClubName(s).toLowerCase()

export default function SetMyTeamButton({ club, lang }: { club: string; lang: string }) {
  const en = lang === 'en'
  const [mine, setMine] = useState(false)

  useEffect(() => {
    const read = () => { try { setMine(norm(localStorage.getItem('ts-club') ?? '') === norm(club)) } catch {} }
    read()
    window.addEventListener('ts-club-change', read)
    return () => window.removeEventListener('ts-club-change', read)
  }, [club])

  const toggle = () => {
    try {
      if (mine) localStorage.removeItem('ts-club')
      else localStorage.setItem('ts-club', club)
    } catch {}
    notifyClubChange()
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={mine}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '6px 14px',
        borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
        border: '1px solid var(--ts-border)',
        background: mine ? 'var(--ts-primary)' : 'var(--ts-card2)',
        color: mine ? '#1a1a1a' : 'var(--ts-text)' }}>
      ★ {mine ? (en ? 'My team' : 'Mi equipo') : (en ? 'Make my team' : 'Hacer mi equipo')}
    </button>
  )
}
