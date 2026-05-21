import type { EnrichedPlayer, SortKey } from '@/types'
import PlayerRow from './PlayerRow'

interface Props {
  players: EnrichedPlayer[]
  isAssist: boolean
  sort: SortKey
  dir: 1 | -1
  showElo: boolean
  showFantasy: boolean
  showPj?: boolean
  showRatios?: boolean
  showValSin?: boolean
  showValCoef?: boolean
  showMinG?: boolean
  watchlistKeys?: Set<string>
  onWatchlistToggle?: (name: string) => void
  onSort: (key: SortKey) => void
  onUnpin: (name: string) => void
}

function Th({ label, sortKey, currentSort, dir, onSort, align = 'left', width }: {
  label: string
  sortKey?: SortKey
  currentSort: SortKey
  dir: 1 | -1
  onSort: (k: SortKey) => void
  align?: 'left' | 'right'
  width?: number | string
}) {
  const active = sortKey === currentSort
  return (
    <th
      data-active={active ? "true" : undefined}
      className="py-2.5 px-3 whitespace-nowrap select-none transition-colors duration-150"
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        textAlign: align,
        color: active ? '#f0c040' : '#6868a0',
        cursor: sortKey ? 'pointer' : 'default',
        fontFamily: "'Barlow Condensed', sans-serif",
        ...(width ? { width } : {}),
      }}
      onClick={() => sortKey && onSort(sortKey)}
    >
      {label}
      {active && sortKey && (
        <span className="ml-1 text-[8px]">{dir === -1 ? '▼' : '▲'}</span>
      )}
    </th>
  )
}

export default function StatsTable({
  players, isAssist, sort, dir,
  showElo, showFantasy,
  showPj = true, showRatios = true, showValSin = true, showValCoef = true, showMinG = false,
  watchlistKeys, onWatchlistToggle,
  onSort, onUnpin,
}: Props) {
  const maxVal = Math.max(1, ...players.map(p => isAssist ? p.asist : p.goles))

  return (
    <div
      className="stats-table-wrap"
      style={{ overflowX: 'auto', overflowY: 'clip', background: 'rgba(7,14,26,.90)', border: '1px solid rgba(255,255,255,.07)', borderTop: 'none' }}
    >
      <table className="w-full border-collapse" style={{ minWidth: 680 }}>
        <thead>
          <tr
            style={{
              background: 'rgba(8,16,30,.97)',
              borderBottom: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <Th label="#"       align="right" width={44}  currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Jugador" width={210}               currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Liga"    currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Edad"    sortKey="age" currentSort={sort} dir={dir} onSort={onSort} align="right" />
            {showPj && <Th label="PJ" align="right" currentSort={sort} dir={dir} onSort={onSort} />}
            {isAssist ? (
              <>
                <Th label="Asist." align="right" sortKey="asist"   currentSort={sort} dir={dir} onSort={onSort} />
                <Th label="Goles"  align="right" sortKey="goles"   currentSort={sort} dir={dir} onSort={onSort} />
                {showRatios && <Th label="A/PJ" align="right" sortKey="ratio_a" currentSort={sort} dir={dir} onSort={onSort} />}
                {showRatios && <Th label="G/PJ" align="right" sortKey="ratio_g" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValSin && <Th label="G+A"  align="right" sortKey="val_sin" currentSort={sort} dir={dir} onSort={onSort} />}
              </>
            ) : (
              <>
                <Th label="Goles"  align="right" sortKey="goles"   currentSort={sort} dir={dir} onSort={onSort} />
                <Th label="Asist." align="right" sortKey="asist"   currentSort={sort} dir={dir} onSort={onSort} />
                {showRatios && <Th label="G/PJ"      align="right" sortKey="ratio_g" currentSort={sort} dir={dir} onSort={onSort} />}
                {showRatios && <Th label="A/PJ"      align="right" sortKey="ratio_a" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValSin  && <Th label="Val."      align="right" sortKey="val_sin" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValCoef && <Th label="Val.+"     align="right" sortKey="val_con" currentSort={sort} dir={dir} onSort={onSort} />}
              </>
            )}
            {showMinG    && <Th label="Min/G"  align="right"                         currentSort={sort} dir={dir} onSort={onSort} />}
            {showElo     && <Th label="ELO"    align="right" sortKey="elo"           currentSort={sort} dir={dir} onSort={onSort} />}
            {showFantasy && <Th label="Fant."  align="right" sortKey="fantasyPoints" currentSort={sort} dir={dir} onSort={onSort} />}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <PlayerRow
              key={`${p.name}-${p.season}`}
              player={p}
              rank={i + 1}
              isAssist={isAssist}
              maxVal={maxVal}
              showElo={showElo}
              showFantasy={showFantasy}
              showPj={showPj}
              showRatios={showRatios}
              showValSin={showValSin}
              showValCoef={showValCoef}
              showMinG={showMinG}
              watchlisted={watchlistKeys?.has(p.name)}
              onWatchlistToggle={onWatchlistToggle}
              onUnpin={p.isPinned ? onUnpin : undefined}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
