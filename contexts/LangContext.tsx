'use client'
import { createContext, useContext, useEffect } from 'react'
import type { Lang } from '@/lib/i18n'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const LangContext = createContext<LangCtx>({ lang: 'es', setLang: () => {} })

// With path-based routing (/es, /en) the URL is the single source of truth for
// language. `defaultLang` is derived from the [lang] route segment in the layout.
export function LangProvider({ children, defaultLang = 'es' }: { children: React.ReactNode; defaultLang?: Lang }) {
  // Keep the cookie in sync with the active route locale so any unprefixed
  // internal link gets redirected by the middleware to the correct language.
  useEffect(() => {
    document.cookie = `ts-lang=${defaultLang}; path=/; max-age=31536000`
    try { localStorage.setItem('ts-lang', defaultLang) } catch {}
  }, [defaultLang])

  const setLang = (l: Lang) => {
    document.cookie = `ts-lang=${l}; path=/; max-age=31536000`
    try { localStorage.setItem('ts-lang', l) } catch {}
  }

  return <LangContext.Provider value={{ lang: defaultLang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
