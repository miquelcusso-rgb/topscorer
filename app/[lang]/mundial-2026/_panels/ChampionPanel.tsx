import Link from 'next/link'
import { WC_FINAL, WC_AWARDS, wcFinalSummary } from '@/data/wc2026-final'
import { wcNationSlugFor } from '@/lib/wc-nations'
import { t, type Lang } from './shared'

// Champion hero for the WC portada — the tournament is over, so this static
// panel (zero API calls) IS the opening screen: trophy + champion flag front
// and center, the final's scoreline, a data-grounded match summary and the
// individual awards. All content from data/wc2026-final.ts.

export default function ChampionPanel({ lang }: { lang: Lang }) {
  const en = lang === 'en'
  const champion = en ? WC_FINAL.champion.en : WC_FINAL.champion.es
  const runnerUp = en ? WC_FINAL.runnerUp.en : WC_FINAL.runnerUp.es
  const nationSlug = wcNationSlugFor(WC_FINAL.championApi)
  const summary = wcFinalSummary(lang)
  const dateStr = en ? 'July 19, 2026' : '19 de julio de 2026'

  return (
    <section
      aria-label={t(lang, 'España campeona del mundo 2026', 'Spain 2026 world champions')}
      style={{
        borderRadius: 14,
        border: '1px solid var(--ts-border-hot)',
        background: 'linear-gradient(180deg, var(--ts-primary-soft) 0%, var(--ts-card) 55%)',
        padding: '28px 20px 20px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Kicker */}
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
        {t(lang, 'FIFA World Cup 2026 · Final · 19 jul · MetLife Stadium', 'FIFA World Cup 2026 · Final · Jul 19 · MetLife Stadium')}
      </div>

      {/* Trophy + flag centerpiece */}
      <div aria-hidden style={{ marginTop: 14, lineHeight: 1 }}>
        <div style={{ fontSize: 64, filter: 'drop-shadow(0 6px 18px rgba(212,175,55,.35))' }}>🏆</div>
        <div style={{ fontSize: 44, marginTop: 6 }}>{WC_FINAL.champion.flag}</div>
      </div>
      <h2 style={{ margin: '10px 0 0', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(36px,7vw,64px)', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-text)', lineHeight: 1 }}>
        {champion}
      </h2>
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: 'var(--ts-primary)' }}>
        {t(lang, 'CAMPEONA DEL MUNDO', 'WORLD CHAMPIONS')} · ★★
        <span style={{ color: 'var(--ts-muted)', fontWeight: 600 }}> {WC_FINAL.titles.previous} · 2026</span>
      </div>

      {/* Scoreline */}
      <div style={{ margin: '18px auto 0', maxWidth: 420, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ flex: 1, textAlign: 'right', fontSize: 15, fontWeight: 800, color: 'var(--ts-text)' }}>
            {WC_FINAL.champion.flag} {champion}
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 30, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {WC_FINAL.score.home}–{WC_FINAL.score.away}
          </span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 600, color: 'var(--ts-muted)' }}>
            {runnerUp} {WC_FINAL.runnerUp.flag}
          </span>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ts-hairline)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 14px', fontSize: 11.5, color: 'var(--ts-muted)' }}>
          <span>⚽ {WC_FINAL.goal.player} {WC_FINAL.goal.minute}&apos;</span>
          <span>{t(lang, 'Tras prórroga', 'After extra time')}</span>
          <span>{dateStr}</span>
          <span>{WC_FINAL.attendance.toLocaleString(en ? 'en-US' : 'es-ES')} {t(lang, 'espectadores', 'fans')}</span>
        </div>
      </div>

      {/* Match summary */}
      <div style={{ margin: '16px auto 0', maxWidth: 680, textAlign: 'left' }}>
        {summary.map((p, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0', fontSize: 13.5, lineHeight: 1.7, color: 'var(--ts-muted)' }}>{p}</p>
        ))}
      </div>

      {/* Individual awards */}
      <div style={{ margin: '18px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, maxWidth: 680 }}>
        {WC_AWARDS.map(a => {
          const inner = (
            <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: '10px 12px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
                {a.icon} {en ? a.en : a.es}
              </div>
              <div style={{ marginTop: 4, fontSize: 13.5, fontWeight: 800, color: 'var(--ts-text)' }}>{a.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ts-faint)' }}>{en ? a.detail_en : a.detail_es}</div>
            </div>
          )
          return 'slug' in a && a.slug
            ? <Link key={a.key} href={`/${lang}/jugadores/${a.slug}`} style={{ textDecoration: 'none' }}>{inner}</Link>
            : <div key={a.key}>{inner}</div>
        })}
      </div>

      {nationSlug && (
        <Link
          href={`/${lang}/mundial-2026/${nationSlug}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, minHeight: 44, padding: '10px 18px', borderRadius: 8, background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)', color: 'var(--ts-primary)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
        >
          {t(lang, 'La campaña de España, partido a partido', "Spain's campaign, match by match")} →
        </Link>
      )}
    </section>
  )
}
