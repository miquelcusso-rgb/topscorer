'use client'

interface Props {
  saved: boolean
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
}

export default function WatchlistButton({ saved, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={saved ? 'Quitar de watchlist' : 'Añadir a watchlist'}
      className="shrink-0 flex items-center justify-center w-5 h-5 rounded-sm transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
      style={{
        background: 'none',
        border: 'none',
        color: saved ? '#f0c040' : '#36364e',
        fontSize: 13,
        lineHeight: 1,
      }}
      onMouseEnter={e => { if (!saved) e.currentTarget.style.color = 'rgba(240,192,64,.5)' }}
      onMouseLeave={e => { if (!saved) e.currentTarget.style.color = '#36364e' }}
    >
      {saved ? '★' : '☆'}
    </button>
  )
}
