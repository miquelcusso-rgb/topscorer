'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { getUserPlan } from '@/lib/plans'
import { useLang } from '@/contexts/LangContext'
import { t, type Lang, type TKey } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { track } from '@/lib/analytics'

type Billing = 'monthly' | 'yearly'

// Theme-aware: dark in dark mode, white/cream in light mode (the pricing page
// previously hardcoded a dark palette → the highlighted Pro card was unreadable
// in light mode).
const C = {
  gd: 'var(--ts-primary)', pu: 'var(--ts-teal)', gr: '#38c47a', bl: 'var(--ts-teal)',
  tx: 'var(--ts-text)', mu: 'var(--ts-muted)', bd: 'var(--ts-border)', sf: 'var(--ts-card)', s2: 'var(--ts-card2)',
  faint: 'var(--ts-faint)',
}

// Feature cell value: boolean checkmark/dash, 'soon' token, or a translation key to resolve at render.
type FeatureValue = boolean | 'soon' | { key: TKey }

const COMPARISON: { labelKey: TKey; free: FeatureValue; pro: FeatureValue; scout: FeatureValue }[] = [
  // ─── CORE (libre y competitivo con FotMob / FBref / Transfermarkt) ───────
  { labelKey: 'pricing_cmp_cross_league', free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_players',      free: { key: 'pricing_val_top25' },      pro: { key: 'pricing_val_top50' },         scout: { key: 'pricing_val_top100' }     },
  { labelKey: 'pricing_cmp_seasons',      free: { key: 'pricing_val_full_history' },pro: { key: 'pricing_val_full_history' }, scout: { key: 'pricing_val_full_history' }},
  { labelKey: 'pricing_cmp_basic_stats',  free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_adv_stats',    free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_shots',        free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_physical',     free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_radar',        free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_comparator',   free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_trajectory',   free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_tables',       free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_community',    free: true,                              pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_badges',       free: true,                              pro: true,                                 scout: true                              },

  // ─── PRO MOAT (publicidad + perks de comunidad + watchlist amplia) ───────
  { labelKey: 'pricing_cmp_ads',          free: { key: 'pricing_val_ads_warn' },   pro: { key: 'pricing_val_ad_free' },       scout: { key: 'pricing_val_ad_free' }    },
  { labelKey: 'pricing_cmp_scout_radar',  free: false,                             pro: true,                                 scout: true                              },
  { labelKey: 'pricing_cmp_watchlist',    free: { key: 'pricing_val_upto10' },     pro: { key: 'pricing_val_upto50' },        scout: { key: 'pricing_val_unlimited_f' }},
  { labelKey: 'pricing_cmp_saved_comp',   free: { key: 'pricing_val_upto5' },      pro: { key: 'pricing_val_unlimited_f' },   scout: { key: 'pricing_val_unlimited_f' }},
  { labelKey: 'pricing_cmp_export',       free: { key: 'pricing_val_export_free_5' },pro: { key: 'pricing_val_export_pro_100' }, scout: { key: 'pricing_val_unlimited_m' }},
  { labelKey: 'pricing_cmp_early_access', free: false,                             pro: { key: 'pricing_val_early_24h' },     scout: { key: 'pricing_val_early_48h' }  },
  { labelKey: 'pricing_cmp_pickem_mult',  free: false,                             pro: { key: 'pricing_val_mult_2x' },       scout: { key: 'pricing_val_mult_2x' }    },

  // ─── SCOUT EXCLUSIVE ─────────────────────────────────────────────────────
  { labelKey: 'pricing_cmp_alerts',       free: false,                             pro: false,                                scout: 'soon'                            },
  { labelKey: 'pricing_cmp_mbm',          free: false,                             pro: false,                                scout: true                              },
  { labelKey: 'pricing_cmp_api',          free: false,                             pro: false,                                scout: true                              },
  { labelKey: 'pricing_cmp_adv_filters',  free: false,                             pro: false,                                scout: true                              },
  { labelKey: 'pricing_cmp_support',      free: false,                             pro: false,                                scout: true                              },
]

const FAQ: { q: TKey; a: TKey }[] = [
  { q: 'pricing_faq_q1', a: 'pricing_faq_a1' },
  { q: 'pricing_faq_q2', a: 'pricing_faq_a2' },
  { q: 'pricing_faq_q3', a: 'pricing_faq_a3' },
  { q: 'pricing_faq_q4', a: 'pricing_faq_a4' },
  { q: 'pricing_faq_q5', a: 'pricing_faq_a5' },
  { q: 'pricing_faq_q6', a: 'pricing_faq_a6' },
]

function Cell({ v, lang }: { v: FeatureValue; lang: Lang }) {
  if (v === true)    return <span style={{ color: C.gr, fontSize: 15 }}>✓</span>
  if (v === false)   return <span style={{ color: 'var(--ts-faint)', fontSize: 15 }}>—</span>
  if (v === 'soon')  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ color: C.bl, background: 'rgba(0,200,176,.12)', border: '1px solid rgba(0,200,176,.22)' }}>
      {t('pricing_soon_short', lang)}
    </span>
  )
  return <span style={{ color: C.tx, fontSize: 12 }}>{t(v.key, lang)}</span>
}

interface CardProps {
  name: string
  price: number
  billing: Billing
  perMonth?: number
  savePercent?: number
  desc: string
  accent?: string
  badge?: string
  badgeColor?: string
  highlight?: boolean
  cta: string
  ctaHref: string
  ctaVariant: 'gold' | 'purple' | 'ghost' | 'scout'
  features: string[]
  locked?: string[]
  disabled?: boolean
  comingSoon?: boolean
  onCtaClick?: () => void
  contextLine?: string
  lang: Lang
}

function PlanCard({ name, price, billing, perMonth, savePercent, desc, accent, badge, badgeColor, highlight, cta, ctaHref, ctaVariant, features, locked, disabled, comingSoon, onCtaClick, contextLine, lang }: CardProps) {
  const a = accent ?? (highlight ? C.gd : C.bd)
  const bColor = badgeColor ?? a
  return (
    <div
      className="flex flex-col rounded-sm relative"
      style={{
        background: C.sf,
        border: `1px solid ${highlight ? C.gd : accent ? accent + '55' : C.bd}`,
        boxShadow: highlight ? '0 0 60px rgba(240,192,64,.07), inset 0 1px 0 rgba(240,192,64,.08)' : 'none',
      }}
    >
      {badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-[2px] uppercase px-3 py-0.5 rounded-full"
          style={{ background: bColor, color: '#0a0908' }}
        >
          {badge}
        </div>
      )}

      <div className="p-6 pb-4">
        <div className="text-[10px] font-bold tracking-[3px] uppercase mb-2" style={{ color: a }}>
          {name}
        </div>

        <div className="flex items-end gap-1 mb-1">
          {price === 0 ? (
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, color: C.tx, lineHeight: 1 }}>{t('pricing_free_price', lang)}</span>
          ) : (
            <>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, color: C.tx, lineHeight: 1 }}>€{price}</span>
              <span className="text-[12px] pb-2" style={{ color: C.mu }}>/{billing === 'monthly' ? t('pricing_per_month', lang) : t('pricing_per_year', lang)}</span>
            </>
          )}
        </div>

        {perMonth && savePercent && (
          <div className="text-[11px] mb-1" style={{ color: C.mu }}>
            €{perMonth}{t('pricing_per_month_unit', lang)} · <span style={{ color: C.gr }}>{t('pricing_save', lang)} {savePercent}%</span>
          </div>
        )}

        {contextLine && (
          <div className="text-[10px] mb-2" style={{ color: 'var(--ts-faint)' }}>{contextLine}</div>
        )}

        <p className="text-[12px] leading-relaxed" style={{ color: C.mu }}>{desc}</p>
      </div>

      <div className="flex flex-col gap-2 px-6 py-4 flex-1">
        {features.map(f => {
          const soonSuffix = ` — ${t('pricing_soon_short', lang)}`
          const soon = f.endsWith(soonSuffix)
          const text = soon ? f.slice(0, -soonSuffix.length) : f
          const isWarning = f.startsWith('⚠')
          return (
            <div key={f} className="flex items-start gap-2 text-[12.5px]">
              <span className="shrink-0 mt-0.5" style={{ color: soon ? C.bl : isWarning ? '#c48a30' : C.gr }}>
                {soon ? '◷' : isWarning ? '' : '✓'}
              </span>
              <span style={{ color: soon ? 'var(--ts-muted)' : isWarning ? '#9a7a40' : C.tx }}>
                {text}
                {soon && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ color: C.bl, background: 'rgba(0,200,176,.12)', border: '1px solid rgba(0,200,176,.22)' }}>
                    {t('pricing_soon_short', lang)}
                  </span>
                )}
              </span>
            </div>
          )
        })}
        {locked?.map(f => (
          <div key={f} className="flex items-start gap-2 text-[12.5px]">
            <span className="shrink-0 mt-0.5" style={{ color: 'var(--ts-faint)' }}>—</span>
            <span style={{ color: 'var(--ts-faint)', textDecoration: 'line-through', textDecorationColor: 'var(--ts-faint)' }}>{f}</span>
          </div>
        ))}
      </div>

      <div className="p-6 pt-4">
        {comingSoon ? (
          <div
            className="block text-center text-[13px] font-bold py-2.5 rounded-sm"
            style={{ background: 'rgba(90,90,122,.1)', color: '#9a917e', border: '1px solid rgba(90,90,122,.35)' }}
          >
            COMING SOON
          </div>
        ) : disabled ? (
          <div
            className="block text-center text-[13px] font-bold py-2.5 rounded-sm"
            style={{ background: 'rgba(56,196,122,.1)', color: C.gr, border: '1px solid rgba(56,196,122,.25)' }}
          >
            {t('pricing_plan_active', lang)}
          </div>
        ) : (
          <button
            onClick={onCtaClick ?? (() => { window.location.href = ctaHref })}
            className="w-full text-center text-[13px] font-bold py-3.5 rounded-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            style={
              ctaVariant === 'gold'   ? { background: C.gd, color: '#0a0908', border: `1px solid ${C.gd}` } :
              ctaVariant === 'purple' ? { background: 'rgba(0,200,176,.15)', color: C.pu, border: '1px solid rgba(0,200,176,.35)' } :
              ctaVariant === 'scout'  ? { background: 'rgba(0,200,176,.15)', color: C.pu, border: '1px solid rgba(0,200,176,.35)' } :
              { background: C.s2, color: C.tx, border: `1px solid ${C.bd}` }
            }
          >
            {cta}
            <span style={{ opacity: 0.7 }}>→</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const { user } = useUser()
  const clerk = useClerk()
  const { lang } = useLang()
  const plan = getUserPlan(user?.publicMetadata as Record<string, unknown>)

  function handleProCta(ctaHref: string) {
    // GA4 conversion: fire begin_checkout just before leaving for Stripe.
    // Works for both Pro and Scout (plan/billing read from the CTA href).
    const params = new URLSearchParams(ctaHref.split('?')[1] ?? '')
    track('begin_checkout', {
      plan: params.get('plan') ?? undefined,
      billing: params.get('billing') ?? undefined,
    })

    if (!user) {
      clerk.openSignIn({ forceRedirectUrl: ctaHref })
    } else {
      window.location.href = ctaHref
    }
  }

  const breadcrumb = lang === 'en' ? ['Pricing'] : ['Precios']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb} plan={plan}>
      <main className="max-w-[1100px] mx-auto px-2 py-4">

        {/* Hero (slimmer — SaasShell provides chrome) */}
        <div className="text-center mb-8">
          <div className="text-[10px] font-bold tracking-[3.5px] uppercase mb-2" style={{ color: C.gd }}>
            {t('pricing_eyebrow', lang)}
          </div>
          <h1
            className="leading-none mb-3 font-bold"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-text)' }}
          >
            {t('pricing_h1_pre', lang)} <span style={{ color: C.gd }}>{t('pricing_h1_accent', lang)}</span>
          </h1>
          <p className="text-[14px] max-w-[520px] mx-auto leading-relaxed text-center" style={{ color: 'var(--ts-muted)' }}>
            {t('pricing_subtitle_pre', lang)}<span style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{t('pricing_subtitle_em', lang)}</span>.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex rounded-full p-0.5" style={{ background: C.s2, border: `1px solid ${C.bd}` }}>
            {(['monthly', 'yearly'] as Billing[]).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="flex items-center gap-2 px-5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 cursor-pointer"
                style={billing === b
                  ? { background: C.gd, color: '#0a0908' }
                  : { background: 'transparent', color: C.mu }
                }
              >
                {b === 'monthly' ? t('pricing_monthly', lang) : t('pricing_yearly', lang)}
                {b === 'yearly' && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={billing === 'yearly'
                      ? { color: '#0a0908', background: 'rgba(0,0,0,.2)' }
                      : { color: C.gr, background: 'rgba(56,196,122,.15)', border: '1px solid rgba(56,196,122,.3)' }
                    }
                  >
                    {t('pricing_save_badge', lang)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 max-w-[1100px] mx-auto">
          <PlanCard
            name="Free"
            price={0}
            billing={billing}
            lang={lang}
            desc={t('pricing_free_desc', lang)}
            highlight={false}
            cta={t('pricing_free_cta', lang)}
            ctaHref="/"
            ctaVariant="ghost"
            disabled={plan === 'free' && !!user}
            features={[
              t('pricing_free_f1', lang),
              t('pricing_free_f2', lang),
              t('pricing_free_f3', lang),
              t('pricing_free_f4', lang),
              t('pricing_free_f5', lang),
            ]}
          />

          <PlanCard
            name="Pro"
            price={billing === 'monthly' ? 2.99 : 24.99}
            billing={billing}
            lang={lang}
            perMonth={billing === 'yearly' ? 2.08 : undefined}
            savePercent={billing === 'yearly' ? 30 : undefined}
            desc={t('pricing_pro_desc', lang)}
            highlight={true}
            badge={t('pricing_pro_badge', lang)}
            badgeColor={C.gd}
            cta={t('pricing_pro_cta', lang)}
            ctaHref={`/api/stripe/checkout?plan=pro&billing=${billing}`}
            ctaVariant="gold"
            disabled={plan === 'pro'}
            onCtaClick={() => handleProCta(`/api/stripe/checkout?plan=pro&billing=${billing}`)}
            contextLine={t('pricing_pro_context', lang)}
            features={[
              t('pricing_pro_f1', lang),
              t('pricing_pro_f2', lang),
              t('pricing_pro_f3', lang),
              t('pricing_pro_f4', lang),
              t('pricing_pro_f5', lang),
              t('pricing_pro_f6', lang),
              t('pricing_pro_f7', lang),
              t('pricing_pro_f8', lang),
            ]}
          />

          <PlanCard
            name="Scout"
            price={billing === 'monthly' ? 5.99 : 49.99}
            billing={billing}
            lang={lang}
            perMonth={billing === 'yearly' ? 4.17 : undefined}
            savePercent={billing === 'yearly' ? 30 : undefined}
            desc={t('pricing_scout_desc', lang)}
            accent={'#9a917e'}
            highlight={false}
            badge={t('pricing_scout_badge', lang)}
            badgeColor={'#9a917e'}
            cta={t('pricing_scout_cta', lang)}
            ctaHref={`/api/stripe/checkout?plan=scout&billing=${billing}`}
            ctaVariant="ghost"
            disabled={plan === 'scout'}
            onCtaClick={() => handleProCta(`/api/stripe/checkout?plan=scout&billing=${billing}`)}
            features={[
              t('pricing_scout_f1', lang),
              t('pricing_scout_f2', lang),
              t('pricing_scout_f3', lang),
              t('pricing_scout_f4', lang),
              t('pricing_scout_f5', lang),
              t('pricing_scout_f6', lang),
              t('pricing_scout_f7', lang),
              t('pricing_scout_f8', lang),
              t('pricing_scout_f9', lang),
            ]}
          />
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2
            className="text-center mb-8 leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, letterSpacing: 2 }}
          >
            {t('pricing_cmp_title', lang)}
          </h2>
          <div className="overflow-x-auto" style={{ border: `1px solid ${C.bd}`, borderRadius: 2 }}>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr style={{ background: C.sf, borderBottom: `1px solid ${C.bd}` }}>
                  <th className="py-3 px-5 text-left font-semibold" style={{ color: C.mu, width: '45%' }}>{t('pricing_cmp_feature', lang)}</th>
                  <th className="py-3 px-4 text-center font-semibold" style={{ color: C.mu }}>Free</th>
                  <th className="py-3 px-4 text-center font-bold" style={{ color: C.gd }}>Pro</th>
                  <th className="py-3 px-4 text-center font-bold" style={{ color: C.pu }}>Scout</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.labelKey}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.012)',
                      borderBottom: i < COMPARISON.length - 1 ? `1px solid rgba(30,30,52,.8)` : 'none',
                    }}
                  >
                    <td className="py-3 px-5 font-medium" style={{ color: C.tx }}>{t(row.labelKey, lang)}</td>
                    <td className="py-3 px-4 text-center"><Cell v={row.free} lang={lang} /></td>
                    <td className="py-3 px-4 text-center"><Cell v={row.pro} lang={lang} /></td>
                    <td className="py-3 px-4 text-center"><Cell v={row.scout} lang={lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2
            className="text-center mb-8 leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, letterSpacing: 2 }}
          >
            {t('pricing_faq_title', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map(item => (
              <div
                key={item.q}
                className="p-5 rounded-sm"
                style={{ background: C.sf, border: `1px solid ${C.bd}` }}
              >
                <p className="font-semibold mb-2 text-[13px]" style={{ color: C.tx }}>{t(item.q, lang)}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: C.mu }}>{t(item.a, lang)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="text-center py-10 rounded-sm"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(240,192,64,.04) 0%, transparent 70%)',
            border: `1px solid rgba(240,192,64,.1)`,
          }}
        >
          <p className="text-[13px] mb-5" style={{ color: C.mu }}>
            {t('pricing_questions', lang)}{' '}
            <a href="mailto:support@top-scorers.com" style={{ color: C.tx }}>
              support@top-scorers.com
            </a>
          </p>
          <Link
            href="/"
            className="inline-block text-[12px] font-semibold px-4 py-2 rounded-sm transition-all duration-150"
            style={{ color: C.gd, border: `1px solid rgba(240,192,64,.25)`, background: 'rgba(240,192,64,.05)' }}
          >
            {t('pricing_back_app', lang)}
          </Link>
        </div>

      </main>
    </SaasShell>
  )
}
