import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/privacidad'
  return {
    title: 'Política de Privacidad — TopScorers',
    description: 'Política de privacidad de TopScorers: cómo tratamos y protegemos tus datos personales en nuestra plataforma de estadísticas de fútbol.',
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
      title: 'Política de Privacidad — TopScorers',
      description: 'Cómo tratamos y protegemos tus datos personales en TopScorers.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Política de Privacidad — TopScorers',
      description: 'Cómo tratamos y protegemos tus datos personales en TopScorers.',
    },
  }
}

const C = {
  bg: '#07070f', sf: '#0c0d1a', bd: '#151626', tx: '#d8d8ec',
  mu: '#52526e', gd: '#f0c040',
}

export default function PrivacidadPage() {
  return (
    <main style={{ minHeight: '100vh', background: C.bg }}>
      <div className="max-w-[720px] mx-auto px-5 py-14">

        <div className="mb-2 text-[10px] font-bold tracking-[3px] uppercase" style={{ color: C.gd, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Privacidad
        </div>
        <h1
          className="leading-none mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px,6vw,56px)', fontWeight: 700, letterSpacing: 1, color: C.tx }}
        >
          Política de privacidad
        </h1>
        <p className="mb-10 text-[12px]" style={{ color: C.mu }}>Última actualización: mayo 2025</p>

        <div className="flex flex-col gap-7" style={{ fontSize: 13, color: C.mu, lineHeight: 1.8 }}>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos es el titular del sitio web <strong style={{ color: C.tx }}>top-scorers.com</strong>, contactable en{' '}
              <a href="mailto:support@top-scorers.com" style={{ color: C.gd }}>support@top-scorers.com</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>2. Datos que recogemos</h2>
            <div className="flex flex-col gap-2">
              {[
                { tipo: 'Cuenta', detalle: 'Email y contraseña (gestionados por Clerk). No almacenamos contraseñas en nuestros servidores.' },
                { tipo: 'Uso', detalle: 'Datos de navegación anónimos mediante Vercel Analytics y Speed Insights para mejorar el rendimiento.' },
                { tipo: 'Pago', detalle: 'Los datos de pago son procesados exclusivamente por Stripe. TopScorers no almacena datos de tarjeta.' },
                { tipo: 'Watchlist', detalle: 'Si usas la watchlist (plan Pro), los nombres de jugadores guardados se almacenan en nuestra base de datos (Supabase) asociados a tu cuenta.' },
              ].map(item => (
                <div key={item.tipo} className="flex gap-3 p-3 rounded-sm" style={{ background: C.sf, border: `1px solid ${C.bd}` }}>
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-sm self-start mt-0.5" style={{ color: C.gd, background: 'rgba(240,192,64,.1)', border: '1px solid rgba(240,192,64,.2)' }}>
                    {item.tipo}
                  </span>
                  <span className="text-[12px]" style={{ color: C.mu }}>{item.detalle}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>3. Finalidad del tratamiento</h2>
            <p>
              Los datos se utilizan exclusivamente para: (a) gestionar el acceso a la cuenta, (b) procesar pagos de suscripción, (c) proporcionar las funcionalidades del servicio y (d) mejorar la experiencia de usuario de forma agregada y anónima.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>4. Terceros y transferencias</h2>
            <p>
              Utilizamos los siguientes proveedores de confianza: <strong style={{ color: C.tx }}>Clerk</strong> (autenticación), <strong style={{ color: C.tx }}>Stripe</strong> (pagos), <strong style={{ color: C.tx }}>Supabase</strong> (base de datos), <strong style={{ color: C.tx }}>Vercel</strong> (hosting y analítica). Ningún dato se vende a terceros.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>5. Conservación de datos</h2>
            <p>
              Los datos de cuenta se conservan mientras la cuenta esté activa y durante el tiempo legalmente exigido tras su cancelación. Puedes solicitar la eliminación completa de tu cuenta en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>6. Tus derechos</h2>
            <p>
              Tienes derecho a acceder, rectificar, suprimir, oponerte y portar tus datos personales, así como a retirar el consentimiento en cualquier momento. Ejerce tus derechos en{' '}
              <a href="mailto:support@top-scorers.com" style={{ color: C.gd }}>support@top-scorers.com</a>. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>7. Publicidad</h2>
            <p>
              Los usuarios del plan gratuito pueden ver anuncios servidos por <strong style={{ color: C.tx }}>Google AdSense</strong> (publisher ID: ca-pub-6498215334315959). Google puede utilizar cookies para mostrar anuncios personalizados basados en tus visitas a este y otros sitios web. Puedes consultar la{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.gd }}>política de privacidad de Google</a>{' '}
              y gestionar tus preferencias de publicidad en{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: C.gd }}>adssettings.google.com</a>.
              Los usuarios con plan Pro, Scout o Team no ven publicidad.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: C.tx }}>8. Cookies</h2>
            <p>
              Utilizamos únicamente cookies técnicas necesarias para la sesión de usuario. Google AdSense puede utilizar cookies de publicidad en usuarios del plan gratuito. Vercel Analytics opera sin cookies.
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.bd}` }}>
          <Link href="/" className="text-[12px] font-semibold" style={{ color: C.mu }}>
            ← Volver a la app
          </Link>
        </div>
      </div>
    </main>
  )
}
