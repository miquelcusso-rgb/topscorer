/**
 * diagnose-news-photos.mjs — quantify the news-headline → headshot coverage gap.
 *
 * Pulls the live RSS feeds (same list as lib/news.ts), extracts player-name
 * candidates from each headline, and reports which candidates the CURRENT
 * resolver (lib/player-photo.ts logic, mirrored in scripts/lib/news-resolver.mjs)
 * fails to turn into a real headshot — and why. Read-only, no API calls.
 *
 * Run: node scripts/diagnose-news-photos.mjs
 */
import {
  loadSearchIndex, loadCuratedIds, loadVerified, loadNewsNamePhotos,
  buildResolver, fetchHeadlines, extractCandidates, norm,
} from './lib/news-resolver.mjs'

const index = loadSearchIndex()
const curated = loadCuratedIds()
const verified = loadVerified()
const newsNamePhotos = loadNewsNamePhotos()
const resolve = buildResolver({ index, curated, verified, newsNamePhotos })

console.error('Fetching live headlines…')
const headlines = await fetchHeadlines()
console.error(`Got ${headlines.length} unique headlines.\n`)

// Headline-level coverage: does the headline resolve to ANY visual (a headshot)?
let resolvedHeadlines = 0
const passCounts = {}
const unresolvedCandidates = new Map() // norm(name) → { display, count }

for (const h of headlines) {
  const r = resolve(h)
  if (r.id) { resolvedHeadlines++; passCounts[r.pass] = (passCounts[r.pass] || 0) + 1; continue }
  // Headline didn't resolve to a headshot → collect its name candidates.
  for (const cand of extractCandidates(h)) {
    const cr = resolve(cand) // does the candidate name alone resolve?
    if (cr.id) continue // resolves in isolation (headline-level miss was noise)
    const key = norm(cand)
    const e = unresolvedCandidates.get(key) || { display: cand, count: 0 }
    e.count++
    unresolvedCandidates.set(key, e)
  }
}

console.log('═══ NEWS PHOTO COVERAGE DIAGNOSIS ═══')
console.log(`Headlines analysed:        ${headlines.length}`)
console.log(`Resolved to a headshot:    ${resolvedHeadlines} (${(100 * resolvedHeadlines / headlines.length).toFixed(0)}%)`)
console.log(`  by pass:                 ${JSON.stringify(passCounts)}`)
console.log(`Unresolved headlines:      ${headlines.length - resolvedHeadlines}`)
console.log(`Distinct unresolved name candidates: ${unresolvedCandidates.size}\n`)

const sorted = [...unresolvedCandidates.values()].sort((a, b) => b.count - a.count)
console.log('Top unresolved player-name candidates (name × #headlines):')
for (const e of sorted.slice(0, 60)) console.log(`  ${String(e.count).padStart(3)}  ${e.display}`)
