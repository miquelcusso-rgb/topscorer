import type { Metadata } from 'next'
import SaasShell from '@/components/saas/SaasShell'

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const es = lang === 'es'
  return {
    title: es ? 'Fantasy (próximamente)' : 'Fantasy (coming soon)',
    description: es
      ? 'El Fantasy de TopScorers llega pronto: crea tu equipo con jugadores reales y puntúa por goles y asistencias cada semana.'
      : 'TopScorers Fantasy is coming soon: build a team of real players and score points from goals and assists every week.',
    alternates: {
      canonical: `/${lang}/fantasy`,
      languages: { es: '/es/fantasy', en: '/en/fantasy' },
    },
  }
}

export default async function FantasyComingSoon({ params }: Props) {
  const { lang } = await params
  const es = lang === 'es'
  return (
    <SaasShell activeKey="stats" breadcrumb={es ? ['Estadísticas', 'Fantasy'] : ['Statistics', 'Fantasy']}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px', color: 'var(--ts-text)', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ts-primary)', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)',
          borderRadius: 999, padding: '6px 14px',
        }}>
          {es ? 'Próximamente' : 'Coming soon'}
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em', margin: '20px 0 12px' }}>
          {es ? 'Fantasy TopScorers' : 'TopScorers Fantasy'}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ts-muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 28px' }}>
          {es
            ? 'Estamos puliendo el juego Fantasy: elegirás jugadores reales y sumarás puntos por goles, asistencias y rating cada jornada, con capitán ×2. Vuelve pronto.'
            : 'We are polishing the Fantasy game: pick real players and score points from goals, assists and rating every matchweek, with a 2× captain. Check back soon.'}
        </p>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 520, margin: '0 auto 32px', opacity: 0.6 }}>
          {[
            { label: es ? 'Goles' : 'Goals', points: 4, color: 'var(--ts-primary)' },
            { label: es ? 'Asistencias' : 'Assists', points: 3, color: 'var(--ts-teal)' },
            { label: es ? 'Nota ≥7' : 'Rating ≥7', points: 2, color: 'var(--ts-text)' },
            { label: es ? 'Capitán' : 'Captain', points: '×2', color: 'var(--ts-primary)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--ts-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 6 }}>{s.points}</div>
            </div>
          ))}
        </section>
        <p style={{ fontSize: 12, color: 'var(--ts-faint)' }}>by Furiosa Studio</p>
      </main>
    </SaasShell>
  )
}
