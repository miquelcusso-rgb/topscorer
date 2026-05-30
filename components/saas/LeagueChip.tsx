interface LeagueChipProps {
  code: string
}

export default function LeagueChip({ code }: LeagueChipProps) {
  return (
    <span
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '0.08em',
        padding: '2px 6px',
        background: 'var(--ts-card2)',
        color: 'var(--ts-muted)',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
      }}
    >
      {code}
    </span>
  )
}
