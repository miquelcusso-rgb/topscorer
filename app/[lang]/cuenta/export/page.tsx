'use client'

import { use } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isScout } from '@/lib/plans'
import SaasShell from '@/components/saas/SaasShell'

// Scout tool: download the current-season dataset as CSV (server-generated at
// /api/export, Scout-gated). Non-scout users see an upgrade CTA. Brand tokens.
export default function ExportPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const en = lang === 'en'
  const { user, isLoaded } = useUser()
  const allowed = isLoaded && isScout(user?.publicMetadata as Record<string, unknown> | undefined)

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 22, maxWidth: 620 }

  return (
    <SaasShell activeKey="players" breadcrumb={en ? ['Account', 'CSV Export'] : ['Cuenta', 'Exportar CSV']}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 800, color: 'var(--ts-text)', margin: '0 0 6px' }}>
        {en ? 'CSV Export' : 'Exportar CSV'}
      </h1>
      <p style={{ color: 'var(--ts-muted)', fontSize: 14, margin: '0 0 18px', maxWidth: 620 }}>
        {en
          ? 'Download the full current-season dataset — one row per tracked player with goals, assists, rating, per-game rates and the IIG index — as a spreadsheet-ready CSV.'
          : 'Descarga el dataset completo de la temporada — una fila por jugador seguido con goles, asistencias, valoración, ratios por partido y el índice IIG — en un CSV listo para hoja de cálculo.'}
      </p>

      {!isLoaded ? null : allowed ? (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 12 }}>
            {en ? 'Your export' : 'Tu exportación'}
          </div>
          <a href={`/api/export`} download
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '10px 20px', borderRadius: 999,
              background: 'var(--ts-primary)', color: '#1a1a1a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            ⬇ {en ? 'Download CSV' : 'Descargar CSV'}
          </a>
          <p style={{ fontSize: 12, color: 'var(--ts-faint)', margin: '14px 0 0' }}>
            {en ? 'UTF-8 with BOM (opens cleanly in Excel / Google Sheets / Numbers).' : 'UTF-8 con BOM (se abre bien en Excel / Google Sheets / Numbers).'}
          </p>
        </div>
      ) : (
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--ts-muted)' }}>
            {en ? 'CSV export is a Scout feature.' : 'La exportación CSV es una función Scout.'}
          </p>
          <Link href={`/${lang}/pricing`}
            style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '10px 20px', borderRadius: 999,
              background: 'var(--ts-primary)', color: '#1a1a1a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            {en ? 'Upgrade to Scout' : 'Hazte Scout'} →
          </Link>
        </div>
      )}
    </SaasShell>
  )
}
