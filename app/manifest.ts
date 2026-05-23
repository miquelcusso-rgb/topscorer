import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TopScorers — Estadísticas de Fútbol',
    short_name: 'TopScorers',
    description: 'Estadísticas de fútbol europeo: goleadores, asistentes, clasificaciones y perfiles de jugadores.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060d18',
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
    // screenshots: deshabilitados hasta capturar los PNGs reales y ponerlos en
    // public/screenshots/ (móvil 390x844 + desktop 1280x720). Declararlos sin los
    // archivos provocaba 404. Para reactivar: añadir los PNGs y restaurar este bloque
    // con { src, sizes, type:'image/png', form_factor:'narrow'|'wide', label }.
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
