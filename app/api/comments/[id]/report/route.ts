import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/comments/[id]/report  body: { reason?: string }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { reason } = await req.json().catch(() => ({}))
  const sb = createServerClient()
  const { data, error } = await sb.rpc('report_comment', {
    p_clerk_id: userId,
    p_comment_id: id,
    p_reason: typeof reason === 'string' ? reason.slice(0, 200) : null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}
