import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Brackets from '@/components/Brackets'
import SaasShell from '@/components/saas/SaasShell'
import { TOURNAMENTS } from '@/data/brackets'
import { isLocale } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string; tournament: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, tournament } = await params
  const t = TOURNAMENTS[tournament]
  if (!t) return { title: 'Bracket not found · TopScorers' }
  return {
    title: `${t.name} · Bracket · TopScorers`,
    description: `Interactive knockout bracket for ${t.name}.`,
    alternates: {
      canonical: `/${lang}/brackets/${tournament}`,
      languages: {
        es: `/es/brackets/${tournament}`,
        en: `/en/brackets/${tournament}`,
      },
    },
  }
}

export default async function TournamentBracketPage({ params }: Props) {
  const { lang: raw, tournament } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const t = TOURNAMENTS[tournament]
  if (!t) notFound()

  return (
    <SaasShell activeKey="stats" breadcrumb={en ? ['Statistics', 'Brackets', t.name] : ['Estadísticas', 'Brackets', t.name]}>
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 16px', color: 'var(--ts-text)' }}>
      <div
        style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--ts-primary)',
        }}
      >
        Knockout bracket
      </div>
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em',
          margin: '12px 0 8px', color: 'var(--ts-text)',
        }}
      >
        {t.name}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ts-muted)', marginBottom: 24 }}>
        Drag horizontally on mobile. Winners highlighted in gold.
      </p>

      <div
        style={{
          background: 'var(--ts-card)',
          border: '1px solid var(--ts-border)',
          borderRadius: 12,
        }}
      >
        <Brackets rounds={t.rounds} />
      </div>

      <p style={{ fontSize: 12, color: 'var(--ts-faint)', marginTop: 32 }}>
        by Furiosa Studio · Bracket data updated weekly during tournament play.
      </p>
    </main>
    </SaasShell>
  )
}
