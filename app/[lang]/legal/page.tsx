import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/legal'
  return {
    title: en ? 'Legal Notice' : 'Aviso Legal',
    description: en
      ? 'Legal notice and terms of use of TopScorers, the European football stats platform.'
      : 'Aviso legal y condiciones de uso de TopScorers, plataforma de estadísticas de fútbol europeo.',
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: en ? 'Legal Notice — TopScorers' : 'Aviso Legal — TopScorers',
      description: en
        ? 'Legal notice and terms of use of TopScorers.'
        : 'Aviso legal y condiciones de uso de TopScorers.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary',
      title: en ? 'Legal Notice — TopScorers' : 'Aviso Legal — TopScorers',
      description: en
        ? 'Legal notice and terms of use of TopScorers.'
        : 'Aviso legal y condiciones de uso de TopScorers.',
    },
  }
}

const C = {
  bg: '#0a0908', sf: '#15130f', bd: '#2a2620', tx: '#f1e8d2',
  mu: '#9a917e', gd: '#f0c040',
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['Legal'] : ['Legal']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <div className="max-w-[720px] mx-auto px-2 py-4">

        <div className="mb-2 text-[10px] font-bold tracking-[3px] uppercase" style={{ color: C.gd, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Aviso legal
        </div>
        <h1
          className="leading-none mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px,6vw,56px)', fontWeight: 700, letterSpacing: 1, color: C.tx }}
        >
          Términos de uso
        </h1>
        <p className="mb-10 text-[12px]" style={{ color: C.mu }}>Última actualización: mayo 2025</p>

        <div className="flex flex-col gap-7" style={{ fontSize: 13, color: C.mu, lineHeight: 1.8 }}>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>1. Identificación del titular</h2>
            <p>
              El presente sitio web, accesible en <strong style={{ color: C.tx }}>top-scorers.com</strong>, es operado a título personal con carácter informativo y sin ánimo de lucro directo derivado de los datos publicados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>2. Objeto y aceptación</h2>
            <p>
              El acceso y uso del sitio implica la aceptación plena y sin reservas de los presentes términos. Si no estás de acuerdo, te rogamos que no utilices el servicio.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>3. Propiedad intelectual</h2>
            <p>
              El código fuente, diseño, estructura y contenidos originales de TopScorers están protegidos por derechos de autor. Los datos estadísticos de terceros son propiedad de sus respectivos titulares y se reproducen con finalidad informativa.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>4. Exactitud de la información</h2>
            <p>
              Los datos se recopilan de fuentes públicas y pueden contener inexactitudes o desfases temporales. TopScorers no garantiza la exactitud, integridad ni actualidad de la información. Para datos oficiales, consulta las fuentes indicadas en cada estadística.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>5. Suscripción y pagos</h2>
            <p>
              Los planes de pago (Pro) se gestionan a través de Stripe. Las suscripciones se renuevan automáticamente salvo cancelación expresa. Puedes cancelar en cualquier momento desde tu área de cuenta, manteniendo el acceso hasta el final del período facturado.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>6. Limitación de responsabilidad</h2>
            <p>
              El titular no será responsable de los daños directos o indirectos derivados del uso o imposibilidad de uso del servicio, interrupciones, errores de datos o accesos no autorizados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>7. Ley aplicable</h2>
            <p>
              Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>8. Contacto</h2>
            <p>
              <a href="mailto:support@top-scorers.com" style={{ color: C.gd }}>support@top-scorers.com</a>
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.bd}` }}>
          <Link href="/" className="text-[12px] font-semibold" style={{ color: C.mu }}>
            ← Volver a la app
          </Link>
        </div>
      </div>
    </SaasShell>
  )
}
