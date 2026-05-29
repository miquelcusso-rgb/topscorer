# 🚀 TopScorers — Launch templates

Plantillas listas para copiar/pegar en cada canal. Personaliza si lo necesitas pero el copy ya está alineado al positioning (Plan B+: free competitivo + comunidad como moat).

---

## 🟧 Product Hunt — Tagline + Description

**Tagline (60 chars max):**
> Football stats without betting. Cross-league rankings + community.

**Description (300-500 chars):**
> TopScorers ranks Europe's top scorers across 8 leagues in a single live table — La Liga, Premier League, Bundesliga, Serie A, Ligue 1 + Portugal, Turkey, Greece. Free tier matches what FotMob and FBref give away, then adds polls, pickem and a 5-tier community badge system. No betting nags. No tracking-heavy ads. Bilingual ES/EN. Made for fans who actually want the data.

**First comment (yours, post immediately on launch):**
> Hey PH 👋 I built this because every football stats site nudges you to a betting partner now. TopScorers is intentionally betting-free.
>
> The hook: a single ranking across 8 European leagues with our own valuation metric (Val = G·2+A). FotMob shows you a league at a time; we show you Europe. Free.
>
> Pro €2,99/mo (€2/mo annual) unlocks: ads-free, our Talent Radar (algorithmic gem-finder), unlimited saved comparisons, ×2 points in our pickem game, 24h early access to polls, badge "Pro" in comments/leaderboard.
>
> Scout €5,99/mo for devs: 50K-req/month REST API.
>
> Would love your feedback — what would you want to see next?

**Best launch day:** Tuesday 12:01 AM PST (= 09:01 Madrid). Schedule for next available Tuesday.

---

## 🔵 Hacker News — Show HN

**Title:**
> Show HN: TopScorers — Football stats without betting partners

**Body (text post, ~150 words):**
> I got tired of every football stats site (Sofascore, FotMob, etc.) becoming a betting funnel. So I built TopScorers — a single live ranking of Europe's top scorers across 8 leagues with my own valuation metric (Val = G·2+A; Val+ adds league coefficient).
>
> Stack: Next.js 16 on Vercel, Supabase, Clerk. API-Football for live data with football-data.org as a free fallback for Big-5 to control costs. Per-locale i18n routing (/es and /en) with full hreflang. Public API at /api/v1 with Bearer auth + monthly quota.
>
> The free tier matches what FBref/FotMob give away. Paid tier is the community layer: polls, pickem with auto-resolution, comments + 5-tier badge system, saved comparisons, no ads.
>
> https://www.top-scorers.com/en
>
> Happy to answer anything about the architecture (i18n routing, RLS-protected schema, Stripe subscription lifecycle).

**Best time:** Monday-Thursday 08:00 EST. Avoid Friday and weekends.

---

## 🔴 Reddit r/soccer — main post

**Title (no caps, no clickbait — r/soccer hates both):**
> I built a free European football stats site without betting/ads pushes

**Body:**
> Hi /r/soccer. Long-time lurker, finally shipped something I've wanted for years.
>
> **TopScorers** ranks the top scorers across La Liga + Premier League + Bundesliga + Serie A + Ligue 1 + Portugal + Turkey + Greece — **all in one live table**. With G/90, A/90, ratios, and our own valoration (Val = G·2+A) so you can sort cross-league.
>
> Free tier is everything you'd expect (FBref-style depth + comparator + trajectory chart + watchlist 10 + saved comparisons + comments + weekly polls + a pickem game).
>
> No betting funnels. No 4-popup-on-load nonsense. Bilingual ES/EN.
>
> Live: https://www.top-scorers.com/en
>
> Genuinely keen on feedback — what's missing that FotMob/Sofascore don't give you?

**Best time:** Sunday 20:00-22:00 UTC (= EU prime, weekly review hour).

**Tips:**
- Engage with EVERY comment within the first hour
- Don't drop the link again in replies (mods auto-flag)
- Have screenshots ready in case they ask

---

## 🟦 Reddit per-league (r/PremierLeague, r/LaLiga, etc.)

**Adapt this template** changing the league name. Example for r/LaLiga:

> **Title:** Live La Liga top scorer ranking with custom value metric (free, no betting)
>
> **Body:** I built a free European stats site and the La Liga page is one of the cleanest features. Top scorers with G/90, A/90, market values, position info and our own valoration (Val = goals·2 + assists) so the ranking actually reflects impact, not just goals.
>
> Free, no betting, ES/EN. https://www.top-scorers.com/es/competiciones/pd
>
> ¿Qué stats os echo a faltar?

**Posting cadence:** 1 sub per day, never simultaneous (mods flag cross-posters).

---

## 🐦 X / Twitter — Launch thread

**Tweet 1 (hook):**
> Estamos hartos de que cada web de stats de fútbol acabe en una casa de apuestas.
>
> Por eso construí TopScorers: ranking en vivo de las 8 grandes ligas europeas en una sola tabla.
>
> Gratis. Sin apuestas. Sin tracking.
>
> 🧵

**Tweet 2:**
> El hook técnico: una métrica de valoración propia que te permite **ordenar entre ligas**.
>
> Val = G·2+A. Val+ añade coeficiente UEFA.
>
> Mbappé en LaLiga vs Haaland en Premier vs Lewy en Bundes en la **misma tabla**.

**Tweet 3:**
> Free tier completo:
> ✅ Top 25 con todas las stats avanzadas
> ✅ Histórico de temporadas
> ✅ Comparador de jugadores
> ✅ Trayectoria de temporada
> ✅ Watchlist + comparaciones guardadas
> ✅ Encuestas + Predicciones (pickem)
> ✅ Comentarios + badges (5 niveles)

**Tweet 4:**
> Pro €2,99/mes (o €2/mes anual):
> · Sin anuncios
> · Radar de Talentos algorítmico (joyas ocultas)
> · Watchlist 50 + CSV 100/mes
> · 24h early access a polls/picks
> · ×2 puntos en pickem
> · Badge Pro destacado

**Tweet 5:**
> Scout €5,99/mes para devs:
> 🔑 API REST 50K req/mes
> Sin betting. Sin cookies invasivas. Bilingüe ES/EN.
>
> https://www.top-scorers.com/es

**Best time:** weekday 18:00-20:00 Madrid (= 12:00-14:00 EST).

**Pin** the first tweet of the thread to your profile.

---

## 📧 Cold outreach — football journalists

**Subject:** Free European football stats dashboard (no betting partners)

**Body (personalize the [bracket] parts):**
> Hi [Name],
>
> Saw your piece on [recent article topic] last week — really enjoyed the take on [specific detail].
>
> I just shipped TopScorers, a stats dashboard for European football. Free, no betting partners, bilingual ES/EN. Live cross-league ranking of top scorers across La Liga + PL + Bundesliga + Serie A + Ligue 1 + 3 more, with a custom valuation metric so you can rank players across competitions.
>
> Might be useful for verifying numbers quickly — would love your honest take:
> https://www.top-scorers.com/[es|en]
>
> No deal needed, no sign-up required to use it. Just thought you'd appreciate something built by a fan, for fans.
>
> [Tu firma — by Furiosa Studio]

**Targets:** AS, Marca digital, The Athletic (FC), Goal.com (no priority), local football podcasts.

---

## 🎨 Visual assets you'll need

- [ ] **Demo screenshot** of the main ranking table (8 leagues visible, mid-table view, both light + dark mode)
- [ ] **Product Hunt gallery** (1280×720): 5-6 screenshots (home, comparador, descubrir, predicciones, leaderboard, /es vs /en split)
- [ ] **Social card variants**: ya tenemos `og-default-es.jpg` y `og-default-en.jpg` — verifica que se vean bien en Twitter/X Card Validator (https://cards-dev.twitter.com/validator)
- [ ] **Video 30s** (opcional, multiplica conversión): screencast del cross-league ranking + voting en una poll + un pick. Loom o ScreenStudio.

---

## ⏰ Calendario recomendado de lanzamiento

| Día | Acción |
|---|---|
| **−7d** | Schedule PH launch en huntr.co o directamente |
| **−3d** | Soft launch: tu cuenta personal en LinkedIn / X (warm audience) |
| **D0 Martes 09:00 Madrid** | Product Hunt launch + tu primer comentario inmediato |
| **D0 13:00** | Hacker News Show HN |
| **D0 21:00** | Reddit r/soccer |
| **D+1** | Reddit r/LaLiga + cold outreach a 5 periodistas |
| **D+2** | Reddit r/PremierLeague + X thread completo |
| **D+3** | Reddit r/Bundesliga + responder comentarios pendientes |
| **D+5** | Reddit r/seriea, r/ligue1 |
| **D+7** | Mailing a otros 5 periodistas según respuestas |

---

## 📊 Métricas a vigilar la primera semana

- Plausible/GA4: visitantes únicos, top countries, top referrers
- GSC: queries, CTR, impresiones (early signal de SEO)
- Stripe: nuevos checkouts iniciados + conversiones
- Supabase: signups Clerk, votos en polls, comentarios posteados, picks hechos
- Métrica norte: **Pro suscritos netos / día**
