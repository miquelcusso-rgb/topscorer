'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from '@/lib/i18n'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const LangContext = createContext<LangCtx>({ lang: 'es', setLang: () => {} })

export function LangProvider({ children, defaultLang = 'es' }: { children: React.ReactNode; defaultLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(defaultLang)

  useEffect(() => {
    // Check localStorage override first
    const stored = localStorage.getItem('ts-lang') as Lang | null
    if (stored === 'es' || stored === 'en') {
      setLangState(stored)
      return
    }
    // Check cookie set by middleware
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('ts-lang='))
    if (cookie) {
      const val = cookie.split('=')[1]?.trim() as Lang
      if (val === 'es' || val === 'en') setLangState(val)
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('ts-lang', l)
    document.cookie = `ts-lang=${l}; path=/; max-age=31536000`
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
