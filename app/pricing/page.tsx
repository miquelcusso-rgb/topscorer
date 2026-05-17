'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { getUserPlan } from '@/lib/plans'

type Billing = 'monthly' | 'yearly'

const C = {
  gd: '#f0c040', pu: '#a060ff', gr: '#38c47a', bl: '#4a9eff',
  tx: '#e5e5f2', mu: '#5a5a7a', bd: '#1e1e34', sf: '#0e0e1c', s2: '#151528',
}

const COMPARISON = [
  { label: 'Jugadores visibles',   free: 'Top 10',           pro: 'Top 25 + Top 50'   },
  { label: 'Temporadas',           free: '2 (25/26, 24/25)', pro: '5+ (desde 20/21)'  },
  { label: 'Filtros liga / edad',  free: true,               pro: true                },
  { label: 'ELO & Fantasy',        free: true,               pro: true                },
  { label: 'Hover card',           free: 'Básico',           pro: 'Completo'          },
  { label: 'Columnas custom',      free: false,              pro: true                },
  { label: 'Sin publicidad',       free: false,              pro: true                },
  { label: 'Watchlist privada',    free: false,              pro: 'soon'              },
  { label: 'Comparador jugadores', free: false,              pro: 'soon'              },
  { label: 'Export CSV',           free: false,              pro: 'soon'              },
]

const FAQ = [
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí, sin permanencia. Cancelas desde tu cuenta y mantienes acceso hasta el final del período ya pagado.',
  },
  {
    q: '¿Hay período de prueba?',
    a: 'La versión Free es completamente gratuita para siempre. No hay prueba de tiempo limitado — simplemente empieza con Free y actualiza cuando lo necesites.',
  },
  {
    q: '¿Qué métodos de pago aceptáis?',
    a: 'Tarjeta de crédito/débito (Visa, Mastercard, Amex) y SEPA Direct Debit para cuentas europeas, todo gestionado de forma segura a través de Stripe.',
  },
  {
    q: '¿Con qué frecuencia se actualizan los datos?',
    a: 'Los datos de la temporada en curso (25/26) se actualizan periódicamente desde las fuentes indicadas. Las temporadas anteriores son históricos consolidados.',
  },
  {
    q: '¿Puedo cambiar de mensual a anual?',
    a: 'Sí, puedes cambiar en cualquier momento desde tu cuenta. Al cambiar a anual se aplica un prorrateo del período restante.',
  },
]

type FeatureValue = boolean | string

function Cell({ v }: { v: FeatureValue }) {
  if (v === true)    return <span style={{ color: C.gr, fontSize: 15 }}>✓</span>
  if (v === false)   return <span style={{ color: '#2a2a48', fontSize: 15 }}>—</span>
  if (v === 'soon')  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ color: C.bl, background: 'rgba(74,158,255,.12)', border: '1px solid rgba(74,158,255,.22)' }}>
      Próx.
    </span>
  )
  return <span style={{ color: C.tx, fontSize: 12 }}>{v}</span>
}

interface CardProps {
  name: string
  price: number
  billing: Billing
  perMonth?: number
  desc: string
  accent?: string
  badge?: string
  highlight?: boolean
  cta: string
  ctaHref: string
  ctaVariant: 'gold' | 'purple' | 'ghost'
  features: string[]
  locked?: string[]
  disabled?: boolean
  onCtaClick?: () => void
}

function PlanCard({ name, price, billing, perMonth, desc, accent, badge, highlight, cta, ctaHref, ctaVariant, features, locked, disabled, onCtaClick }: CardProps) {
  const a = accent ?? (highlight ? C.gd : C.bd)
  return (
    <div
      className="flex flex-col rounded-sm relative"
      style={{
        background: highlight ? 'rgba(240,192,64,.035)' : C.sf,
        border: `1px solid ${highlight ? C.gd : accent ? accent + '55' : C.bd}`,
        boxShadow: highlight ? '0 0 60px rgba(240,192,64,.07), inset 0 1px 0 rgba(240,192,64,.08)' : 'none',
      }}
    >
      {badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-[2px] uppercase px-3 py-0.5 rounded-full"
          style={{ background: a, color: '#07070f' }}
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
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 44, color: C.tx, lineHeight: 1 }}>Gratis</span>
          ) : (
            <>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 44, color: C.tx, lineHeight: 1 }}>€{price}</span>
              <span className="text-[12px] pb-2" style={{ color: C.mu }}>/{billing === 'monthly' ? 'mes' : 'año'}</span>
            </>
          )}
        </div>

        {perMonth && (
          <div className="text-[11px] mb-2" style={{ color: C.mu }}>
            €{perMonth}/mes · <span style={{ color: C.gr }}>2 meses gratis</span>
          </div>
        )}

        <p className="text-[12px] leading-relaxed" style={{ color: C.mu }}>{desc}</p>
      </div>

      <div className="flex flex-col gap-2 px-6 py-4 flex-1">
        {features.map(f => {
          const soon = f.endsWith(' — Próx.')
          const text = f.replace(' — Próx.', '')
          return (
            <div key={f} className="flex items-start gap-2 text-[12.5px]">
              <span className="shrink-0 mt-0.5" style={{ color: soon ? C.bl : C.gr }}>
                {soon ? '◷' : '✓'}
              </span>
              <span style={{ color: soon ? '#5a5a9a' : C.tx }}>
                {text}
                {soon && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ color: C.bl, background: 'rgba(74,158,255,.12)', border: '1px solid rgba(74,158,255,.22)' }}>
                    Próx.
                  </span>
                )}
              </span>
            </div>
          )
        })}
        {locked?.map(f => (
          <div key={f} className="flex items-start gap-2 text-[12.5px]">
            <span className="shrink-0 mt-0.5" style={{ color: '#2a2a48' }}>—</span>
            <span style={{ color: '#2a2a48', textDecoration: 'line-through', textDecorationColor: '#2a2a48' }}>{f}</span>
          </div>
        ))}
      </div>

      <div className="p-6 pt-4">
        {disabled ? (
          <div
            className="block text-center text-[13px] font-bold py-2.5 rounded-sm"
            style={{ background: 'rgba(56,196,122,.1)', color: C.gr, border: '1px solid rgba(56,196,122,.25)' }}
          >
            ✓ Plan activo
          </div>
        ) : (
          <button
            onClick={onCtaClick ?? (() => { window.location.href = ctaHref })}
            className="w-full text-center text-[13px] font-bold py-3.5 rounded-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            style={
              ctaVariant === 'gold'   ? { background: C.gd, color: '#07070f', border: `1px solid ${C.gd}` } :
              ctaVariant === 'purple' ? { background: 'rgba(160,96,255,.15)', color: C.pu, border: '1px solid rgba(160,96,255,.35)' } :
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
  const plan = getUserPlan(user?.publicMetadata as Record<string, unknown>)

  function handleProCta(ctaHref: string) {
    if (!user) {
      clerk.openSignIn({ forceRedirectUrl: ctaHref })
    } else {
      window.location.href = ctaHref
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070f' }}>
      <main className="max-w-[1100px] mx-auto px-4 py-14">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-[10px] font-bold tracking-[3.5px] uppercase mb-3" style={{ color: C.gd }}>
            Planes y precios
          </div>
          <h1
            className="leading-none mb-4"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(40px, 7vw, 80px)', letterSpacing: 2 }}
          >
            Elige tu <span style={{ color: C.gd }}>plan</span>
          </h1>
          <p className="text-[14px] max-w-[500px] mx-auto leading-relaxed" style={{ color: C.mu }}>
            Desde el Top 10 gratuito hasta datos históricos de 5+ temporadas, columnas personalizables y herramientas de análisis avanzado.
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
                  ? { background: C.gd, color: '#07070f' }
                  : { background: 'transparent', color: C.mu }
                }
              >
                {b === 'monthly' ? 'Mensual' : 'Anual'}
                {b === 'yearly' && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={billing === 'yearly'
                      ? { color: '#07070f', background: 'rgba(0,0,0,.2)' }
                      : { color: C.gr, background: 'rgba(56,196,122,.15)', border: '1px solid rgba(56,196,122,.3)' }
                    }
                  >
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16 max-w-[760px] mx-auto">
          <PlanCard
            name="Free"
            price={0}
            billing={billing}
            desc="Para explorar sin compromiso. Sin registro."
            highlight={false}
            cta="Empezar gratis"
            ctaHref="/"
            ctaVariant="ghost"
            disabled={plan === 'free' && !!user}
            features={[
              'Top 10 goleadores / asistentes',
              '2 temporadas (25/26 + 24/25)',
              'Filtros de liga y edad',
              'Hover card con estadísticas',
              'ELO y Fantasy',
              'Sin registro necesario',
            ]}
            locked={[
              'Top 25 y Top 50',
              '5+ temporadas históricas',
              'Columnas personalizables',
              'Watchlist y comparador',
            ]}
          />

          <PlanCard
            name="Pro"
            price={billing === 'monthly' ? 5 : 48}
            billing={billing}
            perMonth={billing === 'yearly' ? 4 : undefined}
            desc="Para el analista de fútbol serio."
            highlight={true}
            badge="Más popular"
            cta="Empezar Pro"
            ctaHref={`/api/stripe/checkout?plan=pro&billing=${billing}`}
            ctaVariant="gold"
            disabled={plan === 'pro'}
            onCtaClick={() => handleProCta(`/api/stripe/checkout?plan=pro&billing=${billing}`)}
            features={[
              'Top 25 + toggle Top 50',
              '5+ temporadas (hasta 20/21)',
              'Columnas totalmente personalizables',
              'Sin publicidad',
              'ELO y Fantasy completo',
              'Watchlist privada — Próx.',
              'Comparador de jugadores — Próx.',
              'Export CSV — Próx.',
            ]}
          />
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2
            className="text-center mb-8 leading-none"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, letterSpacing: 2 }}
          >
            Comparativa completa
          </h2>
          <div className="overflow-x-auto" style={{ border: `1px solid ${C.bd}`, borderRadius: 2 }}>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr style={{ background: C.sf, borderBottom: `1px solid ${C.bd}` }}>
                  <th className="py-3 px-5 text-left font-semibold" style={{ color: C.mu, width: '55%' }}>Feature</th>
                  <th className="py-3 px-4 text-center font-semibold" style={{ color: C.mu }}>Free</th>
                  <th className="py-3 px-4 text-center font-bold" style={{ color: C.gd }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.012)',
                      borderBottom: i < COMPARISON.length - 1 ? `1px solid rgba(30,30,52,.8)` : 'none',
                    }}
                  >
                    <td className="py-3 px-5 font-medium" style={{ color: C.tx }}>{row.label}</td>
                    <td className="py-3 px-4 text-center"><Cell v={row.free} /></td>
                    <td className="py-3 px-4 text-center"><Cell v={row.pro} /></td>
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
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, letterSpacing: 2 }}
          >
            Preguntas frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map(item => (
              <div
                key={item.q}
                className="p-5 rounded-sm"
                style={{ background: C.sf, border: `1px solid ${C.bd}` }}
              >
                <p className="font-semibold mb-2 text-[13px]" style={{ color: C.tx }}>{item.q}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: C.mu }}>{item.a}</p>
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
            ¿Tienes preguntas?{' '}
            <a href="mailto:support@top-scorers.com" style={{ color: C.tx }}>
              support@top-scorers.com
            </a>
          </p>
          <Link
            href="/"
            className="inline-block text-[12px] font-semibold px-4 py-2 rounded-sm transition-all duration-150"
            style={{ color: C.gd, border: `1px solid rgba(240,192,64,.25)`, background: 'rgba(240,192,64,.05)' }}
          >
            ← Volver a la app
          </Link>
        </div>

      </main>
    </div>
  )
}
