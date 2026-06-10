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
