import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TopScorers — Estadísticas de Fútbol',
    short_name: 'TopScorers',
    description: 'Estadísticas de fútbol europeo: goleadores, asistentes, clasificaciones y perfiles de jugadores.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0908',
    theme_color: '#f0c040',
    orientation: 'portrait',
    scope: '/',
    lang: 'es',
    categories: ['sports', 'entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      {
        src: '/screenshots/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        // @ts-ignore — form_factor not in Next.js types yet
        form_factor: 'narrow',
        label: 'Goleadores de Europa en el móvil',
      },
      {
        src: '/screenshots/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'wide',
        label: 'Dashboard de estadísticas de fútbol europeo',
      },
    ],
    shortcuts: [
      {
        name: 'Goleadores',
        short_name: 'Goleadores',
        description: 'Top goleadores europeos',
        url: '/?tab=scorers',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
      {
        name: 'Resultados',
        short_name: 'Resultados',
        description: 'Clasificaciones y partidos',
        url: '/resultados',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
      {
        name: 'Competiciones',
        short_name: 'Competiciones',
        description: 'Todas las competiciones',
        url: '/competiciones',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
    ],
  }
}
