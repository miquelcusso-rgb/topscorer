// Tiny badge that signals a feature is gated behind PRO or SCOUT.
// (audit pass 1: replaces the previous mix of inline ad-hoc badges.)

interface LockedPillProps {
  tone?: 'pro' | 'scout'
  size?: 'sm' | 'xs'
}

const LABEL: Record<NonNullable<LockedPillProps['tone']>, string> = {
  pro: 'PRO',
  scout: 'SCOUT',
}

export default function LockedPill({ tone = 'pro', size = 'sm' }: LockedPillProps) {
  const isScout = tone === 'scout'
  const bg = isScout ? 'var(--ts-teal-soft)' : 'var(--ts-primary-soft)'
  const fg = isScout ? 'var(--ts-teal)' : 'var(--ts-primary)'
  const padding = size === 'xs' ? '1px 5px' : '2px 7px'
  const fontSize = size === 'xs' ? 9 : 10
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding,
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.08em',
        borderRadius: 999,
        textTransform: 'uppercase',
        lineHeight: 1.1,
        verticalAlign: 'middle',
      }}
      aria-label={isScout ? 'Scout plan feature' : 'Pro plan feature'}
    >
      <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V6z"/>
      </svg>
      {LABEL[tone]}
    </span>
  )
}
