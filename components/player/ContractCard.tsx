interface ContractCardProps {
  title?: string
  badge?: string
  rows: Array<[string, string]>
}

export default function ContractCard({
  title = 'Contrato',
  badge = 'ACTIVO',
  rows,
}: ContractCardProps) {
  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
          {title}
        </h3>
        <span
          style={{
            padding: '2px 8px',
            background: 'var(--ts-teal-soft)',
            color: 'var(--ts-teal)',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          {badge}
        </span>
      </div>
      <div style={{ fontSize: 13 }}>
        {rows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '7px 0',
              borderBottom: '1px solid var(--ts-hairline)',
            }}
          >
            <span style={{ color: 'var(--ts-muted)', fontSize: 13 }}>{k}</span>
            <span style={{ color: 'var(--ts-text)', fontWeight: 500, textAlign: 'right' }}>
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
