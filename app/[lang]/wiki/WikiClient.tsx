'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function WikiClient() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg       = isLight ? '#f8f7f3' : '#0a0908'
  const cardBg   = isLight ? '#ffffff' : '#15130f'
  const border   = isLight ? '#e6dfce' : '#2a2620'
  const heading  = isLight ? '#1c1608' : '#efe9dc'
  const body     = isLight ? '#6e6655' : '#b5ab95'
  const muted    = isLight ? '#8a7f68' : '#9a917e'
  const accent   = '#f0c040'

  const lp = (p: string) => `/${lang}${p}`

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <section id={id} style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: heading, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, borderBottom: `1px solid ${border}`, paddingBottom: 6 }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: body }}>{children}</div>
    </section>
  )

  const metrics: [string, string, string][] = es
    ? [
        ['G/90', 'Goles cada 90 minutos', 'Normaliza el olfato goleador por tiempo jugado, no por partidos.'],
        ['A/90', 'Asistencias cada 90 minutos', 'Mide la creación de juego por tiempo en el campo.'],
        ['G/PJ', 'Goles por partido jugado', 'Promedio simple de goles por encuentro.'],
        ['ELO', 'Rating de fuerza', 'Puntuación dinámica que estima el nivel relativo del jugador.'],
        ['Valoración', 'Índice compuesto', 'Combina goles, asistencias y contexto de liga en un solo número.'],
        ['Talent Score', 'Score del Radar', '(G/90·3 + A/90·2) ponderado por liga, edad y volumen de partidos.'],
      ]
    : [
        ['G/90', 'Goals per 90 minutes', 'Normalizes scoring by time played, not by matches.'],
        ['A/90', 'Assists per 90 minutes', 'Measures playmaking per time on the pitch.'],
        ['G/PJ', 'Goals per match', 'Simple average of goals per game.'],
        ['ELO', 'Strength rating', 'Dynamic score estimating the player’s relative level.'],
        ['Valoración', 'Composite index', 'Combines goals, assists and league context into one number.'],
        ['Talent Score', 'Radar score', '(G/90·3 + A/90·2) weighted by league, age and match volume.'],
      ]

  const seals: [string, string, string, string][] = es
    ? [
        ['⚡', 'Élite', '#f0c040', 'Rendimiento de los mejores de Europa. Score muy alto en goles + asistencias por 90 min.'],
        ['★', 'Promesa', '#00c8b0', 'Jugador joven (≤21 años) rindiendo ya a nivel de élite.'],
        ['◆', 'Joya oculta', '#00c8b0', 'Gran rendimiento por 90 min, a menudo infravalorado o en liga de menor exposición.'],
      ]
    : [
        ['⚡', 'Elite', '#f0c040', 'Top-tier output in Europe. Very high goals + assists per 90 min.'],
        ['★', 'Prospect', '#00c8b0', 'Young player (≤21) already performing at an elite level.'],
        ['◆', 'Hidden gem', '#00c8b0', 'High per-90 output, often undervalued or in a lower-exposure league.'],
      ]

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 20px 80px' }}>
        {/* Hero */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: accent, textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Wiki · Centro de ayuda' : 'Wiki · Help center'}
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 900, color: heading, lineHeight: 1.05, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
          {es ? 'Cómo funciona TopScorers' : 'How TopScorers works'}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: body, marginBottom: 40 }}>
          {es
            ? 'TopScorers reúne las estadísticas de las principales ligas europeas con un enfoque claro: datos reales de rendimiento, sin ruido. Aquí explicamos las métricas, el sistema de sellos y cómo aprovechar la plataforma.'
            : 'TopScorers brings together the stats of Europe’s top leagues with a clear focus: real performance data, no noise. Here we explain the metrics, the seal system and how to get the most out of the platform.'}
        </p>

        <Section id="metricas" title={es ? 'Glosario de métricas' : 'Metrics glossary'}>
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, overflow: 'hidden' }}>
            {metrics.map(([k, name, desc], i) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: i % 2 ? (isLight ? 'rgba(0,0,0,.02)' : 'rgba(255,255,255,.015)') : cardBg, borderBottom: i < metrics.length - 1 ? `1px solid ${border}` : 'none' }}>
                <div style={{ minWidth: 92 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: accent, fontSize: 14 }}>{k}</span>
                  <div style={{ fontSize: 11, color: muted }}>{name}</div>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: body }}>{desc}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="sellos" title={es ? 'El sistema de sellos' : 'The seal system'}>
          <p style={{ marginBottom: 14 }}>
            {es
              ? 'Marcamos a los jugadores más destacados con un sello, calculado por algoritmo a partir del rendimiento por 90 minutos (no es una valoración subjetiva). Es selectivo: solo lo recibe un porcentaje pequeño de jugadores.'
              : 'We mark the most outstanding players with a seal, computed algorithmically from per-90 performance (not a subjective rating). It is selective: only a small percentage of players earn one.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {seals.map(([icon, name, color, desc]) => (
              <div key={name} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: cardBg, border: `1px solid ${color}33`, borderRadius: 8 }}>
                <span style={{ fontSize: 18, color }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 14 }}>{name}</div>
                  <div style={{ fontSize: 13, color: body, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: muted, marginTop: 12 }}>
            {es
              ? 'El sello es informativo y algorítmico; no constituye una evaluación de scouting profesional.'
              : 'The seal is informational and algorithmic; it is not a professional scouting evaluation.'}
          </p>
        </Section>

        <Section id="ligas" title={es ? 'Ligas y datos' : 'Leagues & data'}>
          <p>
            {es
              ? 'Cubrimos las 5 grandes ligas (LaLiga, Premier League, Bundesliga, Serie A, Ligue 1) más Portugal, Turquía y Grecia, además de Champions y Europa League. Los datos se actualizan periódicamente desde proveedores oficiales de estadísticas.'
              : 'We cover the top 5 leagues (LaLiga, Premier League, Bundesliga, Serie A, Ligue 1) plus Portugal, Turkey and Greece, as well as the Champions and Europa League. Data is refreshed regularly from official stats providers.'}
          </p>
        </Section>

        <Section id="planes" title={es ? 'Planes' : 'Plans'}>
          <p>
            {es
              ? 'La versión gratuita muestra el Top 10 con publicidad. Pro y Scout amplían los jugadores visibles, el histórico de temporadas, stats avanzados, comparador, Radar de Talentos y exportación. Scout añade acceso por API.'
              : 'The free tier shows the Top 10 with ads. Pro and Scout expand visible players, season history, advanced stats, the comparator, the Talent Radar and export. Scout adds API access.'}
          </p>
          <Link href={lp('/pricing')} style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', borderRadius: 6, background: accent, color: '#0a0908', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, fontSize: 14, textDecoration: 'none' }}>
            {es ? 'Ver planes' : 'See plans'}
          </Link>
        </Section>

        <Section id="faq" title={es ? 'Preguntas frecuentes' : 'FAQ'}>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: heading }}>{es ? '¿Por qué un jugador no tiene posición exacta?' : 'Why does a player lack an exact position?'}</strong><br />
            {es
              ? 'Cuando el proveedor no especifica la posición, mostramos una posición genérica estimada a partir de sus estadísticas, marcada con un asterisco (*).'
              : 'When the provider doesn’t specify a position, we show a generic one estimated from their stats, marked with an asterisk (*).'}
          </p>
          <p>
            <strong style={{ color: heading }}>{es ? '¿Cada cuánto se actualizan los datos?' : 'How often is data updated?'}</strong><br />
            {es
              ? 'Las clasificaciones y goleadores se refrescan cada pocas horas; las fichas y traspasos, a diario.'
              : 'Standings and scorers refresh every few hours; profiles and transfers, daily.'}
          </p>
        </Section>
      </div>
    </main>
  )
}
