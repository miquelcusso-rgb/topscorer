# TopScorers — Design Brief
> Preparado para revisión de diseño en Claude.ai / diseñador externo
> URL live: **https://www.top-scorers.com**
> Fecha: Mayo 2026

---

## 1. Qué es el producto

**TopScorers** es un dashboard de estadísticas de fútbol europeo — goleadores, asistentes y datos por jugador de 8 ligas (La Liga, Premier, Bundesliga, Serie A, Ligue 1, Primeira Liga, Süper Lig, Super League Grecia).

**Modelo freemium:**
- Free: top 10 jugadores, temporada actual, sin filtros avanzados
- Pro (€6/mes): top 25, todas las temporadas, radar, comparador, ELO, fantasy
- Scout (€18/mes): todo Pro + acceso API (próximamente)

**Audiencia:** aficionados al fútbol europeo, periodistas deportivos, managers de fantasy, scouts amateur. Edad estimada 18–40, mayoritariamente en España y Latam.

---

## 2. Sistema de diseño actual

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `bg` | `#060d18` | Fondo de página |
| `s1` | `#0c0d18` | Fondo superficies |
| `s2` | `#10111e` | Cards/panels |
| `bd` | `#1a1b2e` | Bordes |
| `dim` | `#2a2b3e` | Bordes hover |
| `mu` | `#52526e` | Texto muted |
| `tx` | `#d8d8ec` | Texto principal |
| `gd` | `#f0c040` | Acento gold (goles, Pro) |
| `tl` | `#00c8b0` | Acento teal (asistencias) |
| `gr` | `#38c47a` | Verde (live, ratios) |
| `or` | `#e05a30` | Naranja (alertas, pins) |
| `pu` | `#a060ff` | Púrpura (fantasy, Scout) |

**Modo claro** (implementado parcialmente):
- Fondo: `#edf1f8`
- Hero siempre oscuro: `rgba(42,56,88,.84)`
- Tabla: `#ffffff` con `rgba(228,234,250,.45)` en filas alternas

### Tipografía

| Familia | Uso | Pesos |
|---------|-----|-------|
| **Barlow Condensed** | Números grandes, labels, headings, tabla headers | 500, 600, 700 |
| **Bebas Neue** | Stats secundarios, PJ, rank | 400 |
| **DM Sans** | Cuerpo de texto, UI general | 400, 500, 600, 700 |

### Iconografía
- Flags de países: emojis Unicode
- Logos de ligas: API-Football CDN (`media.api-sports.io/football/leagues/{id}.png`)
- Badges de equipos: 3 letras en mayúsculas con color de liga

### Efectos visuales
- Background gradient: radial gradients teal/gold/blue muy sutiles en `body::before`
- Tabla: borde izquierdo de 2px en color acento para rank 1
- Cards hover: `rgba(255,255,255,.028)` bg
- LIVE indicator: dot verde con `box-shadow` pulsante animado

---

## 3. Páginas del sitio

### `/` — Estadísticas (principal)
**Hero section** (oscuro incluso en light mode):
- Título enorme: "TOP GOLEADORES DE EUROPA" en Barlow Condensed 58–88px
- Tabs: GOLEADORES · ASISTENTES · CENTROCAMPISTAS · DEFENSAS · PORTEROS
- Meta pills: Temporada 2025/26 · Tiempo real · 8 ligas activas
- Texto desc. derecha: lista de ligas

**Filter toolbar:**
- Row 1: Temporada | Top 5 | Liga (flags) | Edad | Columnas | ELO | Fantasy
- Row 2: Pin jugadores | Buscar | Watchlist
- Pills de filtro con colores semánticos (gold=temporada, teal=liga, verde=toggle)

**Stats table:**
- Columnas: # · Jugador (nombre+club+posición) · Liga · Edad · PJ · Goles · Asist · G/PJ · A/PJ · Val · Val+ · Min/G · ELO · Fantasy
- Números de goles en **24px Barlow Condensed gold**
- Mini barra horizontal proporcional a max goles
- Hover: PlayerHoverCard flotante con mini radar
- Rank 1: glow dorado, borde izquierdo

### `/jugadores` — Listado de jugadores
Grid 4 columnas de cards: nombre, club, liga, goles/asistencias
Links a páginas individuales

### `/jugadores/[slug]` — Página de jugador
- Header: nombre grande + badges
- 4 stat cards: Goles · Asist · PJ · G/PJ
- Radar chart (Recharts): 6 ejes según posición
- Tabla historial por temporada
- Panel info: valor de mercado, contrato, ELO, fantasy

### `/estadisticas/comparador` — Comparador
Búsqueda de 2 jugadores, comparación lado a lado con radares y tabla de stats

### `/resultados` — Resultados y clasificaciones
- Tabs de ligas (flag + nombre)
- Panel izquierdo: tabla de clasificación (puntos, forma, GD)
- Panel derecho: partidos (últimos + próximos)

### `/mundial-2026` — Mundial 2026
- Countdown hasta 11 Jun 2026
- Grupos (A–L con 4 equipos cada uno)
- Sedes y estadios
- Placeholder para estadísticas cuando empiece

### `/pricing` — Precios
3 columnas: Free · Pro (€6/mo) · Scout (€18/mo)
Tabla de comparación de features

### `/sign-in` y `/sign-up` — Auth
Páginas estándar de Clerk centradas

---

## 4. Componentes clave

### Navbar
- Logo: ball icon + "TOP**SCORERS**" (SCORERS en gold)
- Links desktop: Estadísticas · Jugadores · Comparar · Resultados · Mundial 2026 · Precios
- LIVE indicator (dot pulsante)
- Toggle dark/light (☀/🌙) con tooltip "Modo claro"
- CTA button: "⚡ Entrar / Pro" (gold sólido)
- Mobile: hamburger → dropdown

### PlayerRow
Fila de tabla con:
- Rank badge (top 3: círculo dorado/plata)
- Nombre + club (3 letras) + badge de posición (FW/MF/DF/GK)
- Logo de liga + nombre
- Edad, PJ
- **Goles** (grande, gold) + mini barra proporcional
- Asistencias (mediano, teal)
- Ratios, valoraciones
- Botón watchlist (★) y unpin (✕) si pinned

### PlayerHoverCard
Aparece al hover sobre la fila:
- Mini radar 5 ejes
- Stats rápidos: valor mercado, contrato, nacionalidad

### PlayerRadar
Recharts RadarChart con 6 ejes:
- FW: Goles, Asist, G/PJ, A/PJ, Valor, ELO
- MF: Asist, G/PJ, Pases, Pases clave, Recuperaciones, ELO
- DF: Recuperaciones, Intercepciones, Pases, G/PJ, Valor, ELO
- GK: Paradas, Goles enc., PJ, Valor, ELO, Pases

---

## 5. Problemas de diseño actuales

### Críticos
1. **Toolbar demasiado densa** — 2 filas de pills en desktop, en móvil es casi inutilizable. Necesita jerarquía clara y colapso inteligente.
2. **La tabla no respira** — columnas muy apretadas, dificultad para escanear la info más importante (goles/asistencias) vs. la secundaria.
3. **Modo claro incompleto** — Resultados, Mundial, Comparador y Footer aún con colores oscuros hardcoded.
4. **Hero ocupa demasiado espacio vertical** — El título enorme empuja la tabla 200px+ hacia abajo en desktop.

### Importantes
5. **PlayerHoverCard posicionamiento** — Aparece sobre la fila y a veces se corta en los bordes de la tabla.
6. **Mobile table** — La tabla es horizontal-scrollable pero la UX de scroll horizontal en móvil es muy pobre. No hay versión compacta.
7. **Página /jugadores** — El grid de cards es genérico, no transmite la identidad visual del producto.
8. **Página de jugador (/jugadores/[slug])** — Diseño funcional pero sin personalidad. El radar es el elemento más interesante pero queda pequeño.
9. **Pricing page** — El plan Scout (€18) visualmente no se distingue suficientemente de Pro. Necesita más jerarquía.
10. **Footer** — Muy genérico, no refuerza la marca.

### Menores
11. Las tabs de posición (GOLEADORES, ASISTENTES...) están algo escondidas en la parte baja del hero.
12. Los badges de liga (3 letras) no tienen suficiente diferenciación visual entre ligas similares.
13. La paginación/carga de datos no tiene skeleton loader.

---

## 6. Objetivos del rediseño

**Prioridad 1 — Legibilidad y escaneabilidad de la tabla:**
- Quiero que al abrir la app, en 3 segundos el usuario vea quién lidera y con cuántos goles.
- Los datos más importantes (goles/asistencias) deben destacar mucho más que los secundarios.
- Considerar mostrar foto del jugador (API-Football tiene fotos).

**Prioridad 2 — Mobile first:**
- La tabla en móvil tiene que ser usable. Considerar vista "card" vs vista "tabla" en móvil.
- El toolbar de filtros necesita un diseño específico para móvil (bottom sheet o colapsable).

**Prioridad 3 — Identidad de marca más fuerte:**
- El producto se llama TopScorers y habla de fútbol europeo. Eso debería sentirse más.
- El gold (#f0c040) es el color principal — usarlo de forma más consistente y con más impacto.
- Considerar elementos visuales más deportivos: césped, estadio, movimiento, energía.

**Prioridad 4 — Páginas de jugador como producto estrella:**
- `/jugadores/[slug]` debería ser la página más impresionante del sitio.
- Foto grande del jugador, stats en grande, radar prominente, historial.
- Potencial para que estas páginas sean virales en redes sociales.

---

## 7. Constraints técnicos

- Stack: Next.js 16, React, Tailwind CSS, inline styles para theming
- Fuentes disponibles: Barlow Condensed, Bebas Neue, DM Sans (Google Fonts, ya cargadas)
- **No añadir nuevas dependencias de UI** sin justificación — el proyecto ya tiene Recharts para el radar
- Debe funcionar en dark mode Y light mode
- Rendimiento: la tabla puede tener 25+ filas con hover interactivo — animaciones pesadas son un problema
- Mobile breakpoint principal: 768px (md en Tailwind)

---

## 8. Referencias e inspiración

**Estilo actual:** dark sports dashboard — similar a FBref, Sofascore, pero con más identidad visual propia.

**Referencias que me gustan:**
- **Sofascore** — jerarquía de información muy clara, uso del color por posición
- **The Athletic** — tipografía deportiva con personalidad, buen uso del espacio
- **NBA stats page** — densidad de información bien manejada
- **Opta/StatsBomb** — visualizaciones de datos elegantes

**Lo que NO quiero:**
- Demasiados gradientes/glassmorphism → se vuelve ruido
- Estilo "fantasy gaming" demasiado agresivo
- Que parezca una spreadsheet de Excel

---

## 9. Preguntas para el diseñador

1. ¿Cómo resolverías la tensión entre densidad de datos (los usuarios quieren ver muchos stats) y legibilidad?
2. ¿Qué harías con el toolbar de filtros en mobile? ¿Bottom sheet, drawer lateral, accordion?
3. ¿Tiene sentido mostrar fotos de jugadores en la tabla o solo en la página individual?
4. ¿El radar chart es el elemento diferenciador correcto o hay una visualización más impactante para comparar jugadores?
5. ¿Cómo mejorar el light mode sin que pierda la personalidad del dark mode?

---

## 10. Assets disponibles

- `/public/logo.png` — Logo cuadrado 22×22
- `/public/logo-ball.png` — Ball icon 34×34
- `/public/logos/` — Logos adicionales
- Fotos de jugadores: disponibles vía API-Football (`player.photo` URL, CDN externo)
- Logos de ligas: `https://media.api-sports.io/football/leagues/{id}.png`
- Escudos de equipos: `https://media.api-sports.io/football/teams/{id}.png`

---

## 11. Páginas a priorizar en el rediseño

**Orden sugerido:**
1. `/` — Tabla principal (más tráfico, máximo impacto)
2. `/jugadores/[slug]` — Página de jugador (potencial viral, diferenciador)
3. `/pricing` — Conversión directa a revenue
4. Navbar + Footer (presentes en todas las páginas)
5. `/resultados` — Segunda página más visitada
6. `/estadisticas/comparador` — Feature Pro estrella

---

*Para ver el sitio en vivo: https://www.top-scorers.com*
*Repositorio: privado (pedir acceso si necesario)*
