import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, type Lang } from '@/lib/i18n'
import { CURRENT_SEASON_LONG } from '@/lib/season'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/about'
  const title = en ? 'About TopScorers — Who We Are & Methodology' : 'Sobre TopScorers — Quiénes Somos y Metodología'
  const description = en
    ? 'Who is behind TopScorers, where our data comes from (API-Football + curated dataset), how the Val/Val+ and IIG ratings work, and how to report errors.'
    : 'Quién está detrás de TopScorers, de dónde salen los datos (API-Football + dataset curado), cómo funcionan las valoraciones Val/Val+ e IIG y cómo reportar errores.'
  return {
    title,
    description,
    keywords: en
      ? ['about topscorers', 'who we are', 'football statistics methodology', 'data sources']
      : ['sobre topscorers', 'quiénes somos', 'metodología estadísticas fútbol', 'fuentes de datos'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
}

const LEAGUES = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'Primeira Liga', 'Süper Lig', 'Super Liga Grecia']

// Bilingual E-E-A-T copy. Each entry: [heading, ...paragraphs]. Kept as data so
// both languages stay structurally in sync and word counts are easy to audit.
function copyFor(lang: Lang): { kicker: string; sections: Array<{ h: string; ps: string[] }>; valCoef: string; contactPre: string; back: string } {
  const en = lang === 'en'
  if (en) {
    return {
      kicker: 'About the project',
      back: '← Back to the app',
      valCoef: 'League coefficient: Top-5 European leagues = ×2 · PT / TR / GR = ×1.5',
      contactPre: 'For questions, data errors or suggestions, write to',
      sections: [
        {
          h: 'What is TopScorers',
          ps: [
            `TopScorers is a European football statistics tool focused on goalscorers, assist providers and the players who decide matches. It answers one question quickly and cleanly: who is actually performing this season? Instead of burying you in raw tables, it ranks strikers, creators, midfielders, defenders and goalkeepers across leagues with comparable, season-long numbers, and turns every player into a full profile page with shooting, passing, duel and discipline data for the ${CURRENT_SEASON_LONG} campaign.`,
            'The site is free to browse. A Pro plan adds historical seasons, comparison tooling and scouting extras, but every ranking, player profile and team page you can reach from the navigation is open to everyone.',
          ],
        },
        {
          h: 'Who is behind it',
          ps: [
            'TopScorers is built and maintained by Furiosa Studio, an independent European studio that develops focused data products around sport, science and utilities. There is no editorial staff writing hot takes here: the studio’s job is engineering — collecting reliable data, keeping it fresh, and presenting it so that a fan, a fantasy manager or an amateur scout can read it in seconds. Furiosa Studio operates this site, answers support mail and is responsible for its content.',
          ],
        },
        {
          h: 'Methodology and data sources',
          ps: [
            'Current-season statistics come from API-Football, a professional data provider used across the football industry, and are refreshed on a regular automated schedule during the season — typically daily — so goals scored this week show up on the site within a day. Historical seasons come from a curated dataset consolidated from public records.',
            'The data pipeline has two layers. The first is a curated core: a hand-checked index of leagues, clubs and notable players that fixes naming, deduplicates identities (several professionals share a name) and anchors each profile to a stable identifier. The second is the live layer, which fills those profiles with per-season statistics from the provider. Before any dataset update ships, an automated quality check runs against the whole player index and blocks the release if it detects duplicated players or broken records — a guardrail born from real bugs we fixed and never want back.',
          ],
        },
        {
          h: 'The rating system',
          ps: [
            'Rankings use two transparent scores. Val is the base metric: goals count double, assists count once. Val+ applies a league coefficient on top, because fifteen goals in a top-five league are not the same achievement as fifteen goals in a weaker competition. Both formulas are shown below and never change mid-season.',
            'Player profiles also show the IIG (Striker Impact Index), a composite built only from real season stats: league-weighted goals, plus the player’s average match rating relative to 6.0, plus assists at half weight. When a component is missing for a player the term is simply dropped — the index degrades gracefully rather than inventing numbers.',
          ],
        },
        {
          h: 'Coverage',
          ps: [
            'TopScorers currently covers eight European leagues, listed below, plus a dedicated World Cup 2026 section with every qualified nation and its key players. Club pages complete the picture: each team profile includes its current squad, so you can move from a scorer to his club to his teammates in two clicks.',
          ],
        },
        {
          h: 'Data limitations and corrections',
          ps: [
            'No football dataset is perfect. Live statistics can lag a matchday behind, historical records for smaller competitions can be incomplete, and market values are third-party estimates rather than official figures. Where a number is genuinely unknown we show a dash instead of a guess. If you spot an error — a wrong club, a missing goal, a duplicated player — please tell us: reports are checked against the source data and fixes usually ship with the next dataset update.',
          ],
        },
      ],
    }
  }
  return {
    kicker: 'Sobre el proyecto',
    back: '← Volver a la app',
    valCoef: 'Coeficiente de liga: Top 5 europeas = ×2 · PT / TR / GR = ×1.5',
    contactPre: 'Para consultas, errores de datos o sugerencias, escríbenos a',
    sections: [
      {
        h: 'Qué es TopScorers',
        ps: [
          `TopScorers es una herramienta de estadísticas de fútbol europeo centrada en goleadores, asistentes y los jugadores que deciden partidos. Responde rápido y sin ruido a una pregunta: ¿quién está rindiendo de verdad esta temporada? En lugar de enterrarte en tablas crudas, ordena a delanteros, creadores, centrocampistas, defensas y porteros de varias ligas con números comparables de toda la temporada, y convierte a cada jugador en una ficha completa con datos de disparo, pase, duelos y disciplina de la campaña ${CURRENT_SEASON_LONG}.`,
          'Navegar por el sitio es gratis. Un plan Pro añade temporadas históricas, comparador y extras de scouting, pero todos los rankings, fichas de jugador y páginas de equipo accesibles desde la navegación están abiertos a cualquiera.',
        ],
      },
      {
        h: 'Quién está detrás',
        ps: [
          'TopScorers está desarrollado y mantenido por Furiosa Studio, un estudio europeo independiente que crea productos de datos especializados en deporte, ciencia y utilidades. Aquí no hay redacción escribiendo opiniones: el trabajo del estudio es ingeniería — recopilar datos fiables, mantenerlos frescos y presentarlos para que un aficionado, un mánager de fantasy o un ojeador amateur los lea en segundos. Furiosa Studio opera este sitio, responde el correo de soporte y es responsable de su contenido.',
        ],
      },
      {
        h: 'Metodología y fuentes de datos',
        ps: [
          'Las estadísticas de la temporada en curso proceden de API-Football, un proveedor profesional de datos usado en toda la industria del fútbol, y se refrescan con una cadencia automatizada regular durante la temporada — normalmente diaria — de modo que los goles de esta semana aparecen en el sitio en cuestión de un día. Las temporadas históricas provienen de un dataset curado consolidado a partir de registros públicos.',
          'El pipeline de datos tiene dos capas. La primera es un núcleo curado: un índice revisado a mano de ligas, clubes y jugadores destacados que corrige nombres, deduplica identidades (varios profesionales comparten nombre) y ancla cada ficha a un identificador estable. La segunda es la capa en vivo, que rellena esas fichas con las estadísticas de cada temporada del proveedor. Antes de publicar cualquier actualización del dataset, un chequeo de calidad automatizado recorre todo el índice de jugadores y bloquea la publicación si detecta jugadores duplicados o registros rotos — un guardarraíl nacido de bugs reales que arreglamos y no queremos que vuelvan.',
        ],
      },
      {
        h: 'El sistema de valoración',
        ps: [
          'Los rankings usan dos puntuaciones transparentes. Val es la métrica base: los goles cuentan doble y las asistencias una vez. Val+ aplica encima un coeficiente de liga, porque quince goles en una liga top-5 no son el mismo mérito que quince goles en una competición más débil. Ambas fórmulas se muestran abajo y no cambian a mitad de temporada.',
          'Las fichas de jugador muestran además el IIG (Índice de Impacto del Goleador), un compuesto construido solo con estadísticas reales de la temporada: goles ponderados por liga, más la nota media por partido del jugador respecto al 6.0, más las asistencias a mitad de peso. Cuando a un jugador le falta un componente, ese término simplemente se elimina — el índice se degrada con honestidad en vez de inventar números.',
        ],
      },
      {
        h: 'Cobertura',
        ps: [
          'TopScorers cubre actualmente ocho ligas europeas, listadas abajo, más una sección dedicada al Mundial 2026 con todas las selecciones clasificadas y sus jugadores clave. Las páginas de club completan el mapa: cada ficha de equipo incluye su plantilla actual, así que puedes ir de un goleador a su club y a sus compañeros en dos clics.',
        ],
      },
      {
        h: 'Limitaciones de los datos y correcciones',
        ps: [
          'Ningún dataset de fútbol es perfecto. Las estadísticas en vivo pueden ir una jornada por detrás, los registros históricos de competiciones menores pueden estar incompletos y los valores de mercado son estimaciones de terceros, no cifras oficiales. Cuando un dato es realmente desconocido mostramos un guion en lugar de una suposición. Si detectas un error — un club equivocado, un gol que falta, un jugador duplicado — dínoslo: los reportes se contrastan con los datos de origen y las correcciones suelen publicarse con la siguiente actualización del dataset.',
        ],
      },
    ],
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const en = lang === 'en'
  const breadcrumb = en ? ['About'] : ['Sobre']
  const t = copyFor(lang)
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-2 text-[15px] font-bold" style={{ color: C.tx, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
      {children}
    </h2>
  )
  const [what, who, method, rating, coverage, limits] = t.sections
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <div className="max-w-[720px] mx-auto px-2 py-4">

        <div className="mb-2 text-[10px] font-bold tracking-[3px] uppercase" style={{ color: C.gd, fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t.kicker}
        </div>
        <h1
          className="leading-none mb-8"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px,6vw,56px)', fontWeight: 700, letterSpacing: 1, color: C.tx }}
        >
          TopScorers
        </h1>

        <div className="flex flex-col gap-6" style={{ fontSize: 13.5, color: C.mu, lineHeight: 1.8 }}>

          <section>
            <H>{what.h}</H>
            {what.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
          </section>

          <section>
            <H>{who.h}</H>
            {who.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
          </section>

          <section>
            <H>{method.h}</H>
            {method.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
          </section>

          <section>
            <H>{rating.h}</H>
            {rating.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
            <div className="mt-4 p-4 rounded-sm" style={{ background: C.sf, border: `1px solid ${C.bd}` }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm" style={{ color: C.gd, background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)', fontFamily: "'Barlow Condensed', sans-serif" }}>Val.</span>
                  <span className="text-[12px]" style={{ color: C.tx }}>{en ? 'Goals × 2 + Assists' : 'Goles × 2 + Asistencias'}</span>
                  <span className="text-[11px]" style={{ color: C.mu }}>{en ? '— base metric, no league adjustment' : '— métrica base sin ajuste de liga'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm" style={{ color: '#00c8b0', background: 'rgba(0,200,176,.1)', border: '1px solid rgba(0,200,176,.2)', fontFamily: "'Barlow Condensed', sans-serif" }}>Val+</span>
                  <span className="text-[12px]" style={{ color: C.tx }}>{en ? 'Goals × Coef. × 2 + Assists' : 'Goles × Coef. × 2 + Asistencias'}</span>
                  <span className="text-[11px]" style={{ color: C.mu }}>{en ? '— weighted by league difficulty' : '— pondera por dificultad de liga'}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 text-[11px]" style={{ color: C.mu, borderTop: `1px solid ${C.bd}` }}>
                {t.valCoef}
              </div>
            </div>
          </section>

          <section>
            <H>{coverage.h}</H>
            {coverage.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
            <div className="mt-3 flex flex-wrap gap-2">
              {LEAGUES.map(l => (
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
            <H>{limits.h}</H>
            {limits.ps.map((p, i) => <p key={i} className={i ? 'mt-3' : ''}>{p}</p>)}
          </section>

          <section>
            <H>{en ? 'Contact' : 'Contacto'}</H>
            <p>
              {t.contactPre}{' '}
              <a href="mailto:support@top-scorers.com" style={{ color: C.gd }}>
                support@top-scorers.com
              </a>
              .
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.bd}` }}>
          <Link
            href="/"
            className="text-[12px] font-semibold transition-colors duration-150"
            style={{ color: C.mu }}
          >
            {t.back}
          </Link>
        </div>
      </div>
    </SaasShell>
  )
}
