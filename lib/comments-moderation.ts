/**
 * Lightweight moderation for user-posted comments.
 *  - Strips obvious slurs / spam markers (ES + EN).
 *  - Caps repeated chars (aaaaaa -> aaa).
 *  - Limits URL count to 1.
 *  - Bans known spammy URL hosts.
 *
 * This is a first line of defence; DB-side rate limiting (30s) and the
 * 3-reports-auto-hide policy live in SQL functions.
 */

// Conservative starter list. Easy to extend; keep lowercase ascii-folded.
const BANNED_WORDS = [
  // Severe slurs (es/en) — left intentionally short; widen with real data later
  'maricon', 'maricón', 'puto', 'puta', 'cabron', 'cabrón',
  'nigger', 'faggot', 'retard', 'kys',
  // Spam markers
  'free crypto', 'buy followers', 'onlyfans', 'telegram channel',
]

const BANNED_HOSTS = new Set([
  'bit.ly', 'tinyurl.com', 'shorturl.at', 't.co', 'goo.gl', 'discord.gg',
])

const URL_RE = /(https?:\/\/[^\s]+)/gi

export interface ModerationResult {
  ok: boolean
  cleaned: string
  reason?: string
}

function asciiFold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function moderateComment(raw: string): ModerationResult {
  const trimmed = raw.trim()
  if (trimmed.length < 1) return { ok: false, cleaned: '', reason: 'empty' }
  if (trimmed.length > 800) return { ok: false, cleaned: trimmed.slice(0, 800), reason: 'too_long' }

  // URL policy: max 1, and not on the banned-hosts list
  const urls = trimmed.match(URL_RE) ?? []
  if (urls.length > 1) return { ok: false, cleaned: trimmed, reason: 'too_many_links' }
  for (const u of urls) {
    try {
      const host = new URL(u).hostname.replace(/^www\./, '').toLowerCase()
      if (BANNED_HOSTS.has(host)) return { ok: false, cleaned: trimmed, reason: 'blocked_host' }
    } catch { /* malformed URL — fall through */ }
  }

  // Slur / spam check on ascii-folded lowercase
  const folded = asciiFold(trimmed)
  for (const w of BANNED_WORDS) {
    if (folded.includes(w)) return { ok: false, cleaned: trimmed, reason: 'banned_word' }
  }

  // Repeated-char cap: replace 4+ same chars with 3 (no more "aaaaaaaa")
  const cleaned = trimmed.replace(/(.)\1{3,}/g, '$1$1$1')
  return { ok: true, cleaned }
}
