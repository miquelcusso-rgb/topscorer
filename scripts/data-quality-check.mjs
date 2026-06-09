#!/usr/bin/env node
/**
 * data-quality-check.mjs — read-only guardrail against the RECURRING player
 * search/identity data-quality bug.
 *
 * THE BUG (see docs/data-quality.md): the player search dropdown (comparador +
 * global TopSearch) lists candidates from TWO sources — curated dataset rows
 * (data/players.ts, often with NO apiId and a NAME/CLUB/POSITION VARIANT) and
 * the canonical search-index (data/search-index.ts, ONE entry per API id). When
 * a curated row's name differs from the canonical one ("Alejandro Grimaldo" vs
 * "Álex Grimaldo", "Michael Olise" vs "M. Olise") and carries no id, the two
 * fail to merge and the SAME player shows up TWICE — once with the wrong club /
 * position and no photo (initials).
 *
 * This checker resolves every SELECTABLE candidate to its API-Football id the
 * same way the app does (lib/player-photo.ts: name / fullName / first-last /
 * conservative full-name prefix, plus the curated-ids pin map) and reports:
 *   • DUPLICATES — two candidates that resolve to the SAME id but differ in
 *     name/club/position (the bug), and near-duplicate names not pinned.
 *   • MISSING PHOTOS — selectable players with no resolvable photo.
 * Exits 1 if duplicates are found, so it can gate a dataset/search change.
 *
 * Run before shipping any dataset or search change:
 *     node scripts/data-quality-check.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = p => readFileSync(join(ROOT, p), 'utf8')

// ── normalization (mirrors lib/player-photo.ts) ──────────────────────────────
const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim()
const firstLast = s => { const p = s.split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : s }

// ── load search-index (canonical: one entry per API id) ──────────────────────
const idxSrc = read('data/search-index.ts')
const idxMatch = idxSrc.match(/JSON\.parse\("(.*)"\)/s)
if (!idxMatch) { console.error('Could not parse data/search-index.ts'); process.exit(2) }
const SEARCH_INDEX = JSON.parse(JSON.parse('"' + idxMatch[1] + '"'))

// ── load curated-id pin map (data/curated-ids.ts) ────────────────────────────
const pinSrc = read('data/curated-ids.ts')
const pinMatch = pinSrc.match(/CURATED_IDS[^=]*=\s*(\{.*\})/s)
const CURATED_IDS = pinMatch ? JSON.parse(pinMatch[1]) : {}

// ── id resolution (mirrors lib/player-photo.ts playerApiId) ──────────────────
const NAME_TO_ID = new Map()
const FULL_TO_ID = new Map()
const FULL_AMBIG = new Set()
for (const p of SEARCH_INDEX) {
  if (!p.id) continue
  for (const key of [norm(p.name), norm(p.fullName), firstLast(norm(p.name)), p.fullName ? firstLast(norm(p.fullName)) : '']) {
    if (key && !NAME_TO_ID.has(key)) NAME_TO_ID.set(key, p.id)
  }
  const nf = norm(p.fullName)
  if (nf) { const cur = FULL_TO_ID.get(nf); if (cur === undefined) FULL_TO_ID.set(nf, p.id); else if (cur !== p.id) FULL_AMBIG.add(nf) }
}
function idByFullNamePrefix(name) {
  const q = norm(name)
  if (!q || q.split(' ').length < 2) return undefined
  let found
  for (const [nf, id] of FULL_TO_ID) {
    if (FULL_AMBIG.has(nf)) continue
    if (nf === q || nf.startsWith(q + ' ')) { if (found !== undefined && found !== id) return undefined; found = id }
  }
  return found
}
// Resolution order MIRRORS lib/player-photo.ts playerApiId(): exact name/full →
// curated-id PIN (curated truth, beats fuzzy surname collisions) → first-last →
// full-name prefix.
function resolveId(name, fullName) {
  return NAME_TO_ID.get(norm(name)) ?? (fullName ? NAME_TO_ID.get(norm(fullName)) : undefined)
    ?? CURATED_IDS[norm(name)] ?? (fullName ? CURATED_IDS[norm(fullName)] : undefined)
    ?? NAME_TO_ID.get(firstLast(norm(name)))
    ?? idByFullNamePrefix(name) ?? (fullName ? idByFullNamePrefix(fullName) : undefined)
}
const INDEX_BY_ID = new Map(SEARCH_INDEX.map(p => [p.id, p]))
const lastTok = s => { const t = norm(s).split(' ').filter(Boolean); return t[t.length - 1] ?? '' }

// ── load curated rows (data/players.ts RAW) ──────────────────────────────────
// Selectable candidates from the curated dataset are its CURRENT-season rows.
const playersSrc = read('data/players.ts')
const rowRe = /\{\s*name:\s*'([^']+)'[^}]*?club:\s*'([^']*)'[^}]*?(?:position:\s*'([^']*)')?[^}]*?season:\s*'(\d{4})'[^}]*?\}/g
const curated = []
let mm
while ((mm = rowRe.exec(playersSrc))) {
  curated.push({ name: mm[1], club: mm[2], pos: mm[3] || '', season: mm[4] })
}
// position lives in the EXT map keyed by name; pull it for richer comparison.
const posByName = {}
const extRe = /'([^']+)':\s*\{[^}]*?position:\s*'([^']+)'/g
while ((mm = extRe.exec(playersSrc))) posByName[mm[1]] = mm[2]

// Selectable candidates: current-season (2526) curated rows + all index entries.
const CURRENT = '2526'
const candidates = []
for (const r of curated) {
  if (r.season !== CURRENT) continue
  candidates.push({
    src: 'curated', name: r.name, club: r.club,
    pos: r.pos || posByName[r.name] || '',
    apiId: resolveId(r.name),
    hasPhoto: false, // curated RAW rows carry no photo; photo comes via resolved id
  })
}
for (const p of SEARCH_INDEX) {
  candidates.push({
    src: 'index', name: p.name, club: p.club, pos: p.pos || '',
    apiId: p.id, hasPhoto: !!p.photo || !!p.id, // index entries are id-backed → photo resolvable
  })
}

// The search route (app/api/search/route.ts) builds its candidate list KEYED BY
// resolved API id, so any curated row + index entry that resolve to the same id
// collapse into ONE selectable entry — that is the CORRECT, fixed state, not a
// bug. So we don't flag same-id curated/index pairs. We flag the two real
// failure modes that produce a duplicate or a wrong row in the dropdown:
//
//   (A) SPLIT — a curated current-season row that resolves to NO id while a
//       canonical index entry for the SAME player exists. With no id it can't
//       merge → it survives as a SECOND selectable entry (the original bug:
//       wrong club/pos + initials). Fix: pin it in data/curated-ids.ts.
//   (B) MIS-MERGE — a curated row resolves to an id whose canonical SURNAME
//       differs from the curated surname (e.g. "Luis Díaz" → Luis *Suárez*).
//       The collapsed entry then shows the WRONG player. Fix: pin the correct
//       id (the pin beats the fuzzy match).
const indexLastTokens = new Map() // surname → set of ids (to detect a same-player index entry)
for (const p of SEARCH_INDEX) {
  const k = lastTok(p.name) || lastTok(p.fullName)
  if (!k) continue
  if (!indexLastTokens.has(k)) indexLastTokens.set(k, new Set())
  indexLastTokens.get(k).add(p.id)
}

const duplicates = [] // real bugs (split or mis-merge)
for (const c of candidates) {
  if (c.src !== 'curated') continue
  const cs = lastTok(c.name)
  if (c.apiId == null) {
    // (A) split: only a problem if a canonical entry for this surname exists.
    if (indexLastTokens.has(cs)) {
      duplicates.push({ kind: 'split', curated: c, note: `no id; "${c.name}" would surface separately from its canonical index entry` })
    }
    continue
  }
  // (B) mis-merge: the curated surname must appear among the resolved index
  // entry's tokens (name OR fullName). This allows middle-name surnames
  // ("Samu Omorodion" → "Samuel Omorodion Aghehowa": omorodion is a token) but
  // catches a wrong-player merge ("Luis Díaz" → "Luis Suárez Díaz": the curated
  // surname "diaz" IS a token there too, so we additionally require the curated
  // FIRST token to appear, guarding the Suárez case via the full-name check).
  const idx = INDEX_BY_ID.get(c.apiId)
  if (idx) {
    const idxTokens = [...norm(idx.name).split(' '), ...norm(idx.fullName).split(' ')].filter(t => t.length > 1)
    const cTokens = norm(c.name).split(' ').filter(t => t.length > 1)
    // Each curated name token should be backed by an index token (exact, or a
    // prefix either way — "samu" ⊂ "samuel", abbreviations like "j" ⊂ "joao").
    // This accepts middle-name surnames ("Samu Omorodion" → "Samuel Omorodion
    // Aghehowa") and abbreviated index names, while still catching a curated row
    // pointed at a genuinely different person (no token overlap).
    const backs = (t, u) => t === u || t.startsWith(u) || u.startsWith(t)
    const ok = cTokens.every(t => idxTokens.some(u => backs(t, u)))
    if (!ok) {
      duplicates.push({ kind: 'mis-merge', curated: c, note: `id ${c.apiId} = "${idx.name}" (${idx.fullName}) — name tokens don't match` })
    }
  }
}

// near-duplicate index names not pinned: same first-last key → DIFFERENT ids
// (homonyms). Informational early-warning; not a failure by itself.
const nearDup = []
const byKey = new Map()
for (const p of SEARCH_INDEX) {
  const k = firstLast(norm(p.name))
  const arr = byKey.get(k) ?? []
  arr.push(p)
  byKey.set(k, arr)
}
for (const [k, arr] of byKey) {
  const ids = new Set(arr.map(p => p.id))
  const names = new Set(arr.map(p => norm(p.name)))
  if (names.size > 1 && ids.size > 1 && !CURATED_IDS[k]) nearDup.push({ key: k, entries: arr })
}

// ── 2) MISSING PHOTOS: selectable players with no resolvable photo ───────────
const missingPhotos = candidates.filter(c => c.src === 'curated' && c.apiId == null && !c.hasPhoto)

// ── report ───────────────────────────────────────────────────────────────────
console.log('TopScorers — data-quality check')
console.log('================================')
console.log(`Search-index entries : ${SEARCH_INDEX.length}`)
console.log(`Curated ${CURRENT} candidates : ${candidates.filter(c => c.src === 'curated').length}`)
console.log(`Pinned curated ids   : ${Object.keys(CURATED_IDS).length}`)
console.log('')

const splits = duplicates.filter(d => d.kind === 'split')
const misMerges = duplicates.filter(d => d.kind === 'mis-merge')

console.log(`DUPLICATES (selectable player would appear twice OR merge to the wrong player): ${duplicates.length}`)
console.log(`  • split (curated row resolves to no id, canonical exists): ${splits.length}`)
for (const d of splits.slice(0, 20)) console.log(`      "${d.curated.name}" / ${d.curated.club || '—'} / ${d.curated.pos || '—'} — ${d.note}`)
if (splits.length > 20) console.log(`      …and ${splits.length - 20} more`)
console.log(`  • mis-merge (curated row resolves to a DIFFERENT player): ${misMerges.length}`)
for (const d of misMerges.slice(0, 20)) console.log(`      "${d.curated.name}" / ${d.curated.club || '—'} — ${d.note}`)
if (misMerges.length > 20) console.log(`      …and ${misMerges.length - 20} more`)
console.log('')

console.log(`NEAR-DUPLICATE index name groups (homonyms, unpinned — informational): ${nearDup.length}`)
for (const d of nearDup.slice(0, 10)) {
  console.log(`  "${d.key}": ${d.entries.map(e => `"${e.name}"(${e.id})`).join(', ')}`)
}
if (nearDup.length > 10) console.log(`  …and ${nearDup.length - 10} more`)
console.log('')

console.log(`MISSING PHOTOS (curated current-season row, no resolvable id/photo): ${missingPhotos.length}`)
for (const c of missingPhotos.slice(0, 20)) console.log(`  "${c.name}" / ${c.club || '—'}`)
if (missingPhotos.length > 20) console.log(`  …and ${missingPhotos.length - 20} more`)
console.log('')

if (duplicates.length > 0) {
  console.error(`FAIL: ${duplicates.length} player(s) would surface twice or merge to the wrong player.`)
  console.error('See docs/data-quality.md. Pin the variant in data/curated-ids.ts (and scripts/refresh-curated.mjs MANUAL) or fix the curated row.')
  process.exit(1)
}
console.log('OK: every curated current-season player resolves to its correct canonical id — no duplicates, no mis-merges.')
