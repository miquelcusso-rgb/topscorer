# TopScorers — Wiki del Site

Documentación viva del proyecto. **www.top-scorers.com** — estadísticas de fútbol europeo (freemium).

> Última actualización: ver historial de git. Esta wiki es interna (devs). Para un knowledge-base público de cara a usuarios, ver sección "Pendiente".

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Clerk (`@clerk/nextjs`) — fuente de verdad del plan en `publicMetadata` |
| Pagos | Stripe (suscripciones, webhook) |
| Base de datos | Supabase (`dsomnamtjcenhkyifbon`) — contenido de usuario + cuotas |
| Datos fútbol | API-Football (api-sports.io) + football-data.org (fallback gratis Big 5) |
| Email | Resend |
| Analítica | GA4 + Google Tag Manager + Vercel Speed Insights |
| Errores | Sentry (instrumentation.ts, global-error.tsx) |
| Hosting | Vercel |
| i18n | Routing por ruta `/es` y `/en` (ver §7) |

---

## 2. Estructura de páginas (`app/[lang]/`)

Todas las páginas de cara al usuario viven bajo `app/[lang]/` (`lang` = `es` | `en`).

| Ruta | Descripción |
|---|---|
| `/[lang]` | Home — tabs Goleadores/Asistentes/Centrocampistas/Defensas/Porteros |
| `/[lang]/competiciones` + `/[slug]` | Listado y detalle de competiciones (clasificación, partidos, stats) |
| `/[lang]/jugadores` + `/[slug]` | Listado y ficha de jugador |
| `/[lang]/resultados` | Clasificaciones + últimos partidos por liga |
| `/[lang]/estadisticas/comparador` | Comparador de jugadores (Pro) |
| `/[lang]/descubrir` | Radar de Talentos (Pro) — discovery con sello |
| `/[lang]/transferencias` | Fichajes |
| `/[lang]/mundial-2026` | Mundial 2026 (grupos, sedes, calendario) |
| `/[lang]/pricing` | Planes y precios |
| `/[lang]/cuenta/api` | Gestión de claves API (Scout) |
| `/[lang]/onboarding` | Selección de club favorito post-registro |
| `/[lang]/goleadores-liga-espanola`, `/centrocampistas` | Landers SEO |
| `/[lang]/about`, `/legal`, `/privacidad` | Institucional |
| `/[lang]/sign-in`, `/sign-up` | Auth (Clerk) |

Archivos especiales fuera de `[lang]`: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/api/**`, `app/globals.css`.

---

## 3. Planes y pricing

Fuente de verdad: `Clerk publicMetadata.plan` (`free` | `pro` | `scout` | `team`). Helpers en `lib/plans.ts`.

| Feature | Free | Pro (€4.99/mes) | Scout (€11.99/mes) |
|---|---|---|---|
| Jugadores visibles | Top 10 | Top 25 | Top 50 |
| Temporadas | 25/26 + 24/25 | Desde 20/21 | Desde 20/21 |
| Publicidad | Sí (AdSense) | No | No |
| Stats avanzados / comparador / radar talentos | — | ✓ | ✓ |
| Watchlist | — | Hasta 20 | Ilimitada |
| Export CSV | — | 50/mes | Ilimitado |
| Match-by-match / API / filtros pro | — | — | ✓ |

Precios anuales: Pro €39.99, Scout €89.99. Price IDs en `.env.local`. Checkout: `/api/stripe/checkout?plan=…&billing=…`.

### Ciclo de suscripción (webhook `app/api/stripe/webhook/route.ts`)
- `checkout.session.completed` → activa plan + `planExpiry`
- `invoice.payment_succeeded` (cycle) → renueva `planExpiry`
- `customer.subscription.updated` → `cancel_at_period_end` ⇒ `planCancelsAt` (banner en navbar)
- `customer.subscription.deleted` → vuelve a `free` al expirar el período

---

## 4. Backend (Supabase)

Proyecto `dsomnamtjcenhkyifbon`. Acceso server-side vía `lib/supabase.ts` (service_role). RLS activo en todas las tablas (clerk_id = jwt.sub).

| Tabla | Uso |
|---|---|
| `watchlists` | Jugadores guardados por usuario |
| `comparisons` | Comparaciones guardadas |
| `team_notes` | Notas (Team) |
| `api_keys` | Claves API Scout — guarda **sha256**, nunca el texto plano |
| `usage_monthly` | Contadores mensuales (`csv_export`, `api_request`) |

Función `increment_usage()` (SQL, search_path bloqueado) — incremento atómico de cuotas.

---

## 5. API pública (Scout)

Auth: `Authorization: Bearer tsk_live_…`. Gate de plan Scout + cuota **50K/mes** (`lib/api-auth.ts` → `withApiAuth`, fuente de verdad: `QUOTAS` en `lib/usage.ts`). Cabeceras `X-RateLimit-*`.

| Endpoint | Descripción |
|---|---|
| `GET /api/v1` | Documentación (sin auth) |
| `GET /api/v1/players` | Jugadores (filtros: league, position, season, limit) |
| `GET /api/v1/scorers` | Ranking de goleadores |
| `GET /api/v1/standings` | Clasificación (`league`=código corto o id) |

Gestión de claves: `lib/api-keys.ts` (mint/list/revoke/verify) + UI `/cuenta/api`.

---

## 6. Sistema de Sello (HiddenGemSeal)

`components/HiddenGemSeal.tsx`. 3 variantes:

| Variante | Color | Etiqueta ES/EN | Criterio (`getSealVariant`) |
|---|---|---|---|
| `elite` | Dorado ⚡ | ÉLITE / ELITE | score ≥ 4.3 |
| `prospect` | Púrpura ★ | PROMESA / PROSPECT | edad ≤ 21 **y** score ≥ 3.6 |
| `gem` | Teal ◆ | JOYA OCULTA / HIDDEN GEM | score ≥ 3.9, o (liga menor **y** score ≥ 3.6) |

**Score** = `(G/90·3 + A/90·2) · multLiga(1.4) · multEdad(1.5/1.2) · bonusVolumen(1.1)`.
Calibrado para sellar ~14% de jugadores (antes ~64%). Componentes: `SealBadge` (pill legible, grids) + sello circular (overlays grandes).

`lib/position.ts` — `resolvePosition`/`positionLabel`: siempre devuelve posición legible; infiere genérica de stats si no hay exacta.

---

## 7. Internacionalización (i18n)

Routing por ruta: `/es/…` y `/en/…`. Implementación:
- `app/[lang]/layout.tsx` — `<html lang>`, `generateStaticParams` (es/en), `LangProvider`
- `proxy.ts` — redirige rutas sin prefijo a `/{locale}` (cookie/geo), sincroniza `ts-lang`
- `contexts/LangContext.tsx` — la URL es la fuente de verdad
- `lib/i18n.ts` — objeto `T` (claves `{es,en}`), `t(key, lang)`, `LOCALES`, `isLocale`
- Selector de idioma (Navbar) navega entre `/es` ↔ `/en`
- `sitemap.ts` — emite ambos locales con hreflang + x-default; canónicos por página locale-aware

---

## 8. SEO

- `app/sitemap.ts` — todas las rutas públicas × 2 locales con hreflang
- `app/robots.ts` — bloquea GPTBot/CCBot, permite el resto
- JSON-LD: Organization + WebSite (layout); Person + BreadcrumbList (fichas)
- Search Console: verificado por **DNS domain property** (sc-domain:top-scorers.com) — sin meta tag
- Imágenes OG: `public/og-default.jpg`, `og-player.jpg`, `og-mundial.jpg` (1200×630)

---

## 9. Variables de entorno (`.env.local`)

Clerk (pk/sk), Stripe (pk/sk/webhook + 4 price IDs), Supabase (url/anon/service/token), API_FOOTBALL_KEY, FOOTBALL_DATA_TOKEN, RESEND_API_KEY, NEXT_PUBLIC_APP_URL. **Nunca commitear** (gitignored).

---

## 10. Pendiente / Roadmap

- [ ] **Wiki pública** (knowledge-base de cara a usuarios): glosario de métricas, cómo funciona el score del Radar, explicación del sello — buen contenido SEO. *Decidir si se hace.*
- [ ] Imágenes OG (generar con Nano Banana, specs en chat)
- [ ] Endpoint público API: docs OpenAPI + más endpoints
- [ ] Alertas de rendimiento (Scout, "soon" en pricing)
- [ ] App Google Play (TWA, ver `twa/`)
- [ ] i18n: revisar strings sueltos en español hardcodeado fuera de pricing/onboarding
