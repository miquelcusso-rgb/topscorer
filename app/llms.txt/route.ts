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

## Golden Boot — evergreen (EN)

- [Golden Boot hub](https://www.top-scorers.com/en/golden-boot): all Golden Boot / top scorer award pages by competition.
- [MLS Golden Boot](https://www.top-scorers.com/en/golden-boot/mls): MLS Golden Boot winners year by year and records.
- [Champions League top scorers](https://www.top-scorers.com/en/golden-boot/champions-league): UCL top scorer by season and all-time records.
- [AFCON top scorers](https://www.top-scorers.com/en/golden-boot/afcon): Africa Cup of Nations top scorers by edition.
- [Liga MX scoring champions](https://www.top-scorers.com/en/golden-boot/liga-mx): campeón de goleo Apertura/Clausura and records.
- [Saudi Pro League top scorers](https://www.top-scorers.com/en/golden-boot/saudi-pro-league): top scorers by season and league records.
- [Primeira Liga Bola de Prata](https://www.top-scorers.com/en/golden-boot/primeira-liga): Portuguese top scorer award, winners and records.
- [Brasileirão artilheiros](https://www.top-scorers.com/en/golden-boot/brasileirao): Brazilian league top scorers by season.
- [European Golden Boot](https://www.top-scorers.com/en/bota-de-oro): European Golden Shoe standings with league-weighted points.

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
