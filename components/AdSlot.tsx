'use client'

import { useEffect, useRef } from 'react'
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
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    // No client id configured → ads dormant, nothing to push.
    if (!ADSENSE_CLIENT) return
    if (!isLoaded) return
    if (isPro(user?.publicMetadata as Record<string, unknown>)) return
    if (typeof window === 'undefined') return
    const el = insRef.current
    if (!el) return

    // AdSense throws "TagError: No slot size for availableWidth=0" — thrown
    // ASYNC inside its own setTimeout, so a try/catch around push() can't catch
    // it — whenever push() runs while the slot has 0 width (mounted inside a
    // not-yet-laid-out tab/column). Guard: only push once the slot has a
    // measurable width; if it's 0 at mount, wait for layout via ResizeObserver.
    const tryPush = () => {
      if (pushed.current) return true
      if (el.offsetWidth === 0) return false
      pushed.current = true
      try {
        if (!window.adsbygoogle) window.adsbygoogle = [] as unknown as typeof window.adsbygoogle
        window.adsbygoogle.push({})
      } catch {
        // silently ignore duplicate push errors
      }
      return true
    }

    if (tryPush()) return
    const ro = new ResizeObserver(() => { if (tryPush()) ro.disconnect() })
    ro.observe(el)
    return () => ro.disconnect()
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
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
