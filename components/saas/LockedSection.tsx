'use client'
import type { ReactNode, CSSProperties } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import type { Plan } from '@/types'
import LockedPill from './LockedPill'

interface LockedSectionProps {
  requiredPlan: 'pro' | 'scout'
  userPlan: Plan
  children: ReactNode
  label?: string
  style?: CSSProperties
}

// Order: free < pro < team < scout. team is treated as >= pro but < scout.
function planRank(plan: Plan): number {
  if (plan === 'scout') return 3
  if (plan === 'team') return 2
  if (plan === 'pro') return 1
  return 0
}

function requiredRank(req: 'pro' | 'scout'): number {
  return req === 'scout' ? 3 : 1
}

export default function LockedSection({
  requiredPlan,
  userPlan,
  children,
  label,
  style,
}: LockedSectionProps) {
  const { lang } = useLang()
  const unlocked = planRank(userPlan) >= requiredRank(requiredPlan)
  if (unlocked) return <>{children}</>

  const upgradeLabel =
    lang === 'en'
      ? `Upgrade to ${requiredPlan === 'scout' ? 'Scout' : 'Pro'}`
      : `Mejora a ${requiredPlan === 'scout' ? 'Scout' : 'Pro'}`

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          opacity: 0.45,
          filter: 'blur(2.5px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 2,
        }}
      >
        <LockedPill tone={requiredPlan} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 10,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Link
          href={`/${lang}/pricing`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: requiredPlan === 'scout' ? 'var(--ts-teal)' : 'var(--ts-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderRadius: 999,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          {label ?? upgradeLabel}
        </Link>
      </div>
    </div>
  )
}
