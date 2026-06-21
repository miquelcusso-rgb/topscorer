// ─── AdSense client id resolution (env-gated) ─────────────────────────────────
// Single source of truth for the AdSense publisher id used by both the loader
// script (app/[lang]/layout.tsx) and every ad unit (components/AdSlot.tsx).
//
// The id comes from the public env var NEXT_PUBLIC_ADSENSE_CLIENT (the value that
// goes into `data-ad-client`, e.g. "ca-pub-XXXXXXXXXXXXXXXX"). When it is unset,
// `ADSENSE_CLIENT` is undefined → the loader renders no <script> and AdSlot
// renders nothing, so ads stay fully dormant until the var is set in Vercel.
//
// NOTE: the site already shipped with a hardcoded publisher id. To avoid turning
// off live, already-approved ad units the moment this gate lands, that id is kept
// as the build-time default. Set NEXT_PUBLIC_ADSENSE_CLIENT in Vercel to take
// authoritative control (and unset it / set it empty to go fully dormant).
const FALLBACK_CLIENT = 'ca-pub-6498215334315959'

const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

/**
 * Resolved AdSense client id, or undefined when ads should be fully dormant.
 * `undefined` ⇒ load no script and render no ad slots.
 */
export const ADSENSE_CLIENT: string | undefined =
  raw && raw.trim() ? raw.trim() : FALLBACK_CLIENT || undefined

/** True when an AdSense client id is configured and ads may render. */
export const ADS_ENABLED = Boolean(ADSENSE_CLIENT)
