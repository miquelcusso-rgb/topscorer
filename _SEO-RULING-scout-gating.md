# SEO RULING — Gating de Scout (respuesta a `_BRIEF-scouter-tiers.md`)

> **De:** sesión GEO·SEO·SEM · **Para:** sesión de producto Topscorers
> **Fecha:** 2026-06-29 · Autoridad: GEO·SEO·SEM (el brief pedía OK de SEO antes de gatear nada del Scouter).
> **Decisión de Miqui (29-jun, tarde):** SCOUT pasa a **GO — construir HOY** (revierte el de-priorize anterior por ads-first).

## ✅ Ruling de gating (no negociable, ya decidido — quedáis desbloqueados)

- **La LISTA Top-20 del Scouter** (`/[lang]/scouter` + `/scouter/[league]`, con IIG + G/A/MP/rating) se queda **SIEMPRE FREE + indexable, SIN login**. Es el activo SEO + el objetivo de la campaña X `pmt-scouter-weekly` (tweet semanal con link a la página). Gatearla = página fina/paywall = peor ranking + menos citable por IA + rompe la automatización. **No la gateéis.** (Verificado 29-jun: hoy no tiene gating → mantenedlo así.)
- **Scout (€5.99) gatea SOLO la CAPA DE HERRAMIENTAS de ojeador**, nunca la lista ni los datos base.

## 📋 Alcance Scout a ejecutar (del brief)

| Slice | Gating | Estado |
|---|---|---|
| Desglose del IIG por jugador (de qué se compone) | SCOUT | ✅ slice-1 commiteado (3240655) |
| Comparador IIG multi-liga | SCOUT | pendiente |
| Watchlist/shortlists + alertas (IIG sube/baja) | SCOUT (free 5 / pro 25 / scout ∞ ya en `plans.ts`) | pendiente |
| Tendencia histórica del IIG · API · scout report/PDF | SCOUT | pendiente |
| Sin ads · histórico completo · compare ilimitado · export CSV · filtros avanzados | PRO | (ya definido) |
| Top-20 Scouter, resultados, golden-boot tracker, compare básico | FREE | NO gatear |

## 📋 Además (del brief, no solo gating)

1. **Tooltips** de abreviaturas (IIG/G/A/MP/Rating) accesibles (`title`/`aria-describedby`, no solo hover) **+ FAQ/leyenda "¿Qué es el IIG?" en TEXTO** (bonus GEO: citable+indexable — esto interesa a SEO, hacedlo).
2. **Matriz FREE/PRO/SCOUT** explícita desplegada en `/pricing`.
3. **Cablear/activar el precio SCOUT €5.99/mo · €49.99/yr en Stripe** (hoy "coming soon") y quitar el "coming soon".

## 🔀 Coordinación git (mismo repo)

- SEO ya pushó el cluster `golden-boot` (`app/[lang]/golden-boot/[comp]/page.tsx`, `lib/golden-boot-data.ts`, `sitemap.ts`) — **no los toquéis**.
- `git pull` antes de cada push · `git add` selectivo.
- Si vais a gatear algo que **no** sea claramente "capa de herramientas Scout", consultad a SEO antes.

La sesión SEO supervisa y queda disponible para dudas de gating/SEO/GEO.
