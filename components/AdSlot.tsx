'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'
import { ADSENSE_CLIENT } from '@/lib/adsense'
import { useLang } from '@/contexts/LangContext'

declare global {
  interface Window {
    adsbygoogle: unknown[] & { push: (obj: Record<string, unknown>) => void }
  }
}

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export default function AdSlot({ slot, format = 'auto', className }: Props) {
  const { user, isLoaded } = useUser()
  const { lang } = useLang()

  useEffect(() => {
    // No client id configured → ads dormant, nothing to push.
    if (!ADSENSE_CLIENT) return
    if (!isLoaded) return
    if (isPro(user?.publicMetadata as Record<string, unknown>)) return
    if (typeof window === 'undefined') return
    try {
      if (!window.adsbygoogle) window.adsbygoogle = [] as unknown as typeof window.adsbygoogle
      window.adsbygoogle.push({})
    } catch {
      // silently ignore duplicate push errors
    }
  }, [isLoaded, user])

  // Env-gated: when NEXT_PUBLIC_ADSENSE_CLIENT is unset, render nothing at all
  // (the loader script is also skipped in the layout). Fully dormant.
  if (!ADSENSE_CLIENT) return null

  // While Clerk is loading, render nothing to avoid layout shift
  if (!isLoaded) return null

  // Pro/Scout users never see ads
  if (isPro(user?.publicMetadata as Record<string, unknown>)) return null

  return (
    <div className={className}>
      <div
        style={{
          fontSize: 9,
          color: '#9a917e',
          textAlign: 'center',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed', sans-serif",
          marginBottom: 2,
        }}
      >
        {lang === 'en' ? 'Advertisement' : 'Publicidad'}
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
