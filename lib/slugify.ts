// Special letters NFD doesn't decompose — map them so e.g. "Sørloth" → "sorloth"
// (not "srloth"), "Højlund" → "hojlund". Link + profile + search index all call
// this, so slugs stay consistent end-to-end.
const SPECIAL: Record<string, string> = { 'ø': 'o', 'œ': 'oe', 'æ': 'ae', 'å': 'a', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i', 'ħ': 'h' }

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øœæåßłđðþıħ]/g, c => SPECIAL[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
