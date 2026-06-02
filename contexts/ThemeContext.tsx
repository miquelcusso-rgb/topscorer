'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise from the data-theme that the anti-flash inline script already set
  // on <html>, so useTheme() consumers that color via JS (e.g. Resultados) get
  // the correct theme on the first client render instead of flashing dark.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const a = document.documentElement.getAttribute('data-theme')
      if (a === 'light' || a === 'dark') return a
    }
    return 'dark'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('ts-theme') as Theme | null
    const domTheme = document.documentElement.getAttribute('data-theme') as Theme | null
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    setTheme(stored ?? domTheme ?? preferred)
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
