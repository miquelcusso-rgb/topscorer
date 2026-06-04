'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'

// Tabbed profile body: Resumen (current-season snapshot) vs Histórico (career +
// market-value evolution + palmarés). Keeps the two clearly separated.
export default function ProfileTabbed({
  resumen, historico, compareHref, compareLabel, en,
}: {
  resumen: ReactNode
  historico: ReactNode
  compareHref: string
  compareLabel: string
  en: boolean
}) {
  const [tab, setTab] = useState<'resumen' | 'historico'>('resumen')
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
    fontFamily: 'inherit',
    border: `1px solid ${active ? 'var(--ts-primary)' : 'var(--ts-border)'}`,
    background: active ? 'var(--ts-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--ts-muted)',
  })
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={tabBtn(tab === 'resumen')} onClick={() => setTab('resumen')}>
          {en ? 'Overview' : 'Resumen'}
        </button>
        <button type="button" style={tabBtn(tab === 'historico')} onClick={() => setTab('historico')}>
          {en ? 'History' : 'Histórico'}
        </button>
        <Link href={compareHref} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--ts-primary)', textDecoration: 'none' }}>
          {compareLabel}
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
        {tab === 'resumen' ? resumen : historico}
      </div>
    </>
  )
}
