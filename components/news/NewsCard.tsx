'use client'
// NewsCard — license-aware visual card for news + rumours.
//
// WHY a license model: adding images to syndicated news is a rights minefield.
// Every image a card renders carries an explicit `license`, and the component
// REFUSES to silently show anything it cannot justify. Concretely:
//   • own / cc0  → always publishable (our graphics / public-domain-equivalent).
//   • ccby       → publishable ONLY with an author credit (CC BY requires it).
//   • agency     → licensed via our API (api-sports headshots). Allowed within
//                  API terms; no public credit shown, requires a `source`.
//   • embed      → we DON'T host the image. Headline + source + link-back only
//                  (clean RSS syndication). The visual must come from a CC0
//                  generic or an api-sports headshot — never the feed's own
//                  photo. Requires a `source`.
//
// GUARDRAIL (do not remove): a `ccby` with no `author`, or an `agency`/`embed`
// with no `source`, is NON-PUBLISHABLE → the card renders a warn state instead
// of the image. This is what stops a rights infringement from ever shipping.
//
// All strings go through the repo i18n (`t(key, lang)`); brand `--ts-*` tokens
// only; LIGHT default; SVG not emoji; 44px touch targets. Author: Furiosa Studio.

import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'
import { initialsOf, avatarTintFor } from '@/lib/palette'

export type License = 'own' | 'cc0' | 'ccby' | 'agency' | 'embed'

export interface LicenseMeta {
  /** i18n key for the short human label. */
  labelKey: 'news_lic_own' | 'news_lic_cc0' | 'news_lic_ccby' | 'news_lic_agency' | 'news_lic_embed'
  /** Does this license require an `author` to be publishable? */
  needsAuthor: boolean
  /** Does this license require a `source` to be publishable? */
  needsSource: boolean
  /** Do we show a public credit line for it? (agency = licensed, no public credit) */
  showCredit: boolean
}

export const LICENSES: Record<License, LicenseMeta> = {
  own:    { labelKey: 'news_lic_own',    needsAuthor: false, needsSource: false, showCredit: false },
  cc0:    { labelKey: 'news_lic_cc0',    needsAuthor: false, needsSource: false, showCredit: false },
  ccby:   { labelKey: 'news_lic_ccby',   needsAuthor: true,  needsSource: false, showCredit: true  },
  agency: { labelKey: 'news_lic_agency', needsAuthor: false, needsSource: true,  showCredit: false },
  embed:  { labelKey: 'news_lic_embed',  needsAuthor: false, needsSource: true,  showCredit: true  },
}

export interface NewsCardImage {
  /** Image URL. Omit to render the initials placeholder. */
  url?: string
  license: License
  /** Author/photographer — REQUIRED for `ccby`. */
  author?: string
  /** Source outlet — REQUIRED for `agency`/`embed`. */
  source?: string
  /** Where the credit/source links. */
  sourceUrl?: string
  alt?: string
}

export interface NewsCardProps {
  title: string
  /** Outbound link (the original article / rumour detail). */
  href: string
  /** Open in a new tab (external news) vs internal navigation. */
  external?: boolean
  image: NewsCardImage
  /** Source outlet shown in the meta line. */
  source?: string
  sourceUrl?: string
  /** ISO date or pre-formatted time string for the meta line. */
  meta?: string
  /** Team/club or fallback subject — drives the initials placeholder. */
  team?: string
  lang: Lang
  /** full = image + headline + meta; compact = small thumb + line + badge. */
  variant?: 'full' | 'compact'
  /** Optional eyebrow (e.g. "★ Top story"). */
  eyebrow?: string
  /** Slot rendered before the meta line (e.g. a LangBadge). */
  metaPrefix?: React.ReactNode
}

/** A ccby image must carry an author; agency/embed must carry a source. */
export function isCreditMissing(image: NewsCardImage): boolean {
  const meta = LICENSES[image.license]
  if (meta.needsAuthor && !image.author?.trim()) return true
  if (meta.needsSource && !image.source?.trim()) return true
  return false
}

/** Build the public credit line, or null when the license shows none. */
export function buildCredit(image: NewsCardImage, lang: Lang): string | null {
  const meta = LICENSES[image.license]
  if (!meta.showCredit) return null
  if (image.license === 'embed') {
    // We don't host the image — credit is a "Via {source}" link-back only.
    return image.source ? `${t('news_via', lang)} ${image.source}` : null
  }
  // ccby: "Photo: {author}" (graphic vs photo by license).
  const verb = t('news_photo_credit', lang)
  const author = image.author?.trim() || t('news_author_unknown', lang)
  return `${verb}: ${author}`
}

// Initials placeholder — never a broken <img>. Tinted circle/box with initials
// derived from team or title. Brand tints, theme-aware via palette helper.
function InitialsPlaceholder({ subject, radius, compact }: { subject: string; radius: number; compact: boolean }) {
  // avatarTintFor needs a PaletteMode; CSS handles theme, so pick by name only.
  const tint = avatarTintFor(subject || 'TS', 'light')
  const initials = initialsOf(subject || 'TS') || 'TS'
  return (
    <div aria-hidden style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: radius,
      background: 'linear-gradient(135deg, var(--ts-primary-soft) 0%, var(--ts-card2) 60%, color-mix(in srgb, var(--ts-teal) 14%, var(--ts-card2)) 100%)',
      color: tint.fg, fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 800, letterSpacing: '0.02em', fontSize: compact ? 16 : 30,
    }}>
      {initials}
    </div>
  )
}

// Image area: renders the licensed image (plain lazy <img> — see note below),
// falling back to the initials placeholder on missing URL or load error. If the
// image fails the credit guardrail, it never shows the image at all.
//
// next/image vs plain <img>: we use a plain `<img loading="lazy">`. The two
// remote hosts (media.api-sports.io headshots) plus self-hosted SVGs don't
// benefit much from Vercel's Image Optimization, and routing them through it
// would incur image-transform usage on the Vercel free tier. Plain lazy <img>
// is free, already the repo convention (Avatar, NewsPlaceholder), and fine for
// thumbnails. Self-hosted SVGs are tiny; headshots are CDN-cached upstream.
function ImageArea({
  image, subject, radius, fill, w, h, lang, compact,
}: {
  image: NewsCardImage; subject: string; radius: number; fill: boolean
  w: number; h: number; lang: Lang; compact: boolean
}) {
  const [broken, setBroken] = useState(false)
  const guardFail = isCreditMissing(image)
  const showImg = !!image.url && !broken && !guardFail
  const box: React.CSSProperties = {
    width: fill ? '100%' : w, height: h, flexShrink: 0, borderRadius: radius,
    overflow: 'hidden', background: 'var(--ts-card2)', position: 'relative',
  }
  return (
    <div style={box}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.url} alt={image.alt ?? ''} loading="lazy" onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <InitialsPlaceholder subject={subject} radius={radius} compact={compact} />
      )}
      {/* Guardrail visible warning (dev/editorial signal; harmless in prod since
          we never pass a non-publishable image, but kept as the safety net). */}
      {guardFail && (
        <span style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, padding: '3px 6px',
          fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
          background: 'var(--ts-red)', color: '#fff',
        }}>
          {t('news_credit_missing', lang)}
        </span>
      )}
    </div>
  )
}

export default function NewsCard(props: NewsCardProps) {
  const {
    title, href, external, image, source, meta, team, lang,
    variant = 'full', eyebrow, metaPrefix,
  } = props
  const subject = team || title
  const credit = buildCredit(image, lang)
  const linkProps = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' as const }
    : { href }

  const metaLine = (
    <span style={{ fontSize: 11, color: 'var(--ts-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
      {metaPrefix}
      {source && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{source}</span>}
      {source && meta && <span aria-hidden> · </span>}
      {meta && <span style={{ whiteSpace: 'nowrap' }}>{meta}</span>}
    </span>
  )

  if (variant === 'compact') {
    return (
      <a {...linkProps} style={{
        display: 'flex', gap: 10, padding: 8, minHeight: 44, alignItems: 'center',
        background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
        textDecoration: 'none', color: 'inherit', minWidth: 0,
      }}>
        <ImageArea image={image} subject={subject} radius={8} fill={false} w={48} h={48} lang={lang} compact />
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{title}</span>
          {metaLine}
        </span>
      </a>
    )
  }

  // full
  return (
    <a {...linkProps} style={{
      display: 'flex', gap: 12, padding: 10,
      background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
      textDecoration: 'none', color: 'inherit', minWidth: 0,
    }}>
      <ImageArea image={image} subject={subject} radius={6} fill={false} w={88} h={68} lang={lang} compact={false} />
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
        {eyebrow && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>{eyebrow}</span>
        )}
        <span style={{
          fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</span>
        {metaLine}
        {/* Credit rendered as plain text: the whole card is already an anchor to
            the source, so a nested <a> would be invalid HTML. The link-back is
            the card itself (rel set on the card for external links). */}
        {credit && (
          <span style={{ fontSize: 9.5, color: 'var(--ts-faint)' }}>{credit}</span>
        )}
      </span>
    </a>
  )
}
