// Design tokens — SaaS redesign (handoff 2026-05-30).
// Two palettes: light + dark. Exposed as CSS custom properties via
// `palette-css.tsx` so components can use `var(--ts-primary)` without
// recomputing inline styles on every render.

export type PaletteMode = 'light' | 'dark'

export interface Palette {
  bg: string
  surface: string
  sidebar: string
  card: string
  card2: string
  border: string
  borderHot: string
  divider: string
  hairline: string
  text: string
  muted: string
  faint: string
  primary: string
  primaryHot: string
  primarySoft: string
  teal: string
  tealHot: string
  tealSoft: string
  red: string
}

export const LIGHT: Palette = {
  bg:          '#f8f7f3',
  surface:     '#ffffff',
  sidebar:     '#f4f1e8',
  card:        '#ffffff',
  card2:       '#faf8f2',
  border:      'rgba(24,18,4,.09)',
  borderHot:   'rgba(24,18,4,.16)',
  divider:     'rgba(24,18,4,.08)',
  hairline:    'rgba(24,18,4,.05)',
  text:        '#1c1608',
  muted:       'rgba(28,22,8,.62)',
  faint:       'rgba(28,22,8,.36)',
  primary:     '#a8761a',
  primaryHot:  '#c48a20',
  primarySoft: '#f6ecd2',
  teal:        '#0a6e5f',
  tealHot:     '#0d8472',
  tealSoft:    '#d4ece6',
  red:         '#a4361c',
}

export const DARK: Palette = {
  bg:          '#0a0908',
  surface:     '#0f0e0c',
  sidebar:     '#070605',
  card:        '#15130f',
  card2:       '#1c1a16',
  border:      'rgba(240,200,90,.08)',
  borderHot:   'rgba(240,200,90,.18)',
  divider:     'rgba(240,200,90,.08)',
  hairline:    'rgba(240,200,90,.05)',
  text:        '#f1e8d2',
  muted:       'rgba(241,232,210,.6)',
  faint:       'rgba(241,232,210,.34)',
  primary:     '#f0c040',
  primaryHot:  '#ffd460',
  primarySoft: 'rgba(240,192,64,.14)',
  teal:        '#3ed6c2',
  tealHot:     '#5ee2d2',
  tealSoft:    'rgba(62,214,194,.16)',
  red:         '#e85a47',
}

export function getPalette(mode: PaletteMode): Palette {
  return mode === 'dark' ? DARK : LIGHT
}

// 6-variant avatar tints — choose deterministically by name hash.
export const AVATAR_TINTS_LIGHT: Array<{ bg: string; fg: string }> = [
  { bg: '#f6ecd2', fg: '#a8761a' },
  { bg: '#d4ece6', fg: '#0a6e5f' },
  { bg: '#fce6c8', fg: '#8a5a14' },
  { bg: '#cce4dc', fg: '#08584c' },
  { bg: '#fadcc0', fg: '#9a6818' },
  { bg: '#e0f0ea', fg: '#0c7e6e' },
]

export const AVATAR_TINTS_DARK: Array<{ bg: string; fg: string }> = [
  { bg: 'rgba(240,192,64,.16)', fg: '#f0c040' },
  { bg: 'rgba(62,214,194,.18)', fg: '#3ed6c2' },
  { bg: 'rgba(240,192,64,.10)', fg: '#ffd460' },
  { bg: 'rgba(62,214,194,.10)', fg: '#5ee2d2' },
  { bg: 'rgba(240,192,64,.22)', fg: '#f0c040' },
  { bg: 'rgba(62,214,194,.24)', fg: '#3ed6c2' },
]

export function avatarTintFor(name: string, mode: PaletteMode): { bg: string; fg: string } {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  const pool = mode === 'dark' ? AVATAR_TINTS_DARK : AVATAR_TINTS_LIGHT
  return pool[Math.abs(h) % pool.length]
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('')
}

// CSS variables map — fed to a <style> tag at the app root.
export function cssVars(palette: Palette): Record<string, string> {
  return {
    '--ts-bg':           palette.bg,
    '--ts-surface':      palette.surface,
    '--ts-sidebar':      palette.sidebar,
    '--ts-card':         palette.card,
    '--ts-card2':        palette.card2,
    '--ts-border':       palette.border,
    '--ts-border-hot':   palette.borderHot,
    '--ts-divider':      palette.divider,
    '--ts-hairline':     palette.hairline,
    '--ts-text':         palette.text,
    '--ts-muted':        palette.muted,
    '--ts-faint':        palette.faint,
    '--ts-primary':      palette.primary,
    '--ts-primary-hot':  palette.primaryHot,
    '--ts-primary-soft': palette.primarySoft,
    '--ts-teal':         palette.teal,
    '--ts-teal-hot':     palette.tealHot,
    '--ts-teal-soft':    palette.tealSoft,
    '--ts-red':          palette.red,
  }
}
