'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { clubColor } from '@/lib/club-colors'
import type { Plan } from '@/types'

// Shared PRO "my club" accent: the colour of the club saved in localStorage
// ('ts-club'), but only for Pro/Scout/Team plans. Used by both the sidebar and
// the topbar so they tint together, and it updates live — pickClub dispatches a
// 'ts-club-change' event (and cross-tab 'storage' events also re-read).
export function useClubAccent(): string | undefined {
  const { user, isLoaded } = useUser()
  const plan: Plan = (isLoaded && user ? ((user.publicMetadata?.plan as Plan) || 'free') : 'free')
  const isPro = plan === 'pro' || plan === 'scout' || plan === 'team'
  const [club, setClub] = useState('')
  useEffect(() => {
    const read = () => { try { setClub(localStorage.getItem('ts-club') ?? '') } catch {} }
    read()
    window.addEventListener('ts-club-change', read)
    window.addEventListener('storage', read)
    return () => { window.removeEventListener('ts-club-change', read); window.removeEventListener('storage', read) }
  }, [])
  return isPro ? clubColor(club) : undefined
}

/** Fire after writing localStorage 'ts-club' so the sidebar + topbar re-tint now. */
export function notifyClubChange() {
  try { window.dispatchEvent(new Event('ts-club-change')) } catch { /* SSR */ }
}
