# Player data-quality: the duplicate-search bug

## The recurring issue

A player shows up **twice** in the player search dropdown (the comparador
picker at `app/[lang]/estadisticas/comparador/ComparadorClient.tsx` and the
global `components/saas/TopSearch.tsx`, both backed by `app/api/search/route.ts`)
— once with the right club/photo, once with a slightly different name, the wrong
club/position, and **initials instead of a photo**. Examples seen in the wild:

| Curated row (variant)              | Canonical search-index entry          | API id |
|------------------------------------|----------------------------------------|--------|
| "Michael Olise" / Man… / FW        | "M. Olise" / Bayern München / MF       | 19617  |
| "Alejandro Grimaldo" / DF          | "Álex Grimaldo" / Bayer Leverkusen / MF| 563    |
| "Christos Tzolis"                  | "C. Tzolis" / Club Brugge / FW         | 161800 |
| "Samu Omorodion" / Porto           | "Samu" / Samuel Omorodion Aghehowa     | 358628 |

## Root cause

The search candidate list is assembled from **two sources**:

1. **Curated dataset rows** (`data/players.ts` → `PRIMARY_PLAYERS`). Many curated
   rows carry **no `apiId`** and a **name/club/position VARIANT** (an
   anglicised first name like "Alejandro" vs "Álex", "Michael Olise" vs the API's
   abbreviated "M. Olise", a stale club, a guessed position).
2. **`data/search-index.ts`** — the canonical index, **one entry per API id**.

Dedup used to be keyed by the **raw `apiId`** on the row. A curated row with no
id therefore never matched the canonical entry's id, so the **same player
surfaced as two selectable entries**. The id-less variant also had no resolvable
photo, so it rendered initials.

Identity (the leaderboard merge in `lib/player-identity.ts`) had the same blind
spot when the name differed enough that the fuzzy "initial + last name" match
was ambiguous or wrong.

## The fix

- **Search dedup is keyed by resolved API id.** `app/api/search/route.ts` now
  resolves every candidate's id via `playerApiId()` (`lib/player-photo.ts`) and
  collapses same-id candidates into one, preferring the entry with an id + a
  photo + the canonical (search-index) club/position, while keeping the rich
  dataset's clean slug so the selected player still resolves to the full
  multi-season profile.
- **`playerApiId` / name resolution is stronger and safer.** In addition to
  exact name/fullName and first-last matching, it now does a **conservative
  full-name PREFIX match** (norm("Alejandro Grimaldo") is a prefix of the
  canonical "Alejandro Grimaldo García") — only when it resolves to exactly one
  player, so it never wrongly merges two people. It also honours the
  **curated-id pin map** (`data/curated-ids.ts`) **before** the fuzzy first-last
  lookup, because a shared surname can otherwise mis-merge (e.g. "Luis Díaz"
  would hit Luis *Suárez Díaz* id 157 instead of 2489).
- **Known variants are pinned** in `data/curated-ids.ts` (and in the
  `MANUAL` map of `scripts/refresh-curated.mjs` so the pin survives a
  regeneration), which also unifies them in `PRIMARY_PLAYERS`.

## Guardrail — run before shipping dataset/search changes

```
node scripts/data-quality-check.mjs
```

The checker is read-only. It loads the dataset + search-index, resolves every
selectable curated current-season player the same way the app does, and reports:

- **Duplicates** — *split* (a curated row resolves to no id while a canonical
  index entry exists → it would surface twice) and *mis-merge* (a curated row
  resolves to a different player). **Exits non-zero** if any are found, so it
  can gate a future run.
- **Near-duplicate** index name groups (homonyms) — informational.
- **Missing photos** — curated rows with no resolvable id/photo.

When it fails: **pin the variant** in `data/curated-ids.ts` (and add it to the
`MANUAL` map in `scripts/refresh-curated.mjs`), or fix the curated row's name in
`data/players.ts` so it matches the canonical entry.

## Out of scope — defender / GK coverage

Some non-scoring players (e.g. Pau Cubarsí, several Bayern defenders) are missing
entirely. That is **not** this bug: the dataset is generated from
*topscorers/topassists*, which omit players who don't score/assist. Fixing it
needs a **positional data source** (league squads + per-player season stats),
i.e. a generator/data-source change — tracked separately.
