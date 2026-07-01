# BRIEF — Scouter: tooltips + repaso de tiers FREE / PRO / SCOUT

> **De:** sesión Content-Distributor (canal de distribución + campaña de backlinks).
> **Para:** sesión de producto **topscorer** (`sites/topscorer`).
> **Fecha:** 2026-06-25 · **Marca/autoría:** siempre "Furiosa Studio", nunca el nombre real de Miqui.
> **Decisión de Miqui:** le gusta el Scouter; quiere (1) tooltips en las abreviaturas, (2) repasar/clarificar las diferencias FREE/PRO/SCOUT, (3) decidir qué del Scouter es gratis vs Scout.

---

## Contexto que debes tener en cuenta (importante)

Las páginas **Scouter** (`/[lang]/scouter` + `/scouter/[league]`, Top-20 por liga rankeado por IIG) **NO son solo una feature de producto: son un activo de SEO/GEO**. El canal Content-Distributor tiene una **campaña automatizada** (edge function `pmt-scouter-weekly` + pg_cron, martes 17:00 CEST) que **cada semana publica en X un tweet rotando liga, con el #1 en vivo y un link a esa página Scouter** → tráfico + backlinks recurrentes para posicionarlas.

**Consecuencia directa:** cualquier decisión de **gating** (esconder contenido tras login/paywall) en las páginas Scouter impacta la indexación y la campaña. **Coordínalo con la sesión GEO·SEO·SEM antes de gatear nada.**

---

## TAREA A — Tooltips de abreviaturas (UX, win fácil)

Al pasar el ratón sobre cada cabecera/abreviatura de la tabla Scouter (y donde aparezcan en la web), mostrar un tooltip que la desarrolle. Definiciones:

| Abrev. | Tooltip |
|---|---|
| **IIG** | Índice de Impacto del Goleador (Furiosa Studio): goles × fuerza de la liga + rating + asistencias. Solo stats reales. |
| **G** | Goals — goles marcados en la temporada. |
| **A** | Assists — asistencias. |
| **MP** | Matches Played — partidos jugados. |
| **Rating** | Nota media de rendimiento del jugador en la temporada. |

- Accesible (no solo hover: `title`/`aria-describedby` o tooltip con foco para móvil/teclado).
- **Bonus GEO**: definir los términos en texto (no solo tooltip visual) ayuda a que las IA citen bien la métrica. Considera una mini-leyenda/`<dl>` o FAQ "¿Qué es el IIG?" en la página (citable + indexable).

---

## TAREA B — Repaso y definición clara de FREE / PRO / SCOUT

Hoy esto está difuso (Scout = "coming soon") y hay que dejar la matriz **explícita y coherente**. Resuelve estas preguntas y fija la tabla.

### Preguntas a resolver
1. **¿FREE necesita cuenta?** → Recomendación: **NO para VER** (crítico para SEO — Google y usuarios deben acceder sin login). La cuenta en FREE es **opcional**, solo para personalización (favoritos, polls, seguir jugadores). Nada de dato escondido tras login.
2. **¿Qué diferencia exactamente FREE vs PRO vs SCOUT?** (hoy borroso).
3. **¿Dónde encaja el Scouter/IIG?** → Recomendación content-distributor: **la LISTA Top-20 se queda FREE e indexable** (es el lead magnet + el motor SEO). **Scout vende la CAPA de herramientas de ojeador**, no la lista. Gatear la lista = perder el SEO + flojo vs Transfermarkt/FBref/Sofascore (que enseñan todo gratis).

### Estado actual conocido (VERIFICAR contra Stripe + repo, puede estar desfasado)
- **FREE**: top 25, full history, compare tool, community polls (según el copy de launch).
- **PRO**: €2.99/mo · €24.99/yr (activo).
- **SCOUT**: €5.99/mo · €49.99/yr — "coming soon".
- Stripe prices live en `sites/topscorer/.env.local` / dashboard Stripe. Confirma qué hay realmente cableado.

### Propuesta de matriz (PUNTO DE PARTIDA — refínala con la realidad)

| Capacidad | FREE (sin cuenta) | FREE + cuenta | **PRO** €2.99 | **SCOUT** €5.99 |
|---|---|---|---|---|
| Ver Top-20 Scouter de todas las ligas (IIG, G/A/MP/rating) | ✅ | ✅ | ✅ | ✅ |
| Resultados, Golden Boot tracker, compare básico (2 jugadores) | ✅ | ✅ | ✅ | ✅ |
| Favoritos / seguir jugadores / community polls / home personalizada | — | ✅ | ✅ | ✅ |
| Sin anuncios · histórico completo de temporadas · compare ilimitado · export CSV · filtros avanzados | — | — | ✅ | ✅ |
| **Desglose del IIG** por jugador (de qué se compone) | — | — | — | ✅ |
| **Comparador IIG multi-liga** | — | — | — | ✅ |
| **Shortlists/watchlist + alertas** (IIG sube/baja) | — | — | — | ✅ |
| **Tendencia histórica del IIG** · API · scout report/PDF | — | — | — | ✅ |

**Lógica del salto €2.99→€5.99:** FREE = navegar (SEO/lead). PRO = power-user (sin ads, histórico, export). SCOUT = herramientas de ojeador de verdad (lo único que NO tiene Transfermarkt). El nombre "Scout" encaja: vendes *hacer scouting*, no *ver una tabla*.

---

## Restricción NO negociable (SEO)
**No gatear la lista Top-20 del Scouter** (ni meterla tras login) sin OK de la sesión GEO·SEO·SEM. Es el activo que la campaña de backlinks está empujando; gatearla = página fina + paywall = peor ranking y menos citable por IA, y tira por tierra la automatización semanal.

## Entregable
1. Tooltips implementados (+ opcional FAQ/leyenda del IIG).
2. Matriz FREE/PRO/SCOUT final, verificada contra Stripe, desplegada en `/pricing` + gating coherente.
3. Si decidís gatear ALGO del Scouter → consultar antes a GEO·SEO·SEM.
4. Avisar a Content-Distributor si cambia el copy de pricing (lo usamos en launches/X).
