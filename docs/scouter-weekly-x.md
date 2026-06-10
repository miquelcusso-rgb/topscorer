# Scouter weekly — X cadence

Programmatic SEO surface: **Scouter Top-20 by league**
(`/[lang]/scouter` index + `/[lang]/scouter/[league]` per league, both `es` + `en`).

Each league page is a Top-20 ranked by the **IIG** striker impact index
(`rankScore` in `lib/iig.ts`) built only from real season stats. They are
static (SSG) with 6h ISR, so the numbers track the dataset.

This doc defines the weekly X cadence to push one Scouter page per week and the
ready-to-wire SQL to queue the tweet. **Do not run the INSERT from here** — it is
a template for the weekly card (see the Content-Distributor channel / launches
card wiring). Posting goes through `pmt_x_queue` → cron `*/5` → `pmt-x-poster`
(OAuth 1.0a), account `furiosadata`, never manual.

## Cadence

- **1 Scouter tweet / week**, English only (@Furiosadata is EN-only).
- Slot: **Tuesday–Thursday, 17:00–19:00 CEST**, 1 post/day max (fits the
  3–5/week global ritual; see `social-posting-protocol.md`).
- Rotate the league each week so every Top-20 page gets a backlink over the
  season. Suggested rotation: Big-5 first (La Liga, Premier, Bundesliga, Serie A,
  Ligue 1), then Eredivisie / Primeira Liga / Süper Lig, then the rest.
- Brand voice: concrete > abstract, no "excited to announce", lead with the
  ranking and the #1, link the exact `/en/scouter/<league>` URL.
- URL must be the canonical 200 (locale-prefixed, no trailing slash):
  `https://www.top-scorers.com/en/scouter/<league-slug>`.

## Tweet example (EN)

> La Liga Scouter — Top 20 of 25/26, ranked by IIG (our striker impact index:
> goals × league strength + rating + assists, real stats only).
>
> See who's actually carrying the league 👇
> https://www.top-scorers.com/en/scouter/la-liga

Keep it ≤280 chars. Swap the league name + slug per rotation. Optionally append
the current #1 ("#1 right now: <player>") — pull it from the page's own ranking
so the tweet and the page never disagree.

## SQL — queue the weekly tweet (template, DO NOT run here)

Single tweet, scheduled for a Tuesday 17:00 CEST. Replace the date and the
league name/slug each week. `$$…$$` dollar-quoting keeps apostrophes safe.

```sql
INSERT INTO pmt_x_queue (account, text, scheduled_at)
VALUES (
  'furiosadata',
  $$La Liga Scouter — Top 20 of 25/26, ranked by IIG (our striker impact index: goals × league strength + rating + assists, real stats only). See who's actually carrying the league 👇 https://www.top-scorers.com/en/scouter/la-liga$$,
  '2026-06-16 17:00+02'
);
```

### Edit / cancel a queued tweet

```sql
-- cancel before it posts
UPDATE pmt_x_queue SET status = 'cancelled' WHERE id = <id>;
```

### League slugs

The `<league-slug>` is `slugify(league.name)` — the same slug used by
`/competiciones/<slug>`. Only leagues with tracked players have a Scouter page
(`leaguesWithData()` in `lib/league-data.ts`); examples:
`la-liga`, `premier-league`, `bundesliga`, `serie-a`, `ligue-1`,
`primeira-liga`, `eredivisie`, `super-lig`.

---
by Furiosa Studio
