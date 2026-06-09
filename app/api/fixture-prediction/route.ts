import { NextRequest } from 'next/server'
import { getFixturePrediction } from '@/lib/api-football'

export const revalidate = 3600

// Win/draw/loss prediction for an upcoming fixture. Defensive: any failure (or
// no prediction available, e.g. a finished match) → ok:true with prediction:null
// so the UI simply renders nothing.
export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  try {
    const prediction = await getFixturePrediction(id)
    return Response.json({ ok: true, prediction })
  } catch (err) {
    return Response.json({ ok: true, prediction: null, error: String(err) })
  }
}
