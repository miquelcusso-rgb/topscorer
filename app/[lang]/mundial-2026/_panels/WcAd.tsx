'use client'

import { useUser } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'
import AdSlot from '@/components/AdSlot'

// ─── World Cup ad placement (CLS-safe wrapper around the shared AdSlot) ────────
// Reuses the exact AdSlot pattern used across the rest of the site (jugadores /
// resultados / descubrir): same publisher, same `adsbygoogle.push()` flow, and
// the same Pro/Scout gating (those users never see ads). We mirror that gating
// here too so Pro users don't even get an empty reserved gap — AdSlot returns
// null for them, and so does this wrapper.
//
// CLS: the outer wrapper reserves `minHeight` up front so the ad expanding in
// place never pushes the surrounding content (mobile-first, between sections).

interface Props {
  /** AdSense ad-unit slot id. Reuse an existing unit by default. */
  slot?: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  /** Reserved height (px) to avoid layout shift while the ad loads. */
  minHeight?: number
}

export default function WcAd({ slot = '5544332211', format = 'horizontal', minHeight = 100 }: Props) {
  const { user, isLoaded } = useUser()

  // Pro/Scout users never see ads — and get no reserved gap either.
  if (isLoaded && isPro(user?.publicMetadata as Record<string, unknown>)) return null

  return (
    <div
      style={{
        minHeight,
        margin: '8px auto',
        width: '100%',
        maxWidth: 728,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <AdSlot slot={slot} format={format} />
    </div>
  )
}
