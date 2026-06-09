# API-Football — cobertura de datos en TopScorers

Qué nos da la API (v3, `v3.football.api-sports.io`) y qué estamos usando o no.
Marca: ✅ usado · 🟡 parcial · ❌ sin usar · 🚫 evitar (ToS/legal).
Ejecuta el checker para ver qué devuelve en vivo en nuestro plan:
`node scripts/api-coverage-check.mjs`

---

## 1. Endpoints

| Endpoint | Estado | Qué da | Dónde lo usamos / idea para añadir | Valor |
|---|---|---|---|---|
| `/players/topscorers` | ✅ | Goleadores por liga + stats de temporada | Dataset (gen-players) | — |
| `/players/topassists` | ✅ | Asistentes por liga | Dataset | — |
| `/players` (id+season) | ✅ | Ficha+stats de un jugador | resolve-player live, career | — |
| `/players/seasons` | ✅ | Temporadas de un jugador | Histórico | — |
| `/players/squads` | ✅ | Plantilla de un equipo | Ficha de selección | — |
| `/coachs` | ✅ | Entrenador | Ficha de selección | — |
| `/teams` | ✅ | Buscar equipo / id | Resolver selección | — |
| `/standings` | ✅ | Clasificación de liga | Página de liga | — |
| `/fixtures` | ✅ | Partidos (last/next/league/team) | Resultados, amistosos, lineups recientes | — |
| `/fixtures/events` | ✅ | Goles/tarjetas/cambios de un partido | Resumen de partido | — |
| `/fixtures/statistics` | 🟡 | Stats por partido (tiros, **posesión**, córners, faltas…) | Resumen partido. **No usamos posesión en la ficha de selección** | Medio |
| `/fixtures/lineups` | ✅ | Onces + formación | Once probable selección | — |
| `/fixtures/players` | ✅ | Stats por jugador en un partido | Minutos recientes selección | — |
| `/transfers` | ✅ | Fichajes | Página Transferencias | — |
| `/trophies` | ✅ | Palmarés | Honores en ficha | — |
| **`/injuries`** | ✅ | **Lesionados** (jugador/liga/fixture/fecha) | Badge disponible/lesionado en la ficha (`getPlayerInjuries`) | **Alto** |
| **`/sidelined`** | ✅ | **Historial de lesiones y sanciones** de un jugador | Sección "Lesiones y sanciones" en la pestaña Histórico (`getPlayerSidelined`) | **Alto** |
| **`/predictions`** | ✅ | **Probabilidad de victoria + consejo + comparativa** por partido | Barra win/draw/loss en los amistosos próximos del Mundial (`getFixturePrediction`). Se ilumina al haber fixtures futuros | **Alto** |
| **`/fixtures/headtohead`** | ✅ | **Historial H2H** entre dos equipos | `H2HMini` en la tarjeta de partido (`getHeadToHead`). Comparador de jugadores pendiente (faltan team ids) | Medio-Alto |
| **`/teams/statistics`** | ✅ | Stats de temporada de un equipo: forma, **porterías a cero**, mayores victorias, tarjetas por minuto, formaciones usadas, racha | Bloque "Estadísticas de temporada" en la ficha de selección (`getTeamSeasonStats`/`getNationalTeamSeasonStats`). ⚠️ Este endpoint NO trae posesión (solo `/fixtures/statistics` por partido) | **Alto** |
| **`/players/topyellowcards`** | 🟡 | Top amonestados por liga | Fetcher `getTopYellowCards` listo; UI en records pendiente (página estática multi-liga) | Medio |
| **`/players/topredcards`** | ❌ | Top expulsados por liga | Ranking de disciplina | Bajo-Medio |
| `/players/profiles` | ❌ | Búsqueda/ficha base de jugador (bio) | Ya cubrimos bio con Wikipedia | Bajo |
| `/venues` | 🟡 | Estadios (aforo, ciudad, imagen) | Pestaña Venues del Mundial podría enriquecerse | Bajo-Medio |
| `/leagues`, `/seasons`, `/countries` | 🟡 | Catálogos | Tenemos registro propio de ligas | Bajo |
| `/fixtures/rounds` | ❌ | Jornadas de una liga | Selector de jornada en resultados | Bajo |
| `/teams/seasons`, `/teams/countries` | ❌ | Metadatos de equipo | — | Bajo |
| `/odds`, `/odds/live` | 🚫 | Cuotas de apuestas | **Evitar** (apuestas/ToS, no es nuestro foco) | — |
| `/timezone` | ❌ | Zonas horarias | No necesario | — |

---

## 2. Campos por jugador (en `/players` y `/fixtures/players`)

| Campo API | Estado | Idea |
|---|---|---|
| `goals.total` (goles) | ✅ | — |
| `goals.assists` | ✅ | — |
| `goals.conceded` (GK) | 🟡 | Encajados/90 en ficha (solo 2 GK en dataset) |
| `goals.saves` (GK) | 🟡 | Paradas (apenas hay GKs en el feed) |
| `shots.total` / `shots.on` | ✅ | — |
| `passes.total` / `.key` / `.accuracy` | ✅ | — |
| `tackles.total` / `.blocks` / `.interceptions` | ✅ | (blocks sin usar → bloqueos) |
| `duels.total` / `.won` | ✅ | — |
| `dribbles.attempts` / `.success` | ✅ | — |
| **`cards.yellow` / `.red`** | ✅ | Grupo "Disciplina" en la ficha (amarillas/rojas) |
| **`fouls.drawn` / `.committed`** | ✅ | Faltas recibidas/cometidas en el grupo "Regate" |
| **`penalty.won` / `.committed` / `.scored` / `.missed` / `.saved`** | ✅ | Penaltis (marcados/fallados; parados GK) en "Disciplina" |
| **`games.rating`** | ✅ | Nota |
| **`games.captain`** | ✅ | Pill "Capitán" en la ficha |
| `games.minutes` / `.appearences` / `.lineups` | ✅/🟡 | `lineups` (titularidades) poco usado |
| **`player.injured`** | ✅ | Badge disponible/lesionado (vía `/injuries`, más fiable que este flag) |
| **`player.birth` (date/place/country)** | ✅ | Fecha y lugar de nacimiento en la ficha |
| **`player.height` / `.weight`** | ✅ | Altura/peso en la ficha |

---

## 3. Recomendación priorizada (qué añadiría primero)

1. **Lesiones y sanciones** (`/injuries` + `/sidelined`): estado "lesionado/disponible" en la ficha, historial de bajas, y un **"parte de bajas" del Mundial**. Muy demandado y diferencial.
2. **`/teams/statistics`**: convierte la ficha de selección/equipo en algo tipo FootyStats real (posesión, porterías a cero, racha, formaciones, tarjetas por minuto). Cierra el hueco de "posesión" que ahora falta.
3. **`/predictions`**: probabilidad de victoria + consejo por partido → previa de partido y refuerzo de la sección de predicciones/Mundial.
4. **`/fixtures/headtohead`**: H2H en previas y en el comparador (de equipos).
5. **Disciplina**: `cards`, `fouls`, `penalty` en la ficha + rankings `topyellowcards/topredcards`.
6. **Bio extra**: `birth`, `height`, `weight`, `injured`, `captain` en la ficha.

🚫 No tocar: `/odds` (apuestas).

⚠️ Coste: cada endpoint nuevo son llamadas extra. En el plan **free (100/día)** hay que cachear agresivo (ya usamos `unstable_cache`); con **Starter (~7.5k/día)** no hay problema.

---

## 4. Checker en vivo
`node scripts/api-coverage-check.mjs` sondea los endpoints SIN USAR (injuries, sidelined, predictions, headtohead, teams/statistics, topyellowcards…) con ids reales y reporta si devuelven datos en nuestro plan + una muestra de campos, para decidir con datos en la mano.
