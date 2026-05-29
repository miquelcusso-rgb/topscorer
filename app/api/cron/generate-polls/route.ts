import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Weekly cron: close polls whose ends_at has passed, then generate 3 new polls
 * from a rotating template pool. (Fully deterministic; no external LLM call so it
 * works without any extra env var or quota.)
 *
 * Schedule: Monday 09:00 UTC (= 11:00 Europe/Madrid CEST).
 */

interface Option { key: string; label_es: string; label_en: string }
interface Template {
  category: string
  question_es: string
  question_en: string
  durationDays: number
  options: Option[]
}

// Pool of polls. Each week the cron picks 3 that are NOT already running.
// Keep options short (UI works at ~24 chars / option).
const POOL: Template[] = [
  {
    category: 'pick',
    question_es: 'Pichichi de La Liga 2025/26 — tu favorito',
    question_en: 'La Liga top scorer 2025/26 — your pick',
    durationDays: 7,
    options: [
      { key: 'mbappe',   label_es: 'Kylian Mbappé',  label_en: 'Kylian Mbappé' },
      { key: 'yamal',    label_es: 'Lamine Yamal',   label_en: 'Lamine Yamal' },
      { key: 'lewy',     label_es: 'Lewandowski',    label_en: 'Lewandowski' },
      { key: 'griezmann',label_es: 'Griezmann',      label_en: 'Griezmann' },
    ],
  },
  {
    category: 'pick',
    question_es: 'Bota de Oro Premier League — favorito',
    question_en: 'Premier League Golden Boot — favourite',
    durationDays: 7,
    options: [
      { key: 'haaland', label_es: 'Erling Haaland', label_en: 'Erling Haaland' },
      { key: 'saka',    label_es: 'Bukayo Saka',    label_en: 'Bukayo Saka' },
      { key: 'salah',   label_es: 'Mohamed Salah',  label_en: 'Mohamed Salah' },
      { key: 'isak',    label_es: 'Alexander Isak', label_en: 'Alexander Isak' },
    ],
  },
  {
    category: 'general',
    question_es: 'Mejor central de Europa hoy',
    question_en: 'Best centre-back in Europe today',
    durationDays: 7,
    options: [
      { key: 'van_dijk',  label_es: 'Van Dijk',      label_en: 'Van Dijk' },
      { key: 'rudiger',   label_es: 'Antonio Rüdiger', label_en: 'Antonio Rüdiger' },
      { key: 'saliba',    label_es: 'William Saliba',  label_en: 'William Saliba' },
      { key: 'dias',      label_es: 'Rúben Dias',    label_en: 'Rúben Dias' },
    ],
  },
  {
    category: 'general',
    question_es: '¿Quién gana la Champions League 2025/26?',
    question_en: 'Who wins the 2025/26 Champions League?',
    durationDays: 14,
    options: [
      { key: 'real',    label_es: 'Real Madrid',     label_en: 'Real Madrid' },
      { key: 'city',    label_es: 'Man City',        label_en: 'Man City' },
      { key: 'bayern',  label_es: 'Bayern Munich',   label_en: 'Bayern Munich' },
      { key: 'arsenal', label_es: 'Arsenal',         label_en: 'Arsenal' },
      { key: 'psg',     label_es: 'PSG',             label_en: 'PSG' },
      { key: 'other',   label_es: 'Otro',            label_en: 'Other' },
    ],
  },
  {
    category: 'pick',
    question_es: 'MVP del mercado de invierno',
    question_en: 'Winter window MVP',
    durationDays: 14,
    options: [
      { key: 'arsenal',  label_es: 'Arsenal',     label_en: 'Arsenal' },
      { key: 'united',   label_es: 'Man United',  label_en: 'Man United' },
      { key: 'barca',    label_es: 'Barcelona',   label_en: 'Barcelona' },
      { key: 'milan',    label_es: 'AC Milan',    label_en: 'AC Milan' },
      { key: 'liverpool',label_es: 'Liverpool',   label_en: 'Liverpool' },
    ],
  },
  {
    category: 'general',
    question_es: '¿Quién marca primer gol del próximo Clásico?',
    question_en: 'First goal of the next El Clásico',
    durationDays: 7,
    options: [
      { key: 'mbappe',   label_es: 'Mbappé',         label_en: 'Mbappé' },
      { key: 'yamal',    label_es: 'Yamal',          label_en: 'Yamal' },
      { key: 'vinicius', label_es: 'Vinicius',       label_en: 'Vinicius' },
      { key: 'lewy',     label_es: 'Lewandowski',    label_en: 'Lewandowski' },
      { key: 'jude',     label_es: 'Bellingham',     label_en: 'Bellingham' },
      { key: 'pedri',    label_es: 'Pedri',          label_en: 'Pedri' },
      { key: 'other',    label_es: 'Otro',           label_en: 'Other' },
    ],
  },
  {
    category: 'goat',
    question_es: 'Próximo Balón de Oro — pronóstico realista',
    question_en: 'Next Ballon d’Or — realistic pick',
    durationDays: 14,
    options: [
      { key: 'yamal',    label_es: 'Lamine Yamal',    label_en: 'Lamine Yamal' },
      { key: 'mbappe',   label_es: 'Kylian Mbappé',   label_en: 'Kylian Mbappé' },
      { key: 'haaland',  label_es: 'Erling Haaland',  label_en: 'Erling Haaland' },
      { key: 'bellingham',label_es: 'Bellingham',     label_en: 'Bellingham' },
      { key: 'vinicius', label_es: 'Vinicius',        label_en: 'Vinicius' },
    ],
  },
  {
    category: 'general',
    question_es: 'Mejor entrenador de la temporada',
    question_en: 'Manager of the season',
    durationDays: 7,
    options: [
      { key: 'guardiola', label_es: 'Guardiola',    label_en: 'Guardiola' },
      { key: 'arteta',    label_es: 'Arteta',       label_en: 'Arteta' },
      { key: 'flick',     label_es: 'Flick',        label_en: 'Flick' },
      { key: 'xabi',      label_es: 'Xabi Alonso',  label_en: 'Xabi Alonso' },
      { key: 'simeone',   label_es: 'Simeone',      label_en: 'Simeone' },
    ],
  },
]

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const fromHeader = req.headers.get('authorization')
  if (fromHeader === `Bearer ${expected}`) return true
  const url = new URL(req.url)
  return url.searchParams.get('secret') === expected
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()

  // 1. Close expired polls
  const { data: closed } = await sb
    .from('polls')
    .update({ is_active: false })
    .lt('ends_at', new Date().toISOString())
    .eq('is_active', true)
    .select('id')

  // 2. Pick 3 templates not already used as currently-running questions
  const { data: running } = await sb.from('polls').select('question_es').eq('is_active', true)
  const runningQ = new Set((running ?? []).map(r => r.question_es))

  const candidates = POOL.filter(t => !runningQ.has(t.question_es))
  // Random sample of up to 3
  const picks: Template[] = []
  const pool = [...candidates]
  while (picks.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    picks.push(pool.splice(idx, 1)[0])
  }

  if (picks.length === 0) {
    return NextResponse.json({ ok: true, closed: closed?.length ?? 0, generated: 0, note: 'pool_exhausted' })
  }

  const now = new Date()
  const rows = picks.map((t, i) => ({
    question_es: t.question_es,
    question_en: t.question_en,
    options: t.options,
    category: t.category,
    starts_at: now.toISOString(),
    ends_at: new Date(now.getTime() + t.durationDays * 86400_000).toISOString(),
    is_featured: i === 0,
    is_active: true,
  }))
  const { error } = await sb.from('polls').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, closed: closed?.length ?? 0, generated: rows.length })
}
