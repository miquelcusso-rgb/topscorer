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
  watchlistKeys?: Set<string>
  onWatchlistToggle?: (name: string) => void
  onSort: (key: SortKey) => void
  onUnpin: (name: string) => void
}

function Th({ label, sortKey, currentSort, dir, onSort }: {
  label: string
  sortKey?: SortKey
  currentSort: SortKey
  dir: 1 | -1
  onSort: (k: SortKey) => void
}) {
  const active = sortKey === currentSort
  return (
    <th
      className="py-2.5 px-3 text-left whitespace-nowrap select-none"
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: active ? '#f0c040' : '#5a5a7a',
        cursor: sortKey ? 'pointer' : 'default',
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
  showPj = true, showRatios = true, showValSin = true, showValCoef = true,
  watchlistKeys, onWatchlistToggle,
  onSort, onUnpin,
}: Props) {
  const maxVal = Math.max(1, ...players.map(p => isAssist ? p.asist : p.goles))

  return (
    <div
      className="overflow-x-auto"
      style={{ background: '#0e0e1c', border: '1px solid #1e1e34', borderTop: 'none' }}
    >
      <table className="w-full border-collapse" style={{ minWidth: 680 }}>
        <thead>
          <tr style={{ background: '#151528', borderBottom: '2px solid #f0c040' }}>
            <Th label="#"       currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Jugador" currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Liga"    currentSort={sort} dir={dir} onSort={onSort} />
            <Th label="Edad"    sortKey="age" currentSort={sort} dir={dir} onSort={onSort} />
            {showPj && <Th label="PJ" currentSort={sort} dir={dir} onSort={onSort} />}
            {isAssist ? (
              <>
                <Th label="Asist." sortKey="asist"   currentSort={sort} dir={dir} onSort={onSort} />
                <Th label="Goles"  sortKey="goles"   currentSort={sort} dir={dir} onSort={onSort} />
                {showRatios && <Th label="A/PJ" sortKey="ratio_a" currentSort={sort} dir={dir} onSort={onSort} />}
                {showRatios && <Th label="G/PJ" sortKey="ratio_g" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValSin && <Th label="G+A" sortKey="val_sin" currentSort={sort} dir={dir} onSort={onSort} />}
              </>
            ) : (
              <>
                <Th label="Goles"  sortKey="goles"   currentSort={sort} dir={dir} onSort={onSort} />
                <Th label="Asist." sortKey="asist"   currentSort={sort} dir={dir} onSort={onSort} />
                {showRatios && <Th label="G/PJ"  sortKey="ratio_g" currentSort={sort} dir={dir} onSort={onSort} />}
                {showRatios && <Th label="A/PJ"  sortKey="ratio_a" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValSin  && <Th label="Val. sin"   sortKey="val_sin" currentSort={sort} dir={dir} onSort={onSort} />}
                {showValCoef && <Th label="Val. coef." sortKey="val_con" currentSort={sort} dir={dir} onSort={onSort} />}
              </>
            )}
            {showElo     && <Th label="ELO"     sortKey="elo"           currentSort={sort} dir={dir} onSort={onSort} />}
            {showFantasy && <Th label="Fantasy"  sortKey="fantasyPoints" currentSort={sort} dir={dir} onSort={onSort} />}
            <Th label="Fuente" currentSort={sort} dir={dir} onSort={onSort} />
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
