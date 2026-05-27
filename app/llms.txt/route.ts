export const dynamic = 'force-static'

const BODY = `# TopScorers

> TopScorers (top-scorers.com) es una web de estadísticas de fútbol europeo: máximos goleadores, asistentes y datos de las grandes ligas en tiempo real. Bilingüe (español / inglés). Publicada por Furiosa Studio.

## Páginas clave

- [Inicio](https://www.top-scorers.com/es): máximos goleadores del momento en las principales ligas europeas.
- [Goleadores LaLiga](https://www.top-scorers.com/es/goleadores-liga-espanola): pichichi y máximos goleadores de la liga española.
- [Goleadores Premier League](https://www.top-scorers.com/es/goleadores-premier-league): máximos goleadores de la Premier League inglesa.
- [Goleadores Serie A](https://www.top-scorers.com/es/goleadores-serie-a): capocannoniere y máximos goleadores de la Serie A italiana.
- [Goleadores Bundesliga](https://www.top-scorers.com/es/goleadores-bundesliga): máximos goleadores de la Bundesliga alemana.
- [Goleadores Ligue 1](https://www.top-scorers.com/es/goleadores-ligue-1): máximos goleadores de la Ligue 1 francesa.
- [Máximos goleadores de Europa](https://www.top-scorers.com/es/maximos-goleadores-europa): ranking combinado de las cinco grandes ligas.
- [Bota de Oro](https://www.top-scorers.com/es/bota-de-oro): clasificación de la Bota de Oro europea con puntuación ponderada por liga.
- [Centrocampistas](https://www.top-scorers.com/es/centrocampistas): mejores centrocampistas por goles y asistencias.
- [Competiciones](https://www.top-scorers.com/es/competiciones): estadísticas por competición.
- [Jugadores](https://www.top-scorers.com/es/jugadores): fichas y estadísticas de jugadores.
- [Resultados](https://www.top-scorers.com/es/resultados): resultados en directo.
- [Mundial 2026](https://www.top-scorers.com/es/mundial-2026): seguimiento del Mundial 2026.

## Notas

- Datos de fútbol actualizados desde API-Football; pueden variar en tiempo real.
- Idiomas: español (/es) e inglés (/en), con hreflang.
- Publicada por Furiosa Studio.
`

export async function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
