'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'

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

  useEffect(() => {
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
        Publicidad
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6498215334315959"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
