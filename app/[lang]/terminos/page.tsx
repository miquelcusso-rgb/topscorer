import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import LegalDoc, { type LegalBlock } from '@/components/LegalDoc'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/terminos'
  return {
    title: lang === 'en' ? 'Terms of Service' : 'Términos de servicio',
    description: lang === 'en' ? 'Terms governing the use of TopScorers, operated by Furiosa Studio.' : 'Términos que regulan el uso de TopScorers, operado por Furiosa Studio.',
    alternates: { canonical: `https://www.top-scorers.com/${lang}${path}`, languages: { es: `https://www.top-scorers.com/es${path}`, en: `https://www.top-scorers.com/en${path}`, 'x-default': `https://www.top-scorers.com/es${path}` } },
  }
}

const ES: LegalBlock[] = [
  { h: '1. El servicio', p: 'TopScorers ofrece estadísticas de fútbol, clasificaciones, comparativas, la métrica propia IIG, rumores de fichajes, titulares de noticias agregadas, encuestas, predicciones (pick’em) y contenido del Mundial 2026. El servicio se presta «tal cual» y «según disponibilidad».' },
  { h: '2. Sin garantía sobre la exactitud de los datos', p: 'Las estadísticas, valoraciones, valores de mercado y noticias se recopilan de fuentes de terceros (ver Aviso). No garantizamos que los datos sean exactos, completos o actuales. El contenido es solo informativo y de entretenimiento y no constituye asesoramiento de apuestas, financiero ni profesional.' },
  { h: '3. Cuentas', p: 'Debes facilitar información veraz y mantener tus credenciales seguras. Eres responsable de la actividad de tu cuenta. Las cuentas se gestionan mediante Clerk.' },
  { h: '4. Uso aceptable', p: 'Te comprometes a no extraer de forma masiva o «scrapear» nuestros datos ni la métrica IIG, no revender ni redistribuir nuestro contenido, no aplicar ingeniería inversa, no interferir en el funcionamiento o la seguridad del servicio ni usarlo de forma ilícita.' },
  { h: '5. Suscripciones, facturación y reembolsos', p: 'Los planes de pago (Pro 2,99 €/mes · 24,99 €/año; Scout próximamente) se facturan vía Stripe y se renuevan automáticamente hasta su cancelación. Puedes cancelar cuando quieras desde tu cuenta y mantienes el acceso hasta el final del periodo pagado. Derecho de desistimiento (UE): en servicios digitales dispones normalmente de 14 días; al empezar a usar las funciones de pago de inmediato, solicitas que el servicio comience durante ese plazo y reconoces que pierdes el derecho una vez prestado por completo. Los precios incluyen los impuestos aplicables cuando proceda.' },
  { h: '6. Propiedad intelectual', p: 'El sitio, su diseño, software, marca y la métrica IIG y su metodología son propiedad de Furiosa Studio. Las estadísticas y hechos subyacentes pertenecen a sus respectivas fuentes/titulares. Recibes una licencia limitada, personal e intransferible para usar el sitio. Las marcas de ligas, clubes y competiciones pertenecen a sus titulares.' },
  { h: '7. Enlaces de terceros y anuncios', p: 'El sitio enlaza a las fuentes originales de noticias y muestra anuncios mediante Google AdSense. No nos responsabilizamos del contenido ni de los sitios de terceros.' },
  { h: '8. Limitación de responsabilidad', p: 'En la máxima medida permitida por la ley, Furiosa Studio no responde de daños indirectos, incidentales o consecuentes, ni de pérdidas derivadas de la confianza en los datos. Nada limita la responsabilidad que no pueda excluirse legalmente, incluidos tus derechos como consumidor.' },
  { h: '9. Suspensión/terminación', p: 'Podemos suspender o cancelar el acceso por incumplimiento de estos Términos o para proteger el servicio.' },
  { h: '10. Ley aplicable', p: 'Estos Términos se rigen por las leyes de España y la normativa aplicable de la UE. No se ven afectados los derechos imperativos de consumo de tu país de residencia. La plataforma de resolución de litigios en línea de la UE está en ec.europa.eu/consumers/odr.' },
  { h: '11. Cambios', p: 'Podemos actualizar estos Términos; seguir usando el servicio tras los cambios implica su aceptación.' },
]

const EN: LegalBlock[] = [
  { h: '1. The service', p: 'TopScorers provides football statistics, leaderboards, comparisons, the proprietary IIG metric, transfer rumors, aggregated news headlines, polls, pick’em predictions and World Cup 2026 content. The service is provided “as is” and “as available”.' },
  { h: '2. No warranty on data accuracy', p: 'Statistics, ratings, market values and news are compiled from third-party sources (see Disclaimer). We do not warrant that any data is accurate, complete or current. Content is for informational and entertainment purposes only and is not betting, financial or professional advice.' },
  { h: '3. Accounts', p: 'You must provide accurate information and keep your credentials secure. You are responsible for activity under your account. Accounts are managed via Clerk.' },
  { h: '4. Acceptable use', p: 'You agree not to scrape or bulk-extract our data or the IIG metric, resell or redistribute our content, reverse engineer the service, interfere with its operation or security, or use it unlawfully.' },
  { h: '5. Subscriptions, billing and refunds', p: 'Paid tiers (Pro €2.99/month · €24.99/year; Scout €5.99/month · €49.99/year) are billed via Stripe and renew automatically until cancelled. You can cancel anytime from your account and keep access until the end of the paid period. EU right of withdrawal: for digital services you normally have 14 days; by starting to use paid features immediately you request the service begin during that period and acknowledge you lose the right once fully performed. Prices include applicable taxes where required.' },
  { h: '6. Intellectual property', p: 'The site, design, software, brand and the IIG metric and its methodology are owned by Furiosa Studio. The underlying statistics and facts belong to their respective sources/owners. You receive a limited, personal, non-transferable licence to use the site. Trademarks of leagues, clubs and competitions belong to their owners.' },
  { h: '7. Third-party links and ads', p: 'The site links out to original news sources and shows ads via Google AdSense. We are not responsible for third-party content or sites.' },
  { h: '8. Limitation of liability', p: 'To the maximum extent permitted by law, Furiosa Studio is not liable for indirect, incidental or consequential damages, or for loss arising from reliance on the data. Nothing limits liability that cannot be excluded by law, including your statutory consumer rights.' },
  { h: '9. Suspension/termination', p: 'We may suspend or terminate access for breach of these Terms or to protect the service.' },
  { h: '10. Governing law', p: 'These Terms are governed by the laws of Spain and applicable EU law. Mandatory consumer-protection rights of your country of residence are unaffected. The EU ODR platform is available at ec.europa.eu/consumers/odr.' },
  { h: '11. Changes', p: 'We may update these Terms; continued use after changes means acceptance.' },
]

export default async function TerminosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return (
    <LegalDoc
      lang={lang}
      breadcrumb={en ? ['Legal', 'Terms'] : ['Legal', 'Términos']}
      title={en ? 'Terms of Service' : 'Términos de servicio'}
      intro={en ? 'These Terms govern your use of TopScorers (top-scorers.com), operated by Furiosa Studio. By using the site you accept these Terms.' : 'Estos Términos regulan el uso de TopScorers (top-scorers.com), operado por Furiosa Studio. Al usar el sitio aceptas estos Términos.'}
      blocks={en ? EN : ES}
    />
  )
}
