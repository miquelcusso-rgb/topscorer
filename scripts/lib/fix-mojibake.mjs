/**
 * fix-mojibake.mjs — repair UTF-8-as-Latin1 double-encoding in player/club names.
 *
 * Some upstream feeds (and one historical generation run) produced names where
 * UTF-8 bytes were decoded as Latin-1 and re-stored — e.g. "Højlund" became
 * "HÃ¸jlund", "Çakıroğlu" became "ÃakıroÄlu". This self-healing helper repairs
 * those sequences while leaving genuinely-correct names (Åke, Sørloth, Müller,
 * Portuguese Ângelo) untouched. Wire it into any name read from a feed.
 */

// A char that LEADS a misdecoded UTF-8 multibyte sequence when shown as Latin-1/CP1252,
// immediately followed by a continuation-range char.
const SUSPECT = /[ÃÂÅÄâ€][-ſ–—‘’“” -ÿ]/

function roundtrip(word) {
  // Rebuild the original byte stream: chars <256 -> that byte (Latin-1), genuine
  // non-Latin1 chars that survived (ı, ł…) -> their real UTF-8 bytes, so a
  // surrounding mojibake run still decodes.
  const bytes = []
  for (const ch of word) {
    const o = ch.codePointAt(0)
    if (o < 256) bytes.push(o)
    else for (const b of Buffer.from(ch, 'utf8')) bytes.push(b)
  }
  try {
    const decoded = Buffer.from(bytes).toString('utf8')
    // Reject if the decode introduced the replacement char (invalid byte run).
    if (decoded.includes('�')) return null
    return decoded
  } catch {
    return null
  }
}

function fixWord(w) {
  const fixed = roundtrip(w)
  if (fixed == null) return w
  const before = (w.match(new RegExp(SUSPECT, 'g')) || []).length
  const after = (fixed.match(new RegExp(SUSPECT, 'g')) || []).length
  // Mojibake is always longer than its repair; accept only a strict improvement.
  if (after < before && fixed.length <= w.length) return fixed
  return w
}

export function fixMojibake(s) {
  if (s == null) return s
  if (!SUSPECT.test(s)) return s
  // Split on ASCII whitespace only (NOT \s — U+0085 NEL is a UTF-8 continuation byte).
  return s.split(/([ \t\r\n]+)/).map(tok => (SUSPECT.test(tok) ? fixWord(tok) : tok)).join('')
}
