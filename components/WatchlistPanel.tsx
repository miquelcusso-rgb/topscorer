'use client'

import { useState } from 'react'
import type { Tab } from '@/types'

export interface WatchlistEntry {
  id: string
  player_name: string
  season: string
  tab: Tab
  note: string | null
  created_at: string
}

interface Props {
  entries: WatchlistEntry[]
  open: boolean
  onClose: () => void
  onRemove: (entry: WatchlistEntry) => void
  onNoteChange: (entry: WatchlistEntry, note: string) => void
}

const SEASON_LABELS: Record<string, string> = {
  '2526': '25/26', '2425': '24/25', '2324': '23/24',
  '2223': '22/23', '2122': '21/22', '2021': '20/21',
}

export default function WatchlistPanel({ entries, open, onClose, onRemove, onNoteChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  function startEdit(entry: WatchlistEntry) {
    setEditingId(entry.id)
    setDraft(entry.note ?? '')
  }

  function commitEdit(entry: WatchlistEntry) {
    onNoteChange(entry, draft)
    setEditingId(null)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(10,9,8,.6)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 320,
          background: '#0a0b14',
          borderLeft: '1px solid #2a2620',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(.25,.1,.25,1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-11 shrink-0"
          style={{ borderBottom: '1px solid #2a2620' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#f0c040', letterSpacing: 1 }}>
              Watchlist
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(240,192,64,.12)', color: '#f0c040', border: '1px solid rgba(240,192,64,.25)' }}
            >
              {entries.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[16px] leading-none cursor-pointer transition-colors duration-150"
            style={{ color: '#9a917e', background: 'none', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1e8d2' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9a917e' }}
          >
            ✕
          </button>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div style={{ fontSize: 32, color: '#2a2a48' }}>☆</div>
              <div className="text-[13px] font-semibold" style={{ color: '#36364e' }}>Sin jugadores guardados</div>
              <div className="text-[11.5px]" style={{ color: '#2a2a48' }}>
                Pasa el cursor por encima de cualquier jugador y haz clic en la estrella.
              </div>
            </div>
          ) : (
            <ul>
              {entries.map(entry => (
                <li
                  key={entry.id}
                  className="px-4 py-3"
                  style={{ borderBottom: '1px solid #2a2620' }}
                >
                  {/* Player name + remove */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-[13px] font-semibold leading-tight" style={{ color: '#f1e8d2' }}>
                        {entry.player_name}
                      </div>
                      <div className="text-[10.5px] mt-0.5" style={{ color: '#9a917e' }}>
                        {SEASON_LABELS[entry.season] ?? entry.season}
                        {' · '}
                        <span style={{ color: entry.tab === 's' ? '#f0c040' : '#00c8b0' }}>
                          {entry.tab === 's' ? 'Goles' : 'Asistencias'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(entry)}
                      className="text-[10px] shrink-0 transition-colors duration-150 cursor-pointer"
                      style={{ color: '#36364e', background: 'none', border: 'none', paddingTop: 2 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e05a30' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#36364e' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Note */}
                  {editingId === entry.id ? (
                    <div className="flex gap-1.5 mt-1.5">
                      <textarea
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={() => commitEdit(entry)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(entry) } if (e.key === 'Escape') setEditingId(null) }}
                        rows={2}
                        placeholder="Añade una nota…"
                        className="flex-1 text-[11.5px] px-2 py-1.5 rounded-sm resize-none"
                        style={{
                          background: '#15130f',
                          border: '1px solid #3a3a5a',
                          color: '#f1e8d2',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(entry)}
                      className="w-full text-left text-[11px] px-2 py-1.5 rounded-sm transition-colors duration-150 cursor-pointer"
                      style={{
                        background: '#15130f',
                        border: '1px solid #2a2620',
                        color: entry.note ? '#9090b0' : '#36364e',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a5a' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2620' }}
                    >
                      {entry.note || 'Añade una nota…'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 shrink-0 text-[10.5px]"
          style={{ borderTop: '1px solid #2a2620', color: '#2a2a48' }}
        >
          Las notas se guardan automáticamente · Solo tú puedes verlas
        </div>
      </div>
    </>
  )
}
