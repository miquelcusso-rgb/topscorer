import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Spanish-speaking countries → default to ES, otherwise EN
const ES_COUNTRIES = new Set(['ES','MX','AR','CO','CL','PE','VE','EC','GT','CU','BO','DO','HN','PY','SV','NI','CR','PA','UY','GQ','PR'])

// Paths that must never receive a locale prefix
const EXCLUDED_PREFIXES = ['/api', '/trpc', '/_next', '/monitoring']
const EXCLUDED_EXACT = new Set([
  '/sitemap.xml', '/robots.txt', '/manifest.webmanifest', '/sw.js', '/favicon.ico', '/icon.png',
])

function detectLocale(req: NextRequest): 'es' | 'en' {
  const cookie = req.cookies.get('ts-lang')?.value
  if (cookie === 'es' || cookie === 'en') return cookie
  const country = req.headers.get('x-vercel-ip-country') ?? 'ES'
  return ES_COUNTRIES.has(country) ? 'es' : 'en'
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl

  // Skip API, internal, static, and special metadata files
  if (
    EXCLUDED_PREFIXES.some(p => pathname.startsWith(p)) ||
    EXCLUDED_EXACT.has(pathname) ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Already locale-prefixed → sync cookie to the URL locale so unprefixed
  // internal links resolve to the user's current language.
  const firstSeg = pathname.split('/')[1]
  if (firstSeg === 'es' || firstSeg === 'en') {
    const res = NextResponse.next()
    if (req.cookies.get('ts-lang')?.value !== firstSeg) {
      res.cookies.set('ts-lang', firstSeg, { path: '/', maxAge: 31536000 })
    }
    return res
  }

  // No locale prefix → redirect to the detected/preferred locale.
  // 308 (permanent) so Google consolidates `/` → `/es` (or `/en`) and stops flagging
  // "Página con redirección" in GSC. Was 307 default before.
  const locale = detectLocale(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 308)
})

export const config = {
  matcher: [
    // Run on real page navigations only. Exclude Next internals, the Sentry
    // tunnel, common crawler/metadata files (robots/sitemap/ads/llms/manifest),
    // and ANY path containing a file extension (e.g. .txt/.xml/.json/.js/img/
    // fonts). This keeps the i18n 308 redirect + locale-cookie sync on page
    // requests while keeping middleware OFF assets — the single biggest Edge
    // Request / Function Invocation reducer on the free tier.
    '/((?!_next/static|_next/image|monitoring|favicon\\.ico|robots\\.txt|ads\\.txt|sitemap\\.xml|manifest\\.webmanifest|sw\\.js|llms\\.txt|.*\\.[\\w]+$).*)',
    // Clerk still needs to wrap API/tRPC handlers that call auth(); without this
    // those routes lose the auth context. Internal-only, no redirects fire here.
    '/(api|trpc)(.*)',
  ],
}
