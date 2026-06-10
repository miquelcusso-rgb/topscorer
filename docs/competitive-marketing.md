# TopScorers — Posicionamiento competitivo y plan de marketing/SEO

> **Documento interno de estrategia. NO enlazar desde el footer público.**
> Operado por **Furiosa Studio**. `top-scorers.com` — estadísticas de fútbol bilingües (ES/EN).
> Contenido **informativo**: nada de consejos de apuestas ni recomendaciones financieras.
> Última revisión: 2026-06.

Este doc complementa `docs/positioning-marketing.md` (comparativa contra FotMob/WhoScored) y se centra en los tres rivales que el negocio quiere batir de frente: **Transfermarkt, SofaScore y FootyStats**, con referencias a **FBref** y **WhoScored** donde aplica.

Resumen en una frase: **no scrapeamos** (respetamos ToS, usamos API-Football con licencia) y somos pequeños; por eso no peleamos en feeds en-vivo, valor de mercado ni datos B2B de agentes. Ganamos en una **cuña estrecha y defendible**: un dataset global curado de 30+ ligas, todas las posiciones, con **radar de percentiles**, una **métrica de impacto propia y transparente (IIG)**, **comparador limpio**, **hub del Mundial 2026** y bilingüe ES/EN — todo indexable y citable por IA (GEO).

---

## Parte 1 — Posicionamiento competitivo

### 1.1 Análisis rival por rival

#### Transfermarkt
- **Más fuerte en:** valor de mercado (su moat de 20 años, datos crowdsourced+editoriales que nadie más tiene), fichajes/rumores, base de datos histórica masiva, comunidad de foros y "voto de valor", y un negocio **B2B** real (agentes, clubes). SEO brutal por volumen de páginas de jugador/club.
- **Debilidades:** UX cargada y anticuada, mucha densidad y publicidad, las estadísticas de rendimiento (no de valor) son secundarias y poco visuales; sin métrica de impacto propia ni radares; multilingüe parcial (calidad desigual fuera de DE/EN). No es la herramienta para "comparar el rendimiento de dos jugadores de un vistazo".
- **Dónde podemos ganar:** la pregunta de **rendimiento/goleo** ("quién va líder", "cómo rinde X vs Y") con una ficha limpia, radar de percentiles y el IIG. No competimos por valor de mercado — lo **mostramos** (`MarketValueChart`) sin pretender batir su dato.

#### SofaScore
- **Más fuerte en:** **en-vivo** (marcadores, momentum, lineups, eventos minuto a minuto — su moat con feed licenciado), su **rating** por partido, heatmaps, shot maps (xG), app móvil pulida, "Attribute overview" y SofaScore Weekly Challenge (loop de comunidad).
- **Debilidades:** el **rating es caja negra** (no explican la fórmula); los "atributos" se presentan sin metodología transparente; SEO web más débil que su app (mucho contenido vive tras JS pesado que las IA leen mal); foco en-vivo deja "evergreen de goleo + comparación" relativamente desatendido en buscador.
- **Dónde podemos ganar:** **transparencia**. Nuestro IIG publica la fórmula (`lib/iig.ts`: `goles × coef_liga + (nota − 6) × 3 + asist × 0,5`) y el radar es **percentil explícito**. Y donde SofaScore es app-first, nosotros somos **web-first e indexable** → ganamos la búsqueda de cola larga y la cita por IA.

#### FootyStats
- **Más fuerte en:** **stats de equipo en %** (BTTS, over/under, córners, clean sheets, tendencias) orientadas a quien analiza partidos; cobertura de ligas muy amplia; **API de pago** y datos descargables; fuerte en el ángulo info-apuestas.
- **Debilidades:** UX utilitaria y densa; débil en fichas de jugador, radares y comparador; centrado en equipos/mercados más que en el jugador; multilingüe pobre (sólo EN realmente).
- **Dónde podemos ganar:** el **jugador** (no el partido). FootyStats es "el sitio del % de equipo"; nosotros somos "el sitio del goleador/impacto". Tenemos `getTeamSeasonStats` (clean sheets, forma, formaciones, tarjetas/min) para cubrir lo justo de su terreno **sin** entrar en cuotas (`/odds` está vetado por ToS y foco — informativo, no apuestas).

#### FBref (referencia)
- **Más fuerte en:** profundidad analítica (xG, progresión, datos por 90, percentiles vs posición — Stathead/Opta), gratis, muy citado por analistas.
- **Debilidad relevante para nosotros:** sólo EN, UX árida de tablas, cero apetito mainstream/casual y nada de Mundial-hub editorial. Es de nicho hardcore. Coexistimos: ellos para el analista; nosotros para el aficionado data-curioso bilingüe.

#### WhoScored (referencia)
- **Más fuerte en:** rating por partido (Opta) y stats detalladas de jugador/equipo.
- **Debilidad:** rating también opaco, sólo EN, UX pesada, sin hub de Mundial ni comparador limpio compartible. Mismo ángulo de transparencia/bilingüe/UX a nuestro favor.

### 1.2 Matriz de funcionalidades

Leyenda: ✅ fuerte/nativo · 🟡 básico, parcial o "en marcha" · ❌ no tiene · 💰 de pago

| Funcionalidad | Transfermarkt | SofaScore | FootyStats | TopScorers |
|---|---|---|---|---|
| Profundidad de stats de jugador | 🟡 | ✅ | 🟡 | ✅ (todas las posiciones, per-90, disciplina, penaltis, bio) |
| Radar de atributos / percentil | ❌ | 🟡 (atributos opacos) | ❌ | ✅ (`PlayerRadar` percentil + `AttributeOverview`) |
| Valor de mercado | ✅ (su moat) | ❌ | ❌ | 🟡 (se muestra, no competimos) |
| En vivo / marcadores | ❌ | ✅ (su moat) | 🟡 | ❌ (fuera de alcance sin feed licenciado dedicado) |
| Comparador de jugadores | 🟡 | ✅ | ❌ | ✅ (radar solapado + barras % + `VersusCard`) |
| Hub selección / Mundial 2026 | 🟡 | 🟡 | 🟡 | ✅ (`/mundial-2026`: 48 berths, golden boot, fichas, FAQ) |
| Rating / métrica de impacto | ❌ | ✅ (caja negra) | ❌ | ✅ **IIG transparente y explicado** |
| Lesiones / sanciones | ✅ | 🟡 | 🟡 | 🟡 (`AvailabilityBadge` + `InjuryHistory` vía `/injuries`,`/sidelined`) |
| Predicciones / probabilidades | 🟡 | ✅ | ✅ | 🟡 (win/draw/loss en amistosos vía `/predictions`) |
| Noticias / frescura | 🟡 | 🟡 | ❌ | 🟡 (RSS multi-fuente + breaking banner) |
| Bilingüe ES/EN nativo | 🟡 | ✅ | ❌ | ✅ (hreflang es/en/x-default) |
| Gratis vs muro de pago | mayormente gratis | freemium | 💰 fuerte | ✅ casi todo gratis; Pro €2.99/mo · Scout (próximamente) |
| API / widgets | 🟡💰 | ❌ | ✅💰 | 🟡 (`/embed` + API planificada en Scout) |

> Honestidad: las columnas ✅ de los rivales en en-vivo, valor de mercado y % masivos de equipo son **moats con licencia/datos propietarios**. No vamos a por ellos. Nuestra ventaja es la combinación curada + transparente + bilingüe + GEO, no superar a nadie en su propio feed.

### 1.3 La cuña ganadora (resumen)

1. **"El sitio del goleo/impacto, transparente y bilingüe."** IIG con fórmula pública + radar de percentiles, frente al rating caja-negra de SofaScore/WhoScored.
2. **Hub del Mundial 2026** ya construido (grupos, bota de oro, 48 fichas de selección, once probable, FAQ, amistosos con probabilidad) → ola de tráfico **una vez cada 4 años**.
3. **Dataset global curado de 30+ ligas, todas las posiciones**, indexable y **citable por IA** (GEO): `llms.txt`, JSON-LD rico, FAQ extraíble — donde los rivales app-first/JS-pesados pierden.
4. **Comparador limpio y compartible** (`VersusCard`) → motor de viralidad social.

---

## Parte 2 — Marketing / crecimiento / SEO

### 2.1 Audiencias objetivo

| Audiencia | Qué busca | Gancho TopScorers |
|---|---|---|
| **Fantasy managers** | quién marca, forma, comparar fichajes | IIG, comparador, per-90, lesiones (¿juega el finde?) |
| **Ojeadores/recruiters hobbyistas** | talento por liga/posición fuera del top-5 | scouter Top-20 cross-liga, radar percentil, 30+ ligas |
| **Info-apuestas (SOLO informativo)** | datos de forma y rendimiento para formar opinión | stats de equipo, predicciones win/draw/loss. **Sin cuotas ni consejos** |
| **Aficionados casuales del Mundial 2026** | grupos, selecciones, estrellas, once | hub `/mundial-2026` bilingüe, fichas, datos curiosos |
| **Nerds tipo Football Manager** | atributos, percentiles, profundidad | radar percentil, IIG transparente, disciplina/penaltis |

### 2.2 Ángulos de viralidad (mecánica concreta de compartir)

- **Tarjetas de comparación VS** (`VersusCard`): botón "Compartir comparación" → genera imagen/URL con dos jugadores, radar solapado y barras. Mecánica: deep-link `/es/estadisticas/comparador?a=…&b=…` + OG image dinámica por par → se previsualiza en X/WhatsApp con la carta ya renderizada.
- **Listas "Scouter Top-20"** por liga/posición (IIG + `rankScore` que también ordena no-goleadores). Mecánica: una imagen-lista por liga, recurrente cada jornada, con CTA "¿de acuerdo con el top?".
- **Páginas de plantilla / once del Mundial 2026:** "Once probable de [selección]" + dato curioso. Mecánica: OG por selección, muy compartible en previa; encadenar 48 piezas a lo largo de jun–jul.
- **Leaderboards de IIG:** "líder de impacto de la semana" — ranking polémico = debate = clics. Carta autogenerada diaria para X.
- **País vs país:** comparativa de selecciones (golden boot agregado, edad media, valor mostrado) → format "¿quién tiene mejor delantera, [A] o [B]?".

Norma de marca en toda pieza: crédito "por Furiosa Studio", nunca nombre personal; tono concreto, sin "excited to announce", sin pedir upvotes.

### 2.3 SEO / GEO

**Clusters long-tail que TopScorers puede poseer (cola larga, baja competencia, intención clara):**
- **Jugador + "stats" / "estadísticas":** `[nombre] stats 2025-26`, `[nombre] estadísticas` (1 ficha por jugador; ya generamos cientos).
- **"X vs Y comparison":** `[jugadorA] vs [jugadorB] comparison` / `comparativa` → servida por el comparador, OG dinámico.
- **Selección + Mundial:** `[país] world cup 2026 squad`, `convocatoria [país] mundial 2026`, `[país] grupo mundial 2026`.
- **Rankings por posición y liga:** `mejores centrocampistas [liga]`, `top scorers [liga] [temporada]`, `pichichi`, `capocannoniere`, `bota de oro`.
- **Definicional/citable:** `qué es el IIG`, `cómo se calcula la bota de oro` (gana cita por IA + featured snippet).

**GEO / citabilidad por IA (verificado en repo):**
- `app/llms.txt/route.ts` — sirve `llms.txt` con descripción + páginas clave + nota "Publicada por Furiosa Studio". ✅
- **JSON-LD** presente en muchas rutas (`layout.tsx`, home, `bota-de-oro`, `mundial-2026`, páginas de goleadores por liga, `wiki`, `descubrir`). ✅
- **FAQ** del Mundial en `app/[lang]/mundial-2026/wc-faqs.ts` → `FAQPage` extraíble. ✅
- Robots permite bots IA (regla GEO del sistema). Mantener `seo-status.json` al día tras cada cambio.
- **Acción GEO pendiente:** añadir `llms.txt` un bloque del comparador y del scouter, y ampliar FAQ definicional (IIG, bota de oro) en más páginas para maximizar la extracción.

**El Mundial 2026 como ola de tráfico única cada 4 años:** pre-construir AHORA (jun) todo el contenido de selección/grupo/golden-boot e ir solicitando indexación en GSC (cuota ~10-15 URLs/día) **antes** del pico jun–jul. El que llega indexado al arranque del torneo captura la ola; el que publica en julio llega tarde.

### 2.4 Ideas de canal

- **X @Furiosadata** (cuenta umbrella, vía pipeline `content-distributor`, EN-only en esa cuenta): 3–5 posts/sem, slots mar–jue 17–19h CEST. Cartas VS, scouter top-20, hitos del Mundial, leaderboard IIG. Threads ≤4 sin pedir OK.
- **Reddit** (r/soccer + subs de clubes/selecciones): **value-first**, compartir un visual/dato útil citando la fuente, jamás spam de links. Mejor en hilos de "match thread"/"data".
- **Google Discover / News:** frescura + OG bien hechas pueden entrar (alto volumen casual), especialmente durante el Mundial.
- **SEO programático:** generar una página por combinación que la gente busca (liga × posición × métrica; selección × Mundial; par de jugadores popular). Cada una indexable y enlazada internamente.

### 2.5 Checklist de crecimiento — próximas 6 semanas (impacto × esfuerzo)

| # | Acción | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|
| 1 | OG image dinámica para el comparador (`VersusCard`) + botón "compartir" con deep-link | Alto | Medio | 🔴 ya |
| 2 | Pre-construir + solicitar indexación de las fichas de selección del Mundial (lote diario en GSC) | Alto | Bajo | 🔴 ya |
| 3 | Página "Scouter Top-20" por liga (usa `rankScore`/IIG) + carta semanal para X | Alto | Medio | 🔴 ya |
| 4 | Ampliar `llms.txt` (comparador, scouter, Mundial) + FAQ definicional IIG/bota de oro | Medio-Alto | Bajo | 🟠 |
| 5 | Cadencia X @Furiosadata: 3 piezas/sem (VS, scouter, hito Mundial) vía content-distributor | Medio-Alto | Bajo | 🟠 |
| 6 | Cerrar lesiones/disponibilidad en fichas clave (gancho fantasy: "¿juega?") | Medio | Medio | 🟠 |
| 7 | Newsletter semanal "goleador/impacto de la semana" (Resend ya disponible) | Medio | Bajo-Medio | 🟢 |
| 8 | 3–5 aportaciones value-first en Reddit (datos/visuales, sin spam) | Medio | Bajo | 🟢 |
| 9 | Páginas programáticas liga × posición ("mejores centrocampistas [liga]") | Medio | Medio | 🟢 |

Regla de oro de las 6 semanas: **todo lo que sea Mundial va primero** (la ventana se cierra). El resto (newsletter, programático regular) puede esperar al post-Mundial sin coste de oportunidad.

---

## EN — Executive summary

**The wedge.** TopScorers does **not** scrape (we honour ToS; data via licensed API-Football) and we're small, so we don't fight live scores (SofaScore), market value/agents (Transfermarkt) or mass team-% / odds (FootyStats) — those are licensed/proprietary moats. We win a narrow, defensible lane: a **curated global dataset across 30+ leagues, all positions**, with a **transparent percentile radar**, a **proprietary-but-explained impact metric (IIG)**, a **clean shareable comparator**, a **World-Cup-2026 hub**, native **ES/EN**, and a **GEO/AI-citable** footprint (`llms.txt`, JSON-LD, FAQ) where app-first/JS-heavy rivals are weak.

**Key honest caveats.** Live, market value and team-% columns where rivals show ✅ are moats we deliberately don't chase — we surface market value, we don't compete on it. Betting angle is **informational only**: no odds (`/odds` vetoed), no tips.

**Top-3 growth moves (next 6 weeks):**
1. Ship a **dynamic OG image + share button for the comparator** (`VersusCard`) — turns comparisons into viral cards.
2. **Pre-build and request indexing of World-Cup-2026 squad/group pages NOW** — the once-per-4-years traffic wave (Jun–Jul) goes to whoever is already indexed at kickoff.
3. Launch **"Scouter Top-20" pages per league** (built on IIG/`rankScore`) + a weekly card to **X @Furiosadata** via the content-distributor pipeline.

_Internal strategy doc. Not linked from the public footer. Operated by **Furiosa Studio**._

---

## Recuperar terreno donde perdemos

> Análisis con los pies en el suelo de los campos donde HOY perdemos (matriz 1.2). Para cada uno: (a) por qué perdemos, (b) qué habilita **realmente** nuestro plan licenciado de API-Football (ver `docs/api-coverage.md`), (c) un build concreto y respetuoso con ToS que podríamos enviar, (d) esfuerzo/impacto + **veredicto** (Perseguir / Parcial / Descartar). Toda afirmación de capacidad traza al repo o va marcada como _planificada_. **Informativo, nunca apuestas ni consejo financiero.** Por Furiosa Studio.

### 1. Marcadores en vivo (vs SofaScore) — Veredicto: **Parcial**

- **(a) Por qué perdemos hoy.** SofaScore tiene un feed en tiempo real licenciado con push minuto a minuto, momentum, lineups vivos y eventos al instante; su moat es la latencia y la app móvil. Nosotros no tenemos ❌ en la matriz porque no servimos una superficie en-vivo dedicada.
- **(b) Qué habilita nuestro plan.** `/fixtures` (last/next/live/by-league/by-team) ✅, `/fixtures/events` (goles, tarjetas, cambios) ✅, `/fixtures/lineups` ✅, `/fixtures/statistics` 🟡 (tiros, posesión, córners), `/fixtures/players` ✅. Es suficiente para una **superficie de jornada con refresco por polling**, NO para push real-time sub-segundo.
- **(c) Build concreto y ToS-safe.** Una página `/es/en-directo` (planificada): partidos del día por liga del dataset, marcador + minuto + goleadores vía `/fixtures` + `/fixtures/events`, con **refresco por polling cada 30–60 s** (cacheado con `unstable_cache`, respetando rate-limit). Encadenar al resumen de partido que ya tenemos (`/fixtures/events`). Posicionar como **"resultados de jornada + contexto de datos"**, no como "live tracker". Enlazar cada partido a las fichas de jugador (nuestro moat).
- **(d) Esfuerzo/impacto + techo realista.** Esfuerzo medio (UI nueva + presupuesto de llamadas; en plan free 100/día es inviable, requiere Starter ~7.5k/día). Impacto medio. **Techo:** nunca igualaremos la sensación real-time de SofaScore — su latencia es producto, no dato. **Veredicto: Parcial** — construir un "matchday surface" decente que retenga al usuario y alimente SEO de `[partido] resultado`, sin pretender ser un live-tracker. No es la batalla principal.

### 2. Valor de mercado (vs Transfermarkt) — Veredicto: **Perseguir (como diferenciador, no como competición directa)**

- **(a) Por qué perdemos hoy.** El valor de mercado es el moat de 20 años de Transfermarkt (crowdsourcing + editorial). Nosotros solo lo **mostramos** (`components/player/MarketValueChart.tsx`, `ValuationCard.tsx`) — 🟡 en la matriz. Pelear por el dato de valor es imposible y absurdo.
- **(b) Qué habilita nuestro plan.** Aquí está el giro: Transfermarkt tiene el **valor** pero su rendimiento es secundario y sin métrica de impacto. Nosotros tenemos lo contrario — un dataset de rendimiento global, todas las posiciones, con **IIG** (`lib/iig.ts`: `goles × leagueCoef + (rating − 6) × 3 + asist × 0.5`) y radar de percentiles. Cruzar **valor (mostrado) × rendimiento (IIG/percentil)** es un ángulo que Transfermarkt NO ofrece.
- **(c) Build concreto y ToS-safe.** Un **"Índice de chollos / Bargain Index"** (planificado, extiende el `HiddenGemSeal` que YA existe — variante `gem` = "JOYA OCULTA"): ratio IIG-por-millón-de-valor, o percentil de rendimiento vs percentil de valor. Páginas tipo "delanteros que rinden por encima de su valor en [liga]". **Marco estrictamente informativo/analítico** (rendimiento-vs-valor mostrado), NUNCA "compra/vende" ni consejo financiero. El valor sigue siendo dato mostrado de Transfermarkt-style; la inteligencia es nuestra.
- **(d) Esfuerzo/impacto.** Esfuerzo bajo-medio (la lógica de seal e IIG ya existe; falta la página-índice y el cruce con valor). Impacto **alto**: convierte una debilidad (no tenemos el valor) en un ángulo único, muy compartible ("¿quién es el chollo de [liga]?") y citable por IA. **Veredicto: Perseguir** — es de los pocos sitios donde una debilidad se voltea en diferenciador real.

### 3. % masivo de equipo, popularidad y comunidad (vs FootyStats / votos de SofaScore) — Veredicto: **Perseguir**

- **(a) Por qué perdemos hoy.** FootyStats domina los % de equipo (BTTS, over/under, córners) y SofaScore tiene el loop de votos/atributos de comunidad a escala. Nosotros no tenemos el volumen de tráfico para "sabiduría de masas" pura por número.
- **(b) Qué habilita nuestro plan + el repo.** Tenemos ya una **infraestructura de comunidad real, no planificada**: `components/CommentsThread.tsx` (comentarios sobre `targetType: 'rumor' | 'poll'` → **encuestas existen**), `lib/user-stats.ts` (`votes_count`), `lib/badges.ts` (sistema de 5 niveles: `votes × 1 + comments × 2 + picks_correct × 3 + days/10` → hay **picks/predicciones de usuario puntuadas por acierto**), `WatchlistButton`/`WatchlistPanel`. Más el lado dato: IIG transparente + `/teams/statistics` ✅ (porterías a cero, racha, formaciones) y `/predictions` ✅ (win/draw/loss algorítmico).
- **(c) Build concreto y ToS-safe.** El ángulo **"sabiduría de masas vs algoritmo"** (planificado, ensamblando piezas que ya existen): en cada partido/predicción mostrar lado a lado **(i)** el pronóstico algorítmico de `/predictions` y **(ii)** el voto agregado de nuestra comunidad (poll + picks). "El algoritmo dice X, la gente dice Y — ¿quién acierta más?". Cerrar el loop con el badge de `picks_correct` (ya puntúa aciertos): leaderboard de "mejores pronosticadores", debate, retorno. Es comunidad **con piel en el juego informativa**, sin cuotas ni dinero.
- **(d) Esfuerzo/impacto.** Esfuerzo bajo-medio (los ladrillos — polls, votos, picks, badges, predictions — ya están en repo; falta el ensamblaje "algoritmo vs gente" y el leaderboard). Impacto **alto** en retención y viralidad (debate recurrente cada jornada). **Veredicto: Perseguir** — no copiamos el % masivo de FootyStats; creamos una capa de comunidad+algoritmo transparente que ninguno de los dos ofrece junta. Es defendible porque combina activos que ya tenemos.

### 4. Cuotas / apuestas — Veredicto: **Descartar (cuotas) / Parcial (adyacente informativo)**

- **(a) Por qué "perdemos".** No competimos ni queremos: `/odds` y `/odds/live` están **vetados** (🚫 en `api-coverage.md`) por ToS, riesgo legal/gambling y porque no es nuestro foco. No es una pérdida que recuperar — es una línea que no cruzamos.
- **(b) Qué SÍ habilita nuestro plan sin ser sitio de apuestas.** `/predictions` ✅ da **probabilidad de victoria/empate/derrota + comparativa** (ya lo usamos en la barra win/draw/loss de amistosos del Mundial, `getFixturePrediction`). Es **información**, no cuota: no hay stake, ni casa, ni retorno monetario.
- **(c) Build concreto y ToS-safe.** Reforzar el **adyacente informativo**: previas de partido con `/predictions` (probabilidad + forma de `/teams/statistics` + H2H de `/fixtures/headtohead`), siempre con disclaimer "datos informativos, no consejo de apuestas" (la cabecera del doc y la audiencia 2.1 ya lo fijan). Combinar con la capa comunidad del punto 3 ("algoritmo vs gente").
- **(d) Veredicto.** **Cuotas = Descartar (definitivo, no negociable).** **Predicciones informativas = Parcial**, ya en marcha, refuerza el Mundial y la audiencia "info-apuestas (solo informativo)" sin convertirnos en sitio de gambling. Cero ambición de batir a una casa de apuestas o a FootyStats en su ángulo info-apuestas de pago.

### 5. Otros campos marcados como pérdida en la matriz (1.2)

- **Lesiones / sanciones** (rival fuerte: Transfermarkt ✅; nosotros 🟡). **Veredicto: Perseguir-cerrar.** Ya tenemos `AvailabilityBadge` + `InjuryHistory` vía `/injuries` ✅ y `/sidelined` ✅ (y `components/player/PlayerInjuries.tsx`). El gap es de cobertura, no de capacidad: cerrar disponibilidad en fichas clave + un **"parte de bajas del Mundial"** (planificado) nos pone a la par en un campo muy demandado (gancho fantasy "¿juega el finde?"). Esfuerzo bajo-medio, impacto medio-alto. Ya está en la checklist 2.5 #6.
- **API / widgets** (FootyStats ✅💰; nosotros 🟡). **Veredicto: Parcial / diferir.** Tenemos `/embed` y la API está planificada para el tier Scout ("próximamente"). No es prioridad hasta tener demanda de pago probada. Esfuerzo alto, impacto incierto hoy → **diferir** al post-Mundial.
- **Profundidad B2B (agentes/clubes)** (moat de Transfermarkt). **Veredicto: Descartar.** Fuera de alcance, sin datos propietarios ni licencia para ello. No es nuestro mercado.
- **Noticias / frescura** (todos 🟡). **Veredicto: Parcial.** Tenemos RSS multi-fuente + breaking banner 🟡; suficiente como apoyo a SEO/Discover, no como producto de noticias. Mantener, no invertir fuerte.

### Tesis "superar" (surpass) — 1-2 campos donde podemos LIDERAR, no seguir

Combinando nuestros activos únicos —**dataset global de todas las posiciones + IIG transparente + radar de percentiles + hub del Mundial 2026 + bilingüe ES/EN + GEO/citabilidad por IA + comunidad real (polls/votos/picks/badges en repo)**— hay dos campos donde podemos liderar en vez de seguir:

1. **El "Bargain Index" rendimiento-vs-valor (informativo).** Nadie lo lidera: Transfermarkt tiene el valor pero no la métrica de impacto transparente ni el radar; SofaScore/FBref tienen rendimiento pero no cruzan con valor de forma limpia, compartible y bilingüe. Cruzar IIG/percentil × valor mostrado, sobre la base del `HiddenGemSeal` que ya existe, crea una categoría propia: **"el sitio que te dice quién rinde por encima de su precio"** — citable por IA, viral por liga, y defendible porque exige nuestro dataset multi-posición + IIG. Marco siempre informativo, jamás consejo financiero.

2. **"Algoritmo vs sabiduría de masas" transparente.** SofaScore tiene votos pero opacos y sin algoritmo lado a lado; FootyStats tiene algoritmo (% de equipo) pero sin comunidad; las casas de apuestas tienen cuotas pero no transparencia ni comunidad abierta. Nosotros podemos poner **`/predictions` (algoritmo) junto al voto/picks de la comunidad (ya en repo) + badge de aciertos**, todo explicado y bilingüe. Es un loop de retención y debate que ningún rival ofrece **combinado y transparente**, y encaja con nuestro ADN (IIG público, fórmula abierta). Cero apuestas: piel en el juego = puntos de acierto, no dinero.

Ambas tesis comparten el mismo principio: no batimos a nadie en su feed licenciado; **ganamos en la intersección** que solo nosotros ocupamos (rendimiento transparente × valor mostrado × comunidad × bilingüe × GEO).

---

## EN — Reclaiming ground where we lose (mirror)

Clear-eyed verdicts per lost field (full analysis in the ES section above; every capability claim traces to the repo or is marked _planned_; informational only, no betting/financial advice — by Furiosa Studio):

1. **Live scores (vs SofaScore) — Partial.** We have `/fixtures` + `/fixtures/events` + `/fixtures/lineups`. Build a polling-based matchday surface (planned `/en/live`, 30–60s refresh, needs Starter plan), not a real-time push tracker. Ceiling: we never match SofaScore's latency — that's product, not data. Worth a decent retention+SEO surface, not the main fight.
2. **Market value (vs Transfermarkt) — Pursue (as differentiator).** We can't beat their value data, so don't. Instead cross performance (IIG/percentile) × displayed value into a **"Bargain Index"** (extends the existing `HiddenGemSeal`). An angle Transfermarkt doesn't offer. Low-medium effort, high impact. Strictly informational — never buy/sell advice.
3. **Mass team-% / popularity & community (vs FootyStats / SofaScore votes) — Pursue.** We already ship real community infra in-repo: polls (`CommentsThread` `targetType:'poll'`), votes (`user-stats.votes_count`), scored user picks + a 5-tier badge system (`lib/badges.ts`). Combine our community vote with the `/predictions` algorithm into an **"algorithm vs crowd"** layer + a best-forecasters leaderboard. Skin-in-the-game is points, not money. Low-medium effort, high impact.
4. **Odds / betting — Skip (odds) / Partial (informational adjacent).** `/odds` stays **vetoed** (ToS/gambling). We CAN do `/predictions` (win/draw/loss probability) as pure information, already live in the WC friendlies bar, with a "not betting advice" disclaimer. No ambition to be a betting site.
5. **Other losses.** Injuries/suspensions — **Pursue-close** (capability exists via `/injuries`+`/sidelined`; just widen coverage + a WC injury report). API/widgets — **Partial/defer** (Scout tier, post-WC). B2B agents — **Skip** (out of scope). News/freshness — **Partial** (keep RSS, don't over-invest).

**Surpass thesis.** Two fields where, by combining our unique assets (global all-position dataset + transparent IIG + percentile radar + WC 2026 hub + ES/EN + GEO + real community), we could **lead** rather than follow: (1) the **performance-vs-value "Bargain Index"** (no rival owns the value × impact-metric × bilingual × AI-citable intersection); (2) **transparent "algorithm vs wisdom-of-crowds"** prediction layer (no rival combines an open algorithm + open community + explained methodology). We don't beat anyone's licensed feed — we win the intersection only we occupy.
