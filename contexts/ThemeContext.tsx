'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise from the data-theme that the anti-flash inline script already set
  // on <html>, so useTheme() consumers that color via JS (e.g. Resultados) get
  // the correct theme on the first client render instead of flashing dark.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const a = document.documentElement.getAttribute('data-theme')
      if (a === 'light' || a === 'dark') return a
    }
    return 'light'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Default is ALWAYS light (brand decision). Only an explicit stored choice
    // overrides it — system dark preference is ignored so the site never loads dark.
    const stored = localStorage.getItem('ts-theme') as Theme | null
    setTheme(stored === 'dark' || stored === 'light' ? stored : 'light')
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ts-theme', theme)
  }, [theme, mounted])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
