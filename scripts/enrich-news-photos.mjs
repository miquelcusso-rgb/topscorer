/**
 * enrich-news-photos.mjs — BUILD/CRON-TIME enrichment of news-name → API-Football
 * photo ids. NEVER a per-request fetch.
 *
 * PROBLEM: many news headlines name players who are NOT in our SEARCH_INDEX
 * (Cristiano/Benzema in Saudi, Messi in MLS, players from leagues we don't
 * ingest) or appear in a name form our matcher misses, so they fall back to the
 * club crest / branded placeholder instead of a real headshot.
 *
 * FIX: pull live headlines (same RSS feeds as lib/news.ts), extract player-name
 * candidates, and for each candidate that the CURRENT resolver can't turn into a
 * verified headshot, call API-Football's master directory
 *   GET /players/profiles?search=<lastname>   (min 3 letters; searches LAST name)
 * pick the BEST match with PRECISION-FIRST disambiguation (below), confirm the
 * photo is REAL (not the ~5192-byte silhouette), and cache
 *   normalizedName → id
 * into data/news-name-photos.ts. The app's headshotForHeadline then consults
 * that cache (photo-trusted: the photo was verified here at enrichment time).
 *
 * PRECISION RULE (a wrong face is worse than a placeholder):
 *   1. Build the candidate's normalized "first last" key.
 *   2. Among /profiles results, score each by full-name match to the candidate:
 *      - EXACT: norm(firstname + ' ' + lastname) === candidate            (best)
 *      - the candidate is a prefix/subset of norm(firstname+lastname)       (good)
 *      - lastname-only (candidate had no usable first name)                 (weak)
 *   3. Require a UNIQUE best match at the top tier — if two results tie at the
 *      best tier, SKIP (ambiguous → never guess a face).
 *   4. The chosen id's photo must be REAL (md5/size != silhouette) — else SKIP.
 *
 * QUOTA: API-Football Pro = 7500/day. We cap lookups per run (default 250) and
 * throttle. One /profiles call per distinct candidate surname, deduped.
 *
 * Run:
 *   node scripts/enrich-news-photos.mjs            # fetch live news, enrich, write
 *   node scripts/enrich-news-photos.mjs --dry      # don't write the data file
 *   node scripts/enrich-news-photos.mjs --cap=120  # limit API lookups this run
 *   node scripts/enrich-news-photos.mjs --names="Piero Hincapie,Nico Paz"  # ad-hoc
 */
import { writeFileSync, readFileSync } from 'fs'
import { createHash } from 'crypto'
import { setTimeout as sleep } from 'timers/promises'
import {
  loadEnv, loadSearchIndex, loadCuratedIds, loadVerified, loadNewsNamePhotos,
  buildResolver, fetchHeadlines, extractCandidates, norm,
} from './lib/news-resolver.mjs'

loadEnv('.env.local')
const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) { console.error('Missing API_FOOTBALL_KEY in .env.local'); process.exit(1) }

const BASE = 'https://v3.football.api-sports.io'
const DRY = process.argv.includes('--dry')
const CAP = Number(process.argv.find((a) => a.startsWith('--cap='))?.split('=')[1] || 250)
const NAMES_ARG = process.argv.find((a) => a.startsWith('--names='))?.split('=')[1]

const SILHOUETTE_MD5 = '430d67fd79ad0a355b212d5780886e34'
const SILHOUETTE_SIZE = 5192

// ── Setup: current resolver, so we only spend quota on names that DON'T resolve
const index = loadSearchIndex()
const curated = loadCuratedIds()
const verified = loadVerified()
const existing = loadNewsNamePhotos() // normalizedName → id (already cached)
const resolve = buildResolver({ index, curated, verified, newsNamePhotos: existing })

const firstLast = (s) => { const p = norm(s).split(/\s+/).filter(Boolean); return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : norm(s) }
const lastWord = (s) => { const p = norm(s).split(/\s+/).filter(Boolean); return p[p.length - 1] ?? '' }

// Stop-list: tokens that look like names but are clubs/leagues/journalists/places.
// Anything whose LAST word is a club/place stopword or that is a known non-player
// phrase is dropped BEFORE we spend an API call.
const NON_PLAYER = new Set([
  'football scores', 'premier league', 'la liga', 'serie a', 'champions league',
  'europa league', 'nations league', 'world cup', 'club world cup', 'fa cup',
  'carabao cup', 'boxing day', 'sky sports', 'relegation check', 'tartan army',
  'south africa', 'south korea', 'saudi arabia', 'estados unidos', 'liga endesa',
  'league one', 'league two', 'primera division', 'el clasico', 'trofeo naranja',
  'sid lowe', 'nicky bandini', 'andy brassell', 'jokin gabilondo', 'louise eta',
  'premier league international', 'german bundesliga', 'bundesliga futbol',
  'world cups', 'man city', 'man utd', 'man united', 'union berlin', 'coventry city',
  'nottingham forest', 'crystal palace', 'aston villa', 'west ham', 'rayo vallecano',
  'london city lionesses', 'st pauli', 'la serie', 'la premier league',
])
// Spanish article-prefixed club mentions ("El Arsenal", "El Barça") — drop.
const SPANISH_ARTICLES = new Set(['el', 'la', 'los', 'las', 'un', 'una'])

function isLikelyPlayer(candidate) {
  const n = norm(candidate)
  if (!n || n.split(' ').length < 2) return false
  if (NON_PLAYER.has(n)) return false
  const toks = n.split(' ')
  if (SPANISH_ARTICLES.has(toks[0])) return false // "el arsenal", "la premier"
  // Surname must be >=4 letters: /players/profiles rejects searches under 4
  // characters ("The Search field must be at least 4 characters in length").
  if (lastWord(n).length < 4) return false
  return true
}

// ── Gather candidate names (from live news, or --names) ──────────────────────
let candidates
if (NAMES_ARG) {
  candidates = NAMES_ARG.split(',').map((s) => s.trim()).filter(Boolean)
} else {
  console.error('Fetching live headlines…')
  const headlines = await fetchHeadlines()
  console.error(`Got ${headlines.length} headlines.`)
  const set = new Map() // norm → display (canonical-ish original casing)
  for (const h of headlines) {
    if (resolve(h).id) continue // headline already resolves → skip its candidates
    for (const c of extractCandidates(h)) {
      const key = norm(c)
      if (!set.has(key)) set.set(key, c.replace(/[’']s$/, '').trim())
    }
  }
  candidates = [...set.values()]
}

// Filter to likely players + not already resolvable + not already cached.
const targets = []
const seenKey = new Set()
for (const c of candidates) {
  const key = norm(c)
  if (seenKey.has(key)) continue
  seenKey.add(key)
  if (!isLikelyPlayer(c)) continue
  if (existing.has(key)) continue
  if (resolve(c).id) continue // already resolves via index/mononym/curated
  targets.push({ display: c, key, surname: lastWord(c), fl: firstLast(c) })
}

// Dedup API calls by surname (one /profiles call per surname covers all
// candidates sharing it). Keep the candidates grouped under each surname.
const bySurname = new Map()
for (const t of targets) {
  if (!bySurname.has(t.surname)) bySurname.set(t.surname, [])
  bySurname.get(t.surname).push(t)
}
const surnames = [...bySurname.keys()].slice(0, CAP)
console.error(`Candidates needing resolution: ${targets.length} across ${bySurname.size} surnames; querying ${surnames.length} (cap ${CAP}).`)

// ── API helpers ──────────────────────────────────────────────────────────────
async function profilesSearch(surname) {
  try {
    const r = await fetch(`${BASE}/players/profiles?search=${encodeURIComponent(surname)}`, { headers: { 'x-apisports-key': KEY } })
    if (!r.ok) return { results: [], err: `http ${r.status}` }
    const j = await r.json()
    if (j.errors && (Array.isArray(j.errors) ? j.errors.length : Object.keys(j.errors).length)) {
      return { results: [], err: JSON.stringify(j.errors) }
    }
    return { results: (j.response || []).map((x) => x.player).filter(Boolean), err: null }
  } catch (e) { return { results: [], err: String(e) } }
}
const photoCache = new Map()
async function photoIsReal(id) {
  if (photoCache.has(id)) return photoCache.get(id)
  try {
    const r = await fetch(`https://media.api-sports.io/football/players/${id}.png`)
    if (!r.ok) { photoCache.set(id, false); return false }
    const buf = Buffer.from(await r.arrayBuffer())
    const real = buf.length !== SILHOUETTE_SIZE && createHash('md5').update(buf).digest('hex') !== SILHOUETTE_MD5
    photoCache.set(id, real)
    return real
  } catch { photoCache.set(id, false); return false }
}

// PRECISION-FIRST disambiguation. Returns the chosen id or null.
// API-Football quirk: `firstname` often carries the player's WHOLE name
// ("Piero Martín Hincapié Reyna") while `lastname` is just the surname
// ("Hincapié"). So we score against the SET of all name tokens (firstname +
// lastname + name), not a positional first/last compare.
function tokenSet(p) {
  return new Set(norm(`${p.firstname || ''} ${p.lastname || ''} ${(p.name || '').replace(/\b[a-z]\./gi, '')}`)
    .split(/\s+/).filter((t) => t.length >= 2))
}
function fullName(p) { return norm(`${p.firstname || ''} ${p.lastname || ''}`).replace(/\s+/g, ' ').trim() }
function scoreMatch(cand, p) {
  const c = norm(cand.display)
  const cfl = cand.fl
  const fn = fullName(p)
  const nm = norm(p.name) // e.g. "p. hincapie"
  if (!fn && !nm) return 0
  // Tier 3 (best): exact full-name match on firstname+lastname OR on `name`,
  // either against the full candidate or its first+last contraction.
  if (fn && (fn === c || fn === cfl)) return 3
  if (nm && (nm === c || nm === cfl)) return 3
  // Tier 2: ALL candidate tokens (e.g. "piero", "hincapie") are present in the
  // player's token set AND the candidate's surname matches the player's
  // `lastname`. Handles the firstname-carries-everything quirk + middle names,
  // while the surname==lastname anchor keeps it specific.
  const toks = tokenSet(p)
  const cTokens = c.split(' ').filter(Boolean)
  const allPresent = cTokens.every((t) => toks.has(t))
  const lnToks = norm(p.lastname).split(/\s+/).filter(Boolean)
  const lastnameMatches = lnToks.includes(cand.surname)
  if (allPresent && lastnameMatches) return 2
  // Tier 1 (weak): lastname equals candidate's surname only. Used only when a
  // single result has it (unique) — never to break a tie.
  if (norm(p.lastname) === cand.surname || lastWord(nm) === cand.surname) return 1
  return 0
}

// Pick the best, UNIQUE match. If the top tier has >1 distinct id → ambiguous → null.
async function bestMatch(cand, results) {
  const scored = results.map((p) => ({ p, s: scoreMatch(cand, p) })).filter((x) => x.s > 0)
  if (!scored.length) return { id: null, reason: 'no-name-match' }
  const top = Math.max(...scored.map((x) => x.s))
  const topHits = scored.filter((x) => x.s === top)
  const distinctIds = [...new Set(topHits.map((x) => x.p.id))]
  if (top === 1) return { id: null, reason: 'only-surname-tier' } // too weak alone
  if (distinctIds.length > 1) {
    // Tie at the best tier → try to break ONLY if exactly one has a real photo.
    const realOnes = []
    for (const id of distinctIds) if (await photoIsReal(id)) realOnes.push(id)
    if (realOnes.length === 1) return { id: realOnes[0], reason: `tie-broken-by-photo(${top})` }
    return { id: null, reason: `ambiguous-tier-${top}` }
  }
  const id = distinctIds[0]
  if (!(await photoIsReal(id))) return { id: null, reason: 'silhouette' }
  return { id, reason: `match-tier-${top}` }
}

// ── Run ──────────────────────────────────────────────────────────────────────
const resolved = new Map(existing) // start from existing cache; add new
let apiCalls = 0; let added = 0
const skips = {}
const log = []
for (const surname of surnames) {
  const group = bySurname.get(surname)
  const { results, err } = await profilesSearch(surname)
  apiCalls++
  if (err) { log.push(`  ✗ ${surname}: API error ${err}`); skips.apiError = (skips.apiError || 0) + 1; await sleep(250); continue }
  for (const cand of group) {
    const { id, reason } = await bestMatch(cand, results)
    if (id) {
      resolved.set(cand.key, id)
      added++
      log.push(`  ✓ ${cand.display} → ${id} (${reason}) photo OK`)
    } else {
      skips[reason] = (skips[reason] || 0) + 1
      log.push(`  · ${cand.display} → skip (${reason})`)
    }
  }
  await sleep(250) // throttle (~4 req/s well under Pro limits)
}

console.error('\n' + log.join('\n'))
console.error(`\nAPI /profiles calls: ${apiCalls} · newly resolved: ${added} · total cached: ${resolved.size}`)
console.error(`Skips: ${JSON.stringify(skips)}`)

if (DRY) { console.error('--dry: not writing data/news-name-photos.ts.'); process.exit(0) }

// ── Write data/news-name-photos.ts (stable, sorted) ──────────────────────────
const sortedEntries = [...resolved.entries()].sort((a, b) => a[0].localeCompare(b[0]))
const obj = {}
for (const [k, v] of sortedEntries) obj[k] = v
const out = `// AUTO-GENERATED by scripts/enrich-news-photos.mjs — do not edit by hand.
// normalized news-headline player name → API-Football player id. These are names
// that appear in football news headlines but are NOT in our SEARCH_INDEX (players
// in leagues we don't ingest — Saudi, MLS, etc.) or in a name form our matcher
// missed, so they previously fell back to a club crest / placeholder.
//
// Each id's photo was CONFIRMED REAL (not the ~5192-byte api-sports silhouette)
// at enrichment time, with precision-first name disambiguation against
// /players/profiles (exact full-name match wins; ambiguous → never cached). So
// lib/player-photo.ts treats these ids as photo-trusted and emits the headshot
// directly (bypassing the verifiedPhoto gate), same as the curated mononyms.
//
// Refresh: node scripts/enrich-news-photos.mjs   (wired to a weekly cron).
// Generated ${new Date().toISOString().slice(0, 10)} · ${sortedEntries.length} names.
export const NEWS_NAME_PHOTOS: Record<string, number> = ${JSON.stringify(obj, null, 0)}
`
writeFileSync('data/news-name-photos.ts', out)
console.error(`Wrote data/news-name-photos.ts with ${sortedEntries.length} names.`)
