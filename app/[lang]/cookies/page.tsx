import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import LegalDoc, { type LegalBlock } from '@/components/LegalDoc'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/cookies'
  return {
    title: lang === 'en' ? 'Cookie Policy — TopScorers' : 'Política de cookies — TopScorers',
    description: lang === 'en' ? 'How TopScorers uses essential, analytics and advertising cookies.' : 'Cómo usa TopScorers las cookies esenciales, de analítica y de publicidad.',
    alternates: { canonical: `https://www.top-scorers.com/${lang}${path}`, languages: { es: `https://www.top-scorers.com/es${path}`, en: `https://www.top-scorers.com/en${path}`, 'x-default': `https://www.top-scorers.com/es${path}` } },
  }
}

const ES: LegalBlock[] = [
  { h: 'Categorías', p: 'Esenciales — inicio de sesión, seguridad, sesión y preferencias (sesión de Clerk, idioma, estado de consentimiento). No requieren consentimiento. Analítica — medir el tráfico y mejorar el producto (Google Analytics 4). Requiere consentimiento. Publicidad — mostrar y medir anuncios (Google AdSense). Requiere consentimiento.' },
  { h: 'Gestionar tus opciones', p: 'Usa el banner de cookies para aceptar o rechazar las de analítica y publicidad. Cambia tu elección cuando quieras desde el enlace «Configuración de cookies» del pie de página. También puedes bloquear o borrar cookies en tu navegador (puede afectar a algunas funciones). Desactivar GA4: complemento de inhabilitación de Google Analytics. Personalización de anuncios de Google: adssettings.google.com.' },
  { h: 'Cambios', p: 'Actualizamos esta política cuando cambian nuestras cookies. Consulta también nuestra Política de privacidad.' },
]
const EN: LegalBlock[] = [
  { h: 'Categories', p: 'Essential — sign-in, security, session and preferences (Clerk session, language, consent state). No consent needed. Analytics — measure traffic and improve the product (Google Analytics 4). Consent required. Advertising — show and measure ads (Google AdSense). Consent required.' },
  { h: 'Managing your choices', p: 'Use the cookie banner to accept or reject analytics and advertising cookies. Change your choice anytime via the “Cookie settings” link in the footer. You can also block or delete cookies in your browser (this may break some features). Opt out of GA4: Google Analytics opt-out add-on. Manage Google ad personalisation: adssettings.google.com.' },
  { h: 'Changes', p: 'We update this policy when our cookies change. See also our Privacy Policy.' },
]

export default async function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return (
    <LegalDoc
      lang={lang}
      breadcrumb={en ? ['Legal', 'Cookies'] : ['Legal', 'Cookies']}
      title={en ? 'Cookie Policy' : 'Política de cookies'}
      intro={en ? 'TopScorers, operated by Furiosa Studio, uses cookies and similar technologies. Non-essential cookies load only after you consent in our cookie banner.' : 'TopScorers, operado por Furiosa Studio, utiliza cookies y tecnologías similares. Las cookies no esenciales se cargan solo tras tu consentimiento en el banner.'}
      blocks={en ? EN : ES}
    />
  )
}
