import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Brackets from '@/components/Brackets'
import { TOURNAMENTS } from '@/data/brackets'

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
  const { tournament } = await params
  const t = TOURNAMENTS[tournament]
  if (!t) notFound()

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 16px', color: '#eef4ff' }}>
      <div
        style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#f0c040',
        }}
      >
        Knockout bracket
      </div>
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em',
          margin: '12px 0 8px',
        }}
      >
        {t.name}
      </h1>
      <p style={{ fontSize: 14, color: '#9aa3b8', marginBottom: 24 }}>
        Drag horizontally on mobile. Winners highlighted in gold.
      </p>

      <div
        style={{
          background: '#0c0d18',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 12,
        }}
      >
        <Brackets rounds={t.rounds} />
      </div>

      <p style={{ fontSize: 12, color: '#475569', marginTop: 32 }}>
        by Furiosa Studio · Bracket data updated weekly during tournament play.
      </p>
    </main>
  )
}
