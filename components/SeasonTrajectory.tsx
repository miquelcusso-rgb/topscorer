'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'

interface TrajectoryPoint {
  week: number
  goals_cumulative: number
  assists_cumulative: number
}

/**
 * Generate a plausible season trajectory from season totals.
 * Distributes goals/assists across matchweeks with some front-loaded randomness,
 * using a seeded approach so it stays stable per player.
 */
function generateTrajectory(
  goals: number,
  matches: number,
  assists: number
): TrajectoryPoint[] {
  if (matches <= 0) return []

  // Simple deterministic pseudo-random from seed
  function seededRand(seed: number): () => number {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    }
  }
  const rand = seededRand(goals * 31 + assists * 17 + matches * 7)

  // Distribute N events across M matchweeks as 0/1 per week
  function distribute(total: number, weeks: number, r: () => number): number[] {
    if (total <= 0) return new Array(weeks).fill(0)
    // Weight weeks: slightly front-loaded (good form early + recent surge)
    const weights: number[] = []
    for (let i = 0; i < weeks; i++) {
      // U-shape: higher at start and end
      const pos = i / (weeks - 1 || 1)
      const base = 0.6 + 0.4 * (1 - Math.sin(Math.PI * pos) * 0.6)
      weights.push(base + r() * 0.3)
    }
    const sum = weights.reduce((a, b) => a + b, 0)
    const probs = weights.map(w => (w / sum) * total)

    // Round while preserving total
    const rounded = probs.map(Math.floor)
    let remainder = total - rounded.reduce((a, b) => a + b, 0)
    const fractions = probs.map((v, i) => ({ i, frac: v - rounded[i] }))
      .sort((a, b) => b.frac - a.frac)
    for (let i = 0; i < remainder; i++) {
      rounded[fractions[i].i]++
    }
    return rounded
  }

  const goalsByWeek = distribute(goals, matches, rand)
  const assistsByWeek = distribute(assists, matches, rand)

  const points: TrajectoryPoint[] = []
  let cumGoals = 0
  let cumAssists = 0
  for (let i = 0; i < matches; i++) {
    cumGoals += goalsByWeek[i]
    cumAssists += assistsByWeek[i]
    points.push({
      week: i + 1,
      goals_cumulative: cumGoals,
      assists_cumulative: cumAssists,
    })
  }
  return points
}

interface Props {
  goals: number
  assists: number
  matches: number
}

export default function SeasonTrajectory({ goals, assists, matches }: Props) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const data = generateTrajectory(goals, matches, assists)

  if (data.length < 2) return null

  const mutedColor = isLight ? '#9090b8' : '#52526e'
  const tooltipBg = isLight ? '#f4f6ff' : '#0e0e1c'
  const tooltipBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.08)'

  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: '1.5px',
          color: mutedColor,
          fontFamily: "'Barlow Condensed', sans-serif",
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Trayectoria estimada 25/26
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -28 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: mutedColor, fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(matches / 5)}
          />
          <YAxis
            tick={{ fill: mutedColor, fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 6,
              fontSize: 11,
              color: isLight ? '#1a2a40' : '#d8d8ec',
            }}
            formatter={(value, name) => [
              value as number,
              (name as string) === 'goals_cumulative' ? 'Goles' : 'Asistencias',
            ]}
            labelFormatter={(label) => `Jornada ${label}`}
          />
          <Line
            type="monotone"
            dataKey="goals_cumulative"
            stroke="#f0c040"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#f0c040' }}
          />
          <Line
            type="monotone"
            dataKey="assists_cumulative"
            stroke="#00c8b0"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#00c8b0' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4" style={{ marginTop: 4 }}>
        <span className="flex items-center gap-1" style={{ fontSize: 10, color: mutedColor }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#f0c040', borderRadius: 1 }} />
          Goles
        </span>
        <span className="flex items-center gap-1" style={{ fontSize: 10, color: mutedColor }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#00c8b0', borderRadius: 1 }} />
          Asistencias
        </span>
      </div>
    </div>
  )
}
