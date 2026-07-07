'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import type { Lang } from '@/lib/i18n'

export default function LangTogglePill() {
  const { lang, setLang } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  const handle = (next: Lang) => {
    if (next === lang) return
    setLang(next)
    if (pathname) {
      const parts = pathname.split('/')
      // /es/... -> /en/...
      if (parts.length > 1 && (parts[1] === 'es' || parts[1] === 'en')) {
        parts[1] = next
        router.push(parts.join('/') || '/')
        return
      }
    }
    router.push(`/${next}`)
  }

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        height: 32, // 24→32 audit móvil 8-jul: target táctil de control secundario
        border: '1px solid var(--ts-border)',
        borderRadius: 6,
        padding: 2,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '0.06em',
        background: 'var(--ts-card2)',
      }}
    >
      {(['es', 'en'] as const).map(code => {
        const active = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => handle(code)}
            style={{
              padding: '0 10px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--ts-surface)' : 'transparent',
              color: active ? 'var(--ts-text)' : 'var(--ts-muted)',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {code}
          </button>
        )
      })}
    </div>
  )
}
