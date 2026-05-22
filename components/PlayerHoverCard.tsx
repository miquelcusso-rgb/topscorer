import type { EnrichedPlayer } from '@/types'

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  injured:     { label: 'Lesionado',         color: '#e05a30', bg: 'rgba(224,90,48,.12)',  border: 'rgba(224,90,48,.25)' },
  loan:        { label: 'Cedido',             color: '#00c8b0', bg: 'rgba(0,200,176,.1)',  border: 'rgba(0,200,176,.22)' },
  questionable:{ label: 'Dudoso',             color: '#f0c040', bg: 'rgba(240,192,64,.1)',  border: 'rgba(240,192,64,.22)' },
  transfer:    { label: 'Fichaje verano',     color: '#38c47a', bg: 'rgba(56,196,122,.1)',  border: 'rgba(56,196,122,.22)' },
}

const POS_COLOR: Record<string, string> = {
  FW: '#f0c040', MF: '#00c8b0', DF: '#38c47a', GK: '#a060ff',
}

interface Props {
  player: EnrichedPlayer
  showElo: boolean
  showFantasy: boolean
  open?: boolean
}

export default function PlayerHoverCard({ player, showElo, showFantasy, open }: Props) {
  const status = player.status ? STATUS_LABEL[player.status] : null
  const posColor = player.position ? POS_COLOR[player.position] : '#5a5a7a'
  const isAssistTab = player.tab === 'a'
  const initials = player.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div
      className={`hover-card absolute left-full top-1/2 z-[200] ml-3 w-72${open ? ' open' : ''}`}
      style={{ transform: 'translateY(-50%)' }}
    >
      {/* Arrow */}
      <div
        className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-0 h-0"
        style={{
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: '5px solid #1a1b2e',
        }}
      />

      <div
        className="rounded-sm shadow-2xl overflow-hidden"
        style={{ background: '#0a0b14', border: '1px solid #1a1b2e' }}
      >
        {/* Header */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #1a1b2e', background: '#10111e' }}>
          <div className="flex items-start justify-between gap-2">
            {/* Avatar (photo when available, initials fallback) */}
            <div
              className="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                width: 44, height: 44,
                background: `${posColor}1a`,
                border: `1.5px solid ${posColor}55`,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 17, color: posColor, letterSpacing: '0.5px',
              }}
            >
              {player.photo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={player.photo} alt={player.name} width={44} height={44} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {player.flag && <span className="text-base leading-none">{player.flag}</span>}
                {player.position && (
                  <span
                    className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm"
                    style={{ color: posColor, background: `${posColor}18`, border: `1px solid ${posColor}35` }}
                  >
                    {player.position}
                  </span>
                )}
              </div>
              <div className="font-bebas text-xl leading-tight tracking-wide" style={{ color: '#e5e5f2', fontFamily: "'Bebas Neue', cursive" }}>
                {player.name}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: '#5a5a7a' }}>
                {player.club}
                {player.prevClub && (
                  <span style={{ color: '#38c47a' }}> · ex {player.prevClub}</span>
                )}
              </div>
            </div>
            {player.nationality && (
              <div className="text-right shrink-0">
                <div className="text-[10px] font-semibold" style={{ color: '#5a5a7a' }}>
                  {player.nationality}
                </div>
                <div className="text-[11px]" style={{ color: '#5a5a7a' }}>
                  {player.age} años
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        {status && (
          <div className="px-4 py-2" style={{ borderBottom: '1px solid #1a1b2e', background: `${status.bg}` }}>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-sm"
                style={{ color: status.color, border: `1px solid ${status.border}` }}
              >
                {status.label.toUpperCase()}
              </span>
              {player.statusDetail && (
                <span className="text-[10.5px]" style={{ color: status.color, opacity: 0.85 }}>
                  {player.statusDetail}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contract / Value */}
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #1a1b2e' }}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {player.marketValue && (
              <div>
                <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#5a5a7a' }}>Valor</div>
                <div className="text-[13px] font-semibold" style={{ color: '#e5e5f2' }}>{player.marketValue}</div>
              </div>
            )}
            {player.contractUntil && (
              <div>
                <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#5a5a7a' }}>Contrato</div>
                <div className="text-[13px] font-semibold" style={{ color: '#e5e5f2' }}>hasta {player.contractUntil}</div>
              </div>
            )}
            {player.releaseClause !== undefined && (
              <div className="col-span-2">
                <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#5a5a7a' }}>Cláusula</div>
                <div className="text-[13px] font-semibold" style={{ color: player.releaseClause ? '#f0c040' : '#36364e' }}>
                  {player.releaseClause ?? '—'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Season stats mini */}
        <div className="px-4 py-2.5" style={{ borderBottom: (showElo || showFantasy) ? '1px solid #1a1b2e' : 'none' }}>
          <div className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{ color: '#5a5a7a' }}>
            Temporada · {player.pj} PJ
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="font-bebas text-2xl leading-none" style={{ color: '#f0c040', fontFamily: "'Bebas Neue', cursive" }}>
                {player.goles}
              </div>
              <div className="text-[9px]" style={{ color: '#5a5a7a' }}>Goles</div>
            </div>
            <div className="text-center">
              <div className="font-bebas text-2xl leading-none" style={{ color: '#00c8b0', fontFamily: "'Bebas Neue', cursive" }}>
                {player.asist}
              </div>
              <div className="text-[9px]" style={{ color: '#5a5a7a' }}>Asist.</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold" style={{ color: '#f0c040' }}>
                {player.ratio_g.toFixed(2)}
              </div>
              <div className="text-[9px]" style={{ color: '#5a5a7a' }}>G/PJ</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold" style={{ color: '#00c8b0' }}>
                {player.ratio_a.toFixed(2)}
              </div>
              <div className="text-[9px]" style={{ color: '#5a5a7a' }}>A/PJ</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold" style={{ color: '#e05a30' }}>
                {isAssistTab ? player.goles + player.asist : player.val_con}
              </div>
              <div className="text-[9px]" style={{ color: '#5a5a7a' }}>
                {isAssistTab ? 'G+A' : 'Val.'}
              </div>
            </div>
          </div>
        </div>

        {/* ELO + Fantasy */}
        {(showElo || showFantasy) && (
          <div className="px-4 py-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {showElo && player.elo != null && (
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#5a5a7a' }}>ELO Rating</div>
                  <div
                    className="text-[15px] font-bold"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: '1px',
                      color: player.elo >= 2100 ? '#f0c040' : player.elo >= 1900 ? '#38c47a' : '#00c8b0',
                    }}
                  >
                    {player.elo}
                  </div>
                </div>
              )}
              {showFantasy && player.fantasyPoints != null && (
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#5a5a7a' }}>Fantasy</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '1px', color: '#a060ff' }}>
                      {player.fantasyPoints} pts
                    </span>
                    {player.fantasyPrice != null && (
                      <span className="text-[10px] font-semibold" style={{ color: '#5a5a7a' }}>
                        €{player.fantasyPrice}M
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
