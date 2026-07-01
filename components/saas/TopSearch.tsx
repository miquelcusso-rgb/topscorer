'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import Avatar from './Avatar'
import CrestImg from './CrestImg'
import type { SearchPlayerHit, SearchLeagueHit, SearchClubHit } from '@/app/api/search/route'

interface Props {
  placeholder?: string
}

// Curated "hot topics of the day". Items with `href` navigate; the rest prefill
// the search box (so the normal player/team search resolves them).
interface HotTopic { label: string; href?: (lang: string) => string }
const HOT_TOPICS: HotTopic[] = [
  { label: 'World Cup 2026', href: l => `/${l}/mundial-2026` },
  { label: 'Champions League', href: l => `/${l}/competiciones/champions-league` },
  { label: 'Haaland' },
  { label: 'Lamine Yamal' },
  { label: 'Mbappé' },
  { label: 'Real Madrid' },
  { label: 'Barcelona' },
  { label: 'PSG' },
  { label: 'Man City' },
  { label: 'Liverpool' },
  { label: 'Arsenal' },
  { label: 'Bayern' },
  { label: 'Bota de Oro', href: l => `/${l}/bota-de-oro` },
  { label: 'Transferencias', href: l => `/${l}/transferencias` },
]

export default function TopSearch({ placeholder }: Props) {
  const { lang } = useLang()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState<SearchPlayerHit[]>([])
  const [clubs, setClubs] = useState<SearchClubHit[]>([])
  const [leagues, setLeagues] = useState<SearchLeagueHit[]>([])
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const ph = placeholder ?? (lang === 'en' ? 'Search player, team, league…' : 'Buscar jugador, equipo, liga…')

  // Flat list of navigable results (clubs → leagues → players) for arrow keys.
  const items: { href: string; key: string }[] = [
    ...clubs.map(c => ({ href: `/${lang}/equipo/${c.slug}`, key: 'c' + c.name })),
    ...leagues.map(l => ({ href: `/${lang}/competiciones/${l.slug}`, key: 'l' + l.slug })),
    ...players.map(p => ({ href: `/${lang}/jugadores/${p.slug}`, key: 'p' + p.slug })),
  ]

  // Debounced fetch.
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setPlayers([]); setClubs([]); setLeagues([]); return }
    let cancel = false
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
        const data = await res.json()
        if (cancel) return
        setPlayers(data.players ?? [])
        setClubs(data.clubs ?? [])
        setLeagues(data.leagues ?? [])
        setActive(0)
      } catch { /* ignore */ }
    }, 150)
    return () => { cancel = true; clearTimeout(t) }
  }, [q])

  // ⌘K / Ctrl+K to focus.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Click outside closes.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const go = useCallback((href: string) => {
    setOpen(false)
    setQ('')
    setPlayers([])
    setClubs([])
    setLeagues([])
    inputRef.current?.blur()
    router.push(href)
  }, [router])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return }
    if (!items.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % items.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + items.length) % items.length) }
    else if (e.key === 'Enter') { e.preventDefault(); const it = items[active]; if (it) go(it.href) }
  }

  const hasResults = items.length > 0
  const emptyFocus = open && q.trim().length === 0
  const showDropdown = (open && q.trim().length >= 2) || emptyFocus

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
          background: 'var(--ts-card2)', border: '1px solid var(--ts-border)',
          borderRadius: 8, fontSize: 13, color: 'var(--ts-muted)',
        }}
      >
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
          <circle cx={6} cy={6} r={4.5} />
          <path d="M12.5 12.5l-3-3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={ph}
          aria-label={ph}
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--ts-text)', fontFamily: 'inherit', fontSize: 13,
          }}
        />
        <kbd
          style={{
            marginLeft: 'auto', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10,
            padding: '1px 5px', background: 'var(--ts-surface)', borderRadius: 3,
            color: 'var(--ts-faint)', border: '1px solid var(--ts-border)', flexShrink: 0,
          }}
        >
          ⌘K
        </kbd>
      </div>

      {showDropdown && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,.18)', overflow: 'hidden', maxHeight: 420, overflowY: 'auto',
          }}
        >
          {emptyFocus && (
            <div>
              <div style={SECTION_STYLE}>🔥 {lang === 'en' ? 'Trending today' : 'Tendencias de hoy'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 12px 12px' }}>
                {HOT_TOPICS.map(t => (
                  <button key={t.label} type="button"
                    onClick={() => { if (t.href) go(t.href(lang)); else { setQ(t.label); inputRef.current?.focus() } }}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 11px', borderRadius: 999,
                      background: 'var(--ts-card2)', border: '1px solid var(--ts-border)',
                      color: 'var(--ts-text)', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!emptyFocus && !hasResults && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--ts-muted)' }}>
              {lang === 'en' ? 'No matches.' : 'Sin resultados.'}
            </div>
          )}

          {clubs.length > 0 && (
            <div>
              <div style={SECTION_STYLE}>{lang === 'en' ? 'Teams' : 'Equipos'}</div>
              {clubs.map((c, i) => {
                const idx = i
                return (
                  <button key={'c' + c.name} type="button" onMouseEnter={() => setActive(idx)}
                    onClick={() => go(`/${lang}/equipo/${c.slug}`)} style={rowStyle(active === idx)}>
                    {c.crest
                      ? <CrestImg src={c.crest} alt={c.name} size={24} />
                      : <span style={{ width: 24, textAlign: 'center', fontSize: 14 }}>🛡️</span>}
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{c.league}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {leagues.length > 0 && (
            <div>
              <div style={SECTION_STYLE}>{lang === 'en' ? 'Leagues' : 'Ligas'}</div>
              {leagues.map((l, i) => {
                const idx = clubs.length + i
                return (
                  <button key={'l' + l.slug} type="button" onMouseEnter={() => setActive(idx)}
                    onClick={() => go(`/${lang}/competiciones/${l.slug}`)} style={rowStyle(active === idx)}>
                    <span style={{ width: 28, textAlign: 'center', fontSize: 14 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)' }}>{l.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          {players.length > 0 && (
            <div>
              <div style={SECTION_STYLE}>{lang === 'en' ? 'Players' : 'Jugadores'}</div>
              {players.map((p, i) => {
                const idx = clubs.length + leagues.length + i
                return (
                  <button key={'p' + p.slug} type="button" onMouseEnter={() => setActive(idx)}
                    onClick={() => go(`/${lang}/jugadores/${p.slug}`)} style={rowStyle(active === idx)}>
                    {/* Reserved flag column → every row aligns, flagged or not */}
                    <span style={{ width: 18, flexShrink: 0, textAlign: 'center', fontSize: 14, lineHeight: 1 }} aria-hidden>
                      {p.flag ?? '🏳️'}
                    </span>
                    <Avatar name={p.name} size={28} photo={p.photo} />
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ts-muted)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.club} · {p.league}</span>
                        {p.pos && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ts-faint)', flexShrink: 0 }}>{p.pos}</span>}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SECTION_STYLE: React.CSSProperties = {
  padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--ts-faint)',
}
function rowStyle(activeRow: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px',
    background: activeRow ? 'var(--ts-card2)' : 'transparent', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  }
}
