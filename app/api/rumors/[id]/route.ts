import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServerClient()
  const { data, error } = await sb.from('rumors').select('*').eq('id', id).eq('is_active', true).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Best-effort view counter (fire and forget)
  void sb.from('rumors').update({ views_count: (data.views_count ?? 0) + 1 }).eq('id', id)

  return NextResponse.json({ data })
}
