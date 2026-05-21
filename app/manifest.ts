import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TopScorers — Estadísticas de Fútbol',
    short_name: 'TopScorers',
    description: 'Top goleadores y asistentes de las principales ligas europeas. Estadísticas en tiempo real.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060d18',
    theme_color: '#060d18',
    orientation: 'portrait',
    categories: ['sports', 'news'],
    lang: 'es',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    screenshots: [
      { src: '/screenshot-mobile.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'TopScorers Mobile' },
      { src: '/screenshot-desktop.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'TopScorers Desktop' },
    ],
  }
}
