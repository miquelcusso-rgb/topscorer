import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TopScorer',
    short_name: 'TopScorer',
    description: 'Top goleadores y asistentes de las principales ligas europeas',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070f',
    theme_color: '#f0c040',
    orientation: 'portrait-primary',
    categories: ['sports'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Goleadores', url: '/?tab=s', description: 'Top goleadores europeos' },
      { name: 'Asistentes', url: '/?tab=a', description: 'Top asistentes europeos' },
      { name: 'Pricing',    url: '/pricing',  description: 'Planes y precios' },
    ],
  }
}
