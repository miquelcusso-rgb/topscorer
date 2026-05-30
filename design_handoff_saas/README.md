# Handoff: TopScorers — SAAS Redesign

## Overview

Rediseño de **top-scorers.com**: dashboard de estadísticas de fútbol europeo (goleadores, asistentes, datos por jugador de 15+ ligas). Esta entrega cubre dos páginas críticas con un sistema visual estilo SaaS (sidebar lateral, espaciado generoso, oro + turquesa sobre blanco/negro):

1. **Landing — Tabla principal de goleadores** (`/`)
2. **Perfil del jugador** (`/jugadores/[slug]`)

El sistema debe escalar al resto de páginas (`/competiciones`, `/comparador`, `/transferencias`, `/pricing`, etc.) reutilizando los mismos tokens.

## About the Design Files

Los archivos en `reference/` son **prototipos en React + HTML** creados como referencia visual. **No son código de producción**: sirven para que veas el resultado visual exacto, las medidas y la lógica de cada componente.

Tu trabajo es **recrear estos diseños en el codebase real de TopScorers** (Next.js 16 + React + Tailwind + inline styles para theming, según el brief original), usando sus patrones, su tema y sus librerías.

Si necesitas ejecutar la referencia visual: abre `reference/index.html` con un servidor estático (`npx serve reference/` desde la carpeta del handoff). Verás las dos páginas en light/dark y un ejemplo EN.

## Fidelity

**High-fidelity.** Colores, tipografía, espaciado, layout y comportamiento están definidos con precisión. Implementa pixel-perfect contra estos mocks usando el stack del proyecto.

---

## Stack del proyecto (recordatorio del brief)

- Next.js 16 · React · Tailwind CSS · inline styles para theming
- Recharts (radar charts), Clerk (auth), Stripe (pagos), Supabase, API-Football v3
- Fuentes: **Barlow Condensed** (números/headers), **Bebas Neue** (stats secundarios — no usada actualmente, prescindible), **DM Sans** (cuerpo), **JetBrains Mono** (códigos/etiquetas), **Newsreader** (no usada en SAAS — quitar import si no se usa)

---

## Design Tokens

### Light mode
```ts
const palette = {
  bg:        '#f8f7f3',  // fondo de la app (blanco roto, sutil)
  surface:   '#ffffff',  // topbar, dropdowns
  sidebar:   '#f4f1e8',  // sidebar (toque crema para separarlo del bg)
  card:      '#ffffff',  // cards, paneles
  card2:     '#faf8f2',  // header de tablas, hover de filas, segmented bg
  border:    'rgba(24,18,4,.09)',
  borderHot: 'rgba(24,18,4,.16)',
  divider:   'rgba(24,18,4,.08)',
  hairline:  'rgba(24,18,4,.05)',
  text:      '#1c1608',
  muted:     'rgba(28,22,8,.62)',
  faint:     'rgba(28,22,8,.36)',
  primary:     '#a8761a',  // oro denso (acento marca, CTAs, número de goles)
  primaryHot:  '#c48a20',
  primarySoft: '#f6ecd2',  // tinte sólido (no usar transparencias sobre crema)
  teal:        '#0a6e5f',  // turquesa oscuro (asistencias, live, secundarios)
  tealHot:     '#0d8472',
  tealSoft:    '#d4ece6',
  red:         '#a4361c',  // alertas, deltas negativos
};
```

### Dark mode
```ts
const palette = {
  bg:        '#0a0908',
  surface:   '#0f0e0c',
  sidebar:   '#070605',
  card:      '#15130f',
  card2:     '#1c1a16',
  border:    'rgba(240,200,90,.08)',
  borderHot: 'rgba(240,200,90,.18)',
  divider:   'rgba(240,200,90,.08)',
  hairline:  'rgba(240,200,90,.05)',
  text:      '#f1e8d2',
  muted:     'rgba(241,232,210,.6)',
  faint:     'rgba(241,232,210,.34)',
  primary:     '#f0c040',  // oro cálido luminoso
  primaryHot:  '#ffd460',
  primarySoft: 'rgba(240,192,64,.14)',
  teal:        '#3ed6c2',  // turquesa luminoso
  tealHot:     '#5ee2d2',
  tealSoft:    'rgba(62,214,194,.16)',
  red:         '#e85a47',
};
```

### Avatares tintados
Los avatares en la tabla NO son fotos — son **círculos con iniciales** tintados con una de 6 variantes de oro/turquesa. La variante se elige determinísticamente a partir del nombre del jugador. Foto del jugador SOLO en hover (hover card) y en la página de perfil.

### Spacing / radii / shadows
| Token | Valor |
|---|---|
| Radio cards principales | `12px` |
| Radio botones/inputs | `6px` (`999px` para píldoras) |
| Radio avatares | `50%` (círculo) |
| Gap entre cards | `14–18px` |
| Padding cards | `16–22px` |
| Padding row de tabla | `12px 14–18px` |
| Sidebar width | `232px` |
| Topbar height | `60px` |
| Sombra modal/hover | `0 4px 24px rgba(0,0,0,.08)` (en light) |

### Tipografía

| Uso | Familia | Peso | Tamaño | Letter-spacing |
|---|---|---|---|---|
| H1 página (`Top scorers · Europe top leagues`) | DM Sans | 700 | 24px | −0.012em |
| H1 perfil jugador (`Erling Haaland`) | DM Sans | 700 | 36px | −0.02em |
| H3 panel | DM Sans | 600 | 14–16px | — |
| Body | DM Sans | 400–500 | 12–14px | — |
| Eyebrow / labels | DM Sans | 600 | 11px | 0.06–0.14em |
| Números grandes (goles líder, KPI) | Barlow Condensed | 700 | 28–96px | −0.02 a −0.04em |
| Códigos, etiquetas tabla, `⌘K`, fechas | JetBrains Mono | 500–700 | 10–12px | 0.06–0.18em |
| `fontVariantNumeric: 'tabular-nums'` en TODO número de tabla | — | — | — | — |

---

## Screens / Views

### 1. Landing — `/` (Tabla principal)

#### Layout
- Layout horizontal: **sidebar fijo (`232px`) + main fluido**
- Main = topbar (`60px`) + scroll vertical con secciones apiladas (`gap: 22px`, padding `24px`)

#### Sidebar (`<SSidebar>`)
- Background `sidebar`, border-right `border`
- Logo TopScorers + accent `primary` arriba
- **Workspace switcher**: card clickable con avatar cuadrado (`28×28`, `primary` bg, texto `bg`, "TS") + nombre "Top-Scorers" + sub "Plan Pro · €6/mes" + caret
- **Menú** (sección "Menu"):
  - Estadísticas (activo) · Competiciones · Jugadores · Comparador · Transferencias (24) · Resultados (badge live "3●" rojo)
  - Item activo: bg `primarySoft`, texto `primary`, peso 600
  - Items inactivos: texto `text`, peso 500
- **Listas** (sección "Listas"):
  - ⭐ Mi watchlist (8) · 📁 Sub-22 promesas (24) · 📁 Pichichi histórico
- **Upgrade card** (Scout): bg `primarySoft`, border `primary + '25'`, badge "Scout" + texto + botón `primary` con texto `bg` ("Actualizar plan")
- **User row** al fondo: avatar tintado "JM" + nombre + email + icono cuenta

#### Topbar
- Breadcrumb: `Estadísticas / Goleadores`
- Search pill (`max-width: 380px`): icon lupa + placeholder "Buscar jugador, equipo, liga…" + `⌘K` kbd
- A la derecha: `<TSLang>` (toggle ES/EN), `<TSThemeToggle>` (toggle sun/moon), botón **"+ Crear lista"** primario (`primary` bg, texto `bg`)

#### Page header
- `H1` "Top scorers · Europe top leagues" + subtitle con `Temporada 25/26 · J36 · {fecha}`
- A la derecha: 5 **pestañas de posición** (botones con borde + bg `primarySoft`/`tealSoft` cuando activos):
  - **Delanteros** ⚽ (activo — bg `tealSoft`, color `teal`, border `teal + '40'`)
  - **Asistentes** 🅰
  - **Centrocampistas** ⇄
  - **Defensas** 🛡
  - **Porteros** 🧤

#### KPI cards (4 columnas)
Cada card: `bg: card`, `border: border`, `radius: 10px`, padding `16px`:
1. **Líder · Goles** — `28` · "Haaland · MCI" · trend pill "↑ +3 vs Mbappé" — accent `primary`
2. **Asistencias top** — `14` · "Vinícius · RMA" · "↑ +1 esta semana" — accent `teal`
3. **Goleadores activos** — `384` · "En 12 ligas" · "↑ +12 esta jornada" — accent `primary`
4. **Goles en la jornada** — `86` · "J36 · Top 5" · "Promedio: 71" — accent `teal`

Estructura:
- Label arriba (`muted`, `12px`)
- Número grande (`32px`, `700`, `text`, `tabular-nums`) + trend pill alineado a la derecha
- Dot de color + subtítulo abajo

#### Filter bar
- Card con `radius: 10px`, padding `12px 14px`
- 5 filtros como botones con `label: value` (filtro activo: bg `primarySoft`, color `primary`, border `primary + '40'`):
  - **Liga:** Top 5 Europa (activo)
  - **Temporada:** 25/26
  - **Posición:** Todas
  - **Edad:** 18–40
  - **Min. partidos:** 5
- Botón dashed `+ Añadir filtro`
- A la derecha: counter "12 de 384" + separador + toggle vista lista/grid (segmented)

#### Tabla
- Background `card`, radius `10px`, sin sombra
- **Header row** (`card2` bg, `border` bottom):
  - Columnas: `40px · 44px · 1fr · 110px · 70px · 70px · 70px · 70px · 110px · 80px`
  - Labels: ` ` ·  ` ` · `Jugador` · `Equipo` · `Goles ↓` · `Asist.` · `PJ` · `xG` · `Forma` · ` `
  - Texto: 11px, `muted`, `600`, uppercase, `0.04em` letter-spacing
- **Filas** (hover: bg `card2`):
  - Rank (`12px`, `muted` / `primary` si top-3)
  - **Avatar tintado** (círculo 36px) con iniciales — color = `palette.avatars[hash(name) % 6]`
  - Nombre + nat/edad/pos (`14px` + `11px muted`)
  - Equipo + chip de liga (`13px` + `TSLeagueChip`)
  - **Goles**: pill con números — **fondo `primary` + texto `bg` para rank 1**, `primarySoft + primary` para el resto. `16px 700 tabular-nums`
  - **Asist.**: número `14px 500 tabular-nums` (sin pill)
  - **PJ**: `14px muted tabular-nums`
  - **xG**: número + delta (`+x.x` verde / `−x.x` rojo según signo `goals - xG`)
  - **Forma**: `<TSSparkline>` 88×20px, color `primary`, fill `primarySoft`
  - Botón ⋯ menu (visible siempre, color `faint` → `text` en hover)
- **Hover card** (`<TSHoverCard>`): aparece a la derecha de la fila al hacer hover, muestra foto + stats compactas + forma

---

### 2. Perfil del jugador — `/jugadores/[slug]`

#### Layout
- Sidebar idéntico al de landing (activo: "Jugadores")
- Topbar: breadcrumb `Jugadores / Manchester City / Erling Haaland` + botones `+ Watchlist` y `⚖ Comparar` (secundarios, border) + lang/theme toggles + botón **"↗ Compartir"** primario

#### Identity card
- Card 12px radius, padding 24px, **grid 3 columnas**: `140px · 1fr · auto`
- **Foto** (`<TSPhoto size={140} shape="rounded">`): radius 16px, fondo color del equipo (`window.TS_DATA.teamColor[teamShort]`) con gradient + silueta + monograma. En producción usar `player.photo` de API-Football.
- **Identidad central**:
  - Badge `primarySoft + primary` con icono estrella: `#1 · Bota de Oro 25/26`
  - `H1` 36px `Erling Haaland`
  - Línea meta: `🇳🇴 Noruega · 25 años · 1,94m · pie izq.` / `Manchester City · #9 · Delantero centro` / `Valor: €180M`
  - Pill **live status** con bg `tealSoft`, color `teal`, dot pulsante: `Jugando · MCI 2-1 ARS · 78'`
- **Big number column** (border-left):
  - Label "Goles 25/26"
  - Número gigante `96px 700 primary tabular-nums`: `28`
  - 3 stats inline: `AST 6 teal` · `xG 26.4 text` · `+1.6 vs xG teal`

#### Tabs
- 5 tabs: Resumen (activo, color `primary`, border-bottom 2px primary) · Tiros · Partidos · Histórico · Comparar

#### Body — grid 3 columnas (`380px · 1fr · 320px`, gap 18px)

##### Columna izquierda — Radar
- Card. Título "Perfil de rendimiento" + subtitle "vs. delanteros Top-5 Europa"
- `<TSRadar>` 320px, color `primary`, ejes: Goles · xG · Disparos · Conversión · Asistencias · Hat-tricks
- Mini-strip de 4 stats abajo: Racha `7 primary` · H-T `3 text` · Conv. `23% teal` · M/G `99 text`

##### Columna central — 2 tablas de stats

**Tabla "Estadísticas por jornada"** (últimos 10 partidos)
- Header: título + sub "Últimos 10 partidos · Manchester City · Temporada 25/26" + botón teal "Ver todos →"
- Columnas: `J · Rival(H/A) · Resultado · Min · G · A · SHT · xG · Rating`
- Datos (J36→J27): mock con valores reales — última fila (J36) bg `tealSoft` y badge "● LIVE"
- Color por celda:
  - `G > 0`: `primary` 700, `0` o vacío: `faint`
  - `A > 0`: `teal` 600
  - `Rating ≥ 8.5`: `primary` 700; `≥ 7.5`: `teal`; resto: `text`

**Tabla "Estadísticas por temporada"** (carrera completa)
- Header: título + sub "Carrera completa · 7 temporadas · 226 partidos" + segmented `Liga | UCL | Total` (Total activo)
- Columnas: `Temp. · Club · Liga · PJ · G · A · Min · M/G · Trofeos`
- 7 filas (25/26 → 19/20). Fila actual (25/26) bg `primarySoft` con dot teal indicando temporada en curso.
- **Fila TOTAL** al pie (bg `card2`, fontWeight 700): Carrera · 7 temp. · 210 · **193 (primary)** · **41 (teal)** · 17,560 · 91 · **7 🏆 (primary)**

##### Columna derecha — Info contextual

**Card "Contrato"**
- Header: título + badge "ACTIVO" (tealSoft/teal)
- Filas key-value (border-bottom hairline):
  - Club: Manchester City
  - Desde: Jun 2022
  - Hasta: Jun 2027
  - Tiempo restante: 1 año 1 mes
  - Cláusula: —
  - Salario anual: €20M brutos
  - Agente: Rafaela Pimenta

**Card "Valoración de mercado"**
- Sub: "Fuente: Transfermarkt · TS Index"
- Número gigante: `€180M` (36px 700 primary) + delta teal "↑ +€20M (3m)"
- Historial con barras horizontales (6 puntos: May 26, Feb 26, Sep 25, May 25, Sep 24, Sep 23) — fecha mono + barra primary (opacity 0.7) + valor

**Card "Selección 🇳🇴"**
- 2×2 grid de stats: `37 Partidos text` · `33 Goles primary` · `5 Asist. teal` · `Capitán Rol text`
- Footer: "Debut: 5 sep 2019 vs Malta · Próx.: Mundial 2026"

---

## Interactions & Behavior

### Theme toggle
- `<TSThemeToggle>` (pill con sun/moon que desliza). Cambia `dark` boolean → palette se recompone.
- Persistir en `localStorage` (clave `ts.theme` = `'dark' | 'light'`).

### Language toggle
- `<TSLang>` con segmented `ES | EN`. Cambia `lang` → diccionario `window.TS_T[lang]` proporciona todos los strings (ver `data.js`).
- Persistir en `localStorage` o usar i18n routing de Next (`/es/...` `/en/...`).

### Filter bar
- Cada filtro abre un dropdown (no implementado en mock — usa el patrón del codebase).
- Filtros activos: aplicar `primarySoft` bg + `primary` color + `primary + '40'` border.

### Position tabs (Delanteros/Asistentes/Centrocampistas/Defensas/Porteros)
- Click cambia el query enviado a la API y reordena la tabla. Solo uno activo a la vez.
- Activo: bg `tealSoft`, color `teal`, border `teal + '40'`.

### Tabla — filas
- Hover: bg → `card2`, hover-card aparece a la derecha tras `~200ms` (usar `<TSHoverCard>`).
- Click en fila → navega a `/jugadores/[slug]`.
- Botón `⋯` abre menu (Compartir, Añadir a watchlist, Comparar, Exportar fila CSV, etc.).
- **Hover card** debe posicionarse inteligentemente: si fila está cerca del borde derecho del viewport, abrir a la izquierda; si está cerca del fondo, anclar arriba.

### Player profile — tabs (Resumen, Tiros, Partidos, Histórico, Comparar)
- "Resumen" muestra el layout descrito. Otros tabs: usar mismo radar/header pero con contenido específico (no entregado, usar criterio o solicitar nuevo mock).

### Live status
- Componente que escucha jugador en partido en vivo. Si está jugando: pill `tealSoft + teal` con dot pulsante `boxShadow: 0 0 8px {teal}`.
- Polling cada 30s o usar WebSocket si disponible (API-Football live).

### Compartir card (`↗ Compartir`)
- Abre modal con vista previa de "tarjeta viral" (cuadrado para IG/X/WA): foto + nombre + número grande (goles) + branding TS.
- No implementado en mock — diseño en iteración previa si hace falta volver a ver.

---

## State Management

```ts
// Página landing
type LandingState = {
  position: 'Delanteros' | 'Asistentes' | 'Centrocampistas' | 'Defensas' | 'Porteros';
  filters: {
    league: 'top5' | 'all' | string;   // id de liga
    season: string;                      // '25/26' default
    position: 'all' | 'FW' | 'AM' | ...;
    ageRange: [number, number];
    minMatches: number;
  };
  sort: { column: 'goals' | 'ast' | 'xg' | ...; dir: 'asc' | 'desc' };
  view: 'list' | 'grid';
};

// Página perfil
type PlayerState = {
  player: Player;            // fetch /api/players/[slug]
  activeTab: 'overview' | 'shots' | 'matches' | 'history' | 'compare';
  seasonScope: 'liga' | 'ucl' | 'total';  // tabla por temporada
};

// Global
type GlobalState = {
  theme: 'dark' | 'light';
  lang: 'ES' | 'EN';
  user: { plan: 'free' | 'pro' | 'scout'; watchlists: Watchlist[] };
};
```

### Data fetching
- Tabla principal: paginación servidor (12 visibles, total ~384). `?position=...&league=...&season=...&page=1`
- Perfil: `/api/players/[slug]` → identidad + season-stats. `/api/players/[slug]/matches?season=...` → últimos partidos. `/api/players/[slug]/seasons?scope=total|liga|ucl` → carrera.
- Live status: subscribirse a actualizaciones del partido si `player.team.matchInProgress`.

### Plan gating (freemium)
- **Free**: top 10, temporada actual.
- **Pro €6/mes**: top 25, todas las temporadas, radar, comparador, ELO.
- **Scout €18/mes**: todo Pro + acceso API.

Esconder/desfocar filas/secciones según `user.plan`. La card "Upgrade Scout" del sidebar se debe mostrar solo a usuarios Pro; a Free mostrar otra (upgrade a Pro). Scout: ocultar la card.

---

## Components

### Atómicos compartidos (`reference/shared.jsx`)

| Componente | Props | Uso |
|---|---|---|
| `TSPhoto` | `player, size, shape, tone, showMono` | Placeholder de foto: gradient + silueta + iniciales sobre color del equipo. Reemplazar por `<img src={player.photo}>` (API-Football CDN) en prod, manteniendo el shape/fallback. |
| `TSLeagueChip` | `leagueId, dark` | Chip mono con código de liga (EPL/LL/BL/SA…). |
| `TSForm` | `form, dark, gap, dot` | Dots de últimos N partidos coloreados según goles. |
| `TSBar` | `value, max, color, bg, height, radius` | Mini bar horizontal de progreso. |
| `TSSparkline` | `values, width, height, color, fill` | Mini-chart de línea con dots en puntos > 0. |
| `TSRadar` | `values: [{label, value, pct}], size, color, gridColor, labelColor` | Radar chart SVG (sustituir por Recharts `<Radar>` si se prefiere). |
| `TSShotMap` | `shots: [{x, y, r: 'goal'|'miss'}], width, height, color, gridColor` | Mapa de tiros sobre medio campo. |
| `TSThemeToggle` | `dark, onChange, accent` | Toggle sun/moon. |
| `TSLang` | `lang, onChange, dark` | Toggle segmented ES/EN. |
| `TSHoverCard` | `player, palette, t, position` | Card que aparece en hover de fila con foto + stats. |
| `TSLogo` | `size, dark, accent` | Wordmark "TOP·SCORERS" + checkmark círculo. |

### SAAS-específicos (`reference/prop-a-saas.jsx`)

| Componente | Descripción |
|---|---|
| `SSidebar({p, active, t})` | Sidebar con menu, listas, upgrade CTA, user |
| `SHome({initialDark, initialLang})` | Landing completa |
| `SPlayer({initialDark, initialLang})` | Perfil de jugador |
| `SRow({rank, player, p, t, dark, max})` | Fila de tabla de la landing |
| `sAvatar(player, palette)` | Función que devuelve `{bg, fg}` para el círculo del avatar |

---

## Responsive

El mock está pensado para desktop (1440px). El brief original menciona que **mobile-first** es crítico, con vista "card" y bottom sheet para filtros. **Esto NO está cubierto en este handoff** — debe diseñarse aparte. Para tablet/desktop breakpoints sugeridos:

- `≥1280px`: layout completo descrito
- `1024–1279px`: sidebar colapsable a iconos (76px), KPI cards 2×2
- `768–1023px`: sidebar fuera (drawer), perfil pasa a 2 columnas (radar+centro / rail abajo)
- `<768px`: ver mock mobile separado (no entregado aquí)

---

## Assets

- **Fotos de jugadores**: `player.photo` vía API-Football CDN. El placeholder `TSPhoto` actual solo se usa cuando falta foto.
- **Logos de liga**: `https://media.api-sports.io/football/leagues/{id}.png`
- **Escudos de equipo**: `https://media.api-sports.io/football/teams/{id}.png`
- **Iconos**: SVG inline en el código. Considerar migrar a `lucide-react` o similar.
- **Banderas**: emoji 🇳🇴 inline (alternativa: `country-flag-icons`).

---

## Files

### En este bundle (`reference/` + `screenshots/`)
- `screenshots/01-landing-light.png` — landing en modo claro (ES)
- `screenshots/02-landing-dark.png` — landing en modo oscuro (ES)
- `screenshots/03-player-light.png` — perfil de jugador en modo claro (ES)
- `screenshots/04-player-dark.png` — perfil de jugador en modo oscuro (ES)
- `screenshots/05-landing-en-light.png` — landing en inglés (light)
- `reference/index.html` — abre las 5 vistas (light/dark/EN) en una sola página para revisión interactiva
- `reference/data.js` — datos de muestra (12 jugadores con stats realistas + i18n + colores de equipo)
- `reference/shared.jsx` — primitivos UI compartidos (`TSPhoto`, `TSRadar`, `TSSparkline`, etc.)
- `reference/prop-a-saas.jsx` — implementación completa de `SHome`, `SPlayer`, `SSidebar`, `SRow`

### Cómo correr la referencia
```bash
cd design_handoff_saas/reference
npx serve .
# abrir http://localhost:3000
```

### Para implementar en el codebase de TopScorers
Sugerencia de estructura (Next.js 16 app router):
```
app/
  (main)/
    layout.tsx                  → sidebar persistente
    page.tsx                    → landing (tabla)
    jugadores/
      [slug]/page.tsx           → perfil
  api/
    players/...
components/
  layout/Sidebar.tsx
  layout/Topbar.tsx
  player/PlayerRow.tsx          → fila de tabla
  player/PlayerHoverCard.tsx
  player/PlayerIdentityCard.tsx
  player/MatchTable.tsx         → estadísticas por jornada
  player/SeasonTable.tsx        → estadísticas por temporada
  player/ContractCard.tsx
  player/ValuationCard.tsx
  player/NationalTeamCard.tsx
  charts/Radar.tsx              → wrapper de Recharts
  charts/Sparkline.tsx
  charts/ShotMap.tsx
  ui/Avatar.tsx                 → círculo tintado
  ui/LeagueChip.tsx
  ui/Pill.tsx
  ui/ThemeToggle.tsx
  ui/LangToggle.tsx
lib/
  palette.ts                    → tokens light + dark exportados
  i18n.ts                       → diccionarios ES/EN
  api-football.ts               → client API-Football v3
```

Tokens en `lib/palette.ts` deberían exponerse como **CSS custom properties** (para no recalcular en cada render) — usar el patrón inline-styles del brief pero con `var(--ts-primary)` etc.

---

## Notas finales

- **Bota de Oro / Golden Boot** se usa como etiqueta para el #1 del ranking activo. Aplicar solo cuando `position === 'Delanteros'`; para otras posiciones cambiar etiqueta (ej. "Pichichi asistencias" para Asistentes, etc.).
- **Live games** debe estar reactivo: WebSocket o polling 30s. Pintar el dot teal + texto "Jugando · marcador · minuto".
- **CSV export** mencionado en filter bar: usar `papaparse` o backend endpoint que devuelva CSV con los filtros aplicados.
- **Accesibilidad**:
  - Focus states visibles (no solo hover). Usar `:focus-visible` outline 2px `primary`.
  - `aria-sort` en headers de tabla.
  - `aria-label` en toggles (theme, lang).
  - Contraste verificado en light: `primary #a8761a` sobre `bg #f8f7f3` cumple AA para 14px+. En dark `primary #f0c040` sobre `#0a0908` cumple AAA.
- **Light mode mandates**: el brief original pedía explícitamente fondo blanco con detalles crema — NO fondo amarillento general. Solo el sidebar tiene tinte crema (`#f4f1e8`); el resto es blanco/blanco-roto.
- **Sin glassmorphism, sin estilo fantasy gaming, sin estética Excel** (requisitos del brief).

Cualquier duda → revisar `reference/index.html` ejecutado localmente.
