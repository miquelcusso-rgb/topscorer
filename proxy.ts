import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Spanish-speaking countries
const ES_COUNTRIES = new Set(['ES','MX','AR','CO','CL','PE','VE','EC','GT','CU','BO','DO','HN','PY','SV','NI','CR','PA','UY','GQ','PR'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const res = NextResponse.next()

  // Only set lang cookie if not already set by user
  const existing = req.cookies.get('ts-lang')?.value
  if (!existing) {
    const country = req.headers.get('x-vercel-ip-country') ?? 'ES'
    const lang = ES_COUNTRIES.has(country) ? 'es' : 'en'
    res.cookies.set('ts-lang', lang, { path: '/', maxAge: 31536000 })
  }

  return res
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
