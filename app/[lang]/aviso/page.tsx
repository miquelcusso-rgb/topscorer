import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import LegalDoc, { type LegalBlock } from '@/components/LegalDoc'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/aviso'
  return {
    title: lang === 'en' ? 'Disclaimer & Data Sources — TopScorers' : 'Aviso y fuentes de datos — TopScorers',
    description: lang === 'en' ? 'Informational use, no affiliation with FIFA/UEFA/leagues, and the data sources behind TopScorers.' : 'Uso informativo, sin afiliación con FIFA/UEFA/ligas, y las fuentes de datos de TopScorers.',
    alternates: { canonical: `https://www.top-scorers.com/${lang}${path}`, languages: { es: `https://www.top-scorers.com/es${path}`, en: `https://www.top-scorers.com/en${path}`, 'x-default': `https://www.top-scorers.com/es${path}` } },
  }
}

const ES: LegalBlock[] = [
  { h: 'Solo uso informativo', p: 'Todo el contenido de TopScorers tiene fines únicamente informativos y de entretenimiento. Las estadísticas, valoraciones, la métrica IIG, los rumores y las predicciones no son asesoramiento de apuestas, juego, financiero ni de inversión. Apuesta con responsabilidad y conforme a la ley de tu país; no nos responsabilizamos de las decisiones tomadas a partir de nuestro contenido.' },
  { h: 'Sin afiliación', p: 'TopScorers y Furiosa Studio son independientes y no están afiliados, respaldados ni patrocinados por la FIFA, la UEFA, ninguna federación, liga, competición o club. Todos los nombres de equipos, ligas, competiciones, logotipos y marcas son propiedad de sus respectivos titulares y se usan solo con fines de identificación y descriptivos.' },
  { h: 'Datos y fuentes', p: 'API-Football (api-sports.io): partidos, alineaciones y estadísticas. Understat: goles esperados (xG) y métricas avanzadas. Transfermarkt: valores de mercado. Wikipedia / Wikidata: información biográfica. Feeds RSS de noticias públicos (The Guardian, BBC, ESPN, Sky Sports, Marca y otros): mostramos solo el titular, el nombre de la fuente y un enlace al artículo original. No rehospedamos ni reproducimos el cuerpo de los artículos; el contenido completo permanece en el sitio del editor.' },
  { h: 'Sobre la métrica IIG', p: 'La métrica IIG es un cálculo propio de Furiosa Studio derivado de los datos anteriores; es nuestra interpretación y no una valoración oficial. Buscamos la máxima exactitud, pero no podemos garantizar que los datos de terceros sean correctos o estén actualizados. Si eres titular de derechos y tienes una duda, escribe a hello@top-scorers.com.' },
]
const EN: LegalBlock[] = [
  { h: 'Informational use only', p: 'All content on TopScorers is for informational and entertainment purposes only. Statistics, ratings, the IIG metric, rumors and predictions are not betting, gambling, financial or investment advice. Always gamble responsibly and within the law of your country; we are not responsible for decisions made based on our content.' },
  { h: 'No affiliation', p: 'TopScorers and Furiosa Studio are independent and are not affiliated with, endorsed by or sponsored by FIFA, UEFA, any federation, league, competition or club. All team, league and competition names, logos and trademarks are the property of their respective owners and are used for identification and descriptive purposes only.' },
  { h: 'Data & sources', p: 'API-Football (api-sports.io): fixtures, line-ups and statistics. Understat: expected goals (xG) and advanced metrics. Transfermarkt: market values. Wikipedia / Wikidata: biographical information. Public RSS news feeds (The Guardian, BBC, ESPN, Sky Sports, Marca and others): we display only the headline, the source name and a link back to the original article. We do not rehost or reproduce article bodies; full content stays on the publisher’s site.' },
  { h: 'About the IIG metric', p: 'The IIG metric is a proprietary calculation by Furiosa Studio derived from the above data; it is our interpretation and not an official rating. We strive for accuracy but cannot guarantee third-party data is correct or current. If you are a rights holder with a concern, contact hello@top-scorers.com.' },
]

export default async function AvisoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return (
    <LegalDoc
      lang={lang}
      breadcrumb={en ? ['Legal', 'Disclaimer'] : ['Legal', 'Aviso']}
      title={en ? 'Disclaimer & Data Sources' : 'Aviso y fuentes de datos'}
      blocks={en ? EN : ES}
    />
  )
}
