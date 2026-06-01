import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/about'
  return {
    title: 'Sobre TopScorers — Quiénes Somos',
    description: 'Conoce TopScorers: estadísticas de fútbol europeo en tiempo real. Goleadores, asistentes y centrocampistas de La Liga, Premier League, Bundesliga, Serie A y más.',
    keywords: ['sobre topscorers', 'quiénes somos', 'estadísticas fútbol europeo', 'proyecto fútbol datos'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Sobre TopScorers — Quiénes Somos',
      description: 'Estadísticas de fútbol europeo en tiempo real: goleadores, asistentes y ligas.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sobre TopScorers — Quiénes Somos',
      description: 'Estadísticas de fútbol europeo en tiempo real: goleadores, asistentes y ligas.',
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

// Palette tokens — resolved at render from CSS custom properties so the page
// reads correctly in BOTH light and dark mode.
const C = {
  bg: 'var(--ts-bg)',
  sf: 'var(--ts-card)',
  bd: 'var(--ts-border)',
  tx: 'var(--ts-text)',
  mu: 'var(--ts-muted)',
  gd: 'var(--ts-primary)',
  tl: 'var(--ts-teal)',
  gr: 'var(--ts-teal)',
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['About'] : ['Sobre']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <div className="max-w-[720px] mx-auto px-2 py-4">

        <div className="mb-2 text-[10px] font-bold tracking-[3px] uppercase" style={{ color: C.gd, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Sobre el proyecto
        </div>
        <h1
          className="leading-none mb-8"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px,6vw,56px)', fontWeight: 700, letterSpacing: 1, color: C.tx }}
        >
          TopScorers
        </h1>

        <div className="flex flex-col gap-6" style={{ fontSize: 13.5, color: C.mu, lineHeight: 1.8 }}>

          <section>
            <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
              Qué es TopScorers
            </h2>
            <p>
              TopScorers es una herramienta de estadísticas de fútbol europeo enfocada en goleadores y asistentes de las principales ligas del continente. Su objetivo es ofrecer una vista rápida, clara y comparable de los mejores jugadores ofensivos temporada a temporada.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
              Ligas incluidas
            </h2>
            <div className="flex flex-wrap gap-2">
              {['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'Primeira Liga', 'Süper Lig', 'Super Liga Grecia'].map(l => (
                <span
                  key={l}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-sm"
                  style={{ color: C.tl, background: 'var(--ts-teal-soft)', border: '1px solid var(--ts-border-hot)' }}
                >
                  {l}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
              Fuentes de datos
            </h2>
            <p>
              Los datos de la temporada en curso (2025/26) se recogen periódicamente de fuentes públicas como European Golden Shoe y FotMob. Las temporadas históricas son datos consolidados. No garantizamos la exactitud en tiempo real — para datos oficiales consulta las fuentes originales.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
              El sistema de valoración
            </h2>
            <div className="p-4 rounded-sm" style={{ background: C.sf, border: `1px solid ${C.bd}` }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm" style={{ color: C.gd, background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)', fontFamily: "'Barlow Condensed', sans-serif" }}>Val.</span>
                  <span className="text-[12px]" style={{ color: C.tx }}>Goles × 2 + Asistencias</span>
                  <span className="text-[11px]" style={{ color: C.mu }}>— métrica base sin ajuste de liga</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm" style={{ color: '#a060ff', background: 'rgba(160,96,255,.1)', border: '1px solid rgba(160,96,255,.2)', fontFamily: "'Barlow Condensed', sans-serif" }}>Val+</span>
                  <span className="text-[12px]" style={{ color: C.tx }}>Goles × Coef. × 2 + Asistencias</span>
                  <span className="text-[11px]" style={{ color: C.mu }}>— pondera por dificultad de liga</span>
                </div>
              </div>
              <div className="mt-3 pt-3 text-[11px]" style={{ color: C.mu, borderTop: `1px solid ${C.bd}` }}>
                Coeficiente de liga: Top 5 europeas = ×2 &nbsp;·&nbsp; PT / TR / GR = ×1.5
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
              Contacto
            </h2>
            <p>
              Para consultas, errores de datos o sugerencias:{' '}
              <a href="mailto:support@top-scorers.com" style={{ color: C.gd }}>
                support@top-scorers.com
              </a>
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.bd}` }}>
          <Link
            href="/"
            className="text-[12px] font-semibold transition-colors duration-150"
            style={{ color: C.mu }}
          >
            ← Volver a la app
          </Link>
        </div>
      </div>
    </SaasShell>
  )
}
