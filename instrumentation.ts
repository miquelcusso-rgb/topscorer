import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// TEMP DEBUG (2026-05-31): log the full error to Vercel runtime logs so we can
// see the real stack behind the /es 500. Remove once the root cause is fixed.
export async function onRequestError(
  err: unknown,
  request: Parameters<typeof Sentry.captureRequestError>[1],
  context: Parameters<typeof Sentry.captureRequestError>[2],
) {
  try {
    const e = err as { message?: string; stack?: string; digest?: string }
    console.error(
      '[onRequestError]',
      JSON.stringify({
        path: request?.path,
        message: e?.message,
        digest: e?.digest,
        routerKind: context?.routerKind,
        routePath: context?.routePath,
        stack: e?.stack?.split('\n').slice(0, 12).join(' | '),
      }),
    )
  } catch {}
  return Sentry.captureRequestError(err, request, context)
}
