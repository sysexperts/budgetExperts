import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple'

interface ThemeColors {
  background: string
  surface: string
  card: string
  elevated: string
  text: string
  textSecondary: string
  textTertiary: string
  border: string
  borderSubtle: string
  primary: string
  primaryHover: string
  primaryLight: string
  success: string
  successLight: string
  warning: string
  warningLight: string
  error: string
  errorLight: string
  accent: string
  accentLight: string
}

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const themes: Record<Theme, ThemeColors> = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    elevated: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#60a5fa',
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    accent: '#8b5cf6',
    accentLight: '#a78bfa'
  },
  dark: {
    background: '#0f0f0f',
    surface: '#1a1a1a',
    card: '#212121',
    elevated: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textTertiary: '#9e9e9e',
    border: '#2d2d2d',
    borderSubtle: '#404040',
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    primaryLight: '#93c5fd',
    success: '#34d399',
    successLight: '#6ee7b7',
    warning: '#fbbf24',
    warningLight: '#fcd34d',
    error: '#f87171',
    errorLight: '#fca5a5',
    accent: '#a78bfa',
    accentLight: '#c4b5fd'
  },
  blue: {
    background: '#f8fafc',
    surface: '#eff6ff',
    card: '#ffffff',
    elevated: '#dbeafe',
    text: '#1e3a8a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    border: '#bfdbfe',
    borderSubtle: '#dbeafe',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#60a5fa',
    success: '#0ea5e9',
    successLight: '#38bdf8',
    warning: '#0284c7',
    warningLight: '#0ea5e9',
    error: '#dc2626',
    errorLight: '#ef4444',
    accent: '#7c3aed',
    accentLight: '#8b5cf6'
  },
  green: {
    background: '#f0fdf4',
    surface: '#dcfce7',
    card: '#ffffff',
    elevated: '#bbf7d0',
    text: '#14532d',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    border: '#bbf7d0',
    borderSubtle: '#dcfce7',
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryLight: '#22c55e',
    success: '#22c55e',
    successLight: '#4ade80',
    warning: '#84cc16',
    warningLight: '#a3e635',
    error: '#dc2626',
    errorLight: '#ef4444',
    accent: '#059669',
    accentLight: '#10b981'
  },
  purple: {
    background: '#faf5ff',
    surface: '#f3e8ff',
    card: '#ffffff',
    elevated: '#e9d5ff',
    text: '#581c87',
    textSecondary: '#6b7280',
    textTertiary: '#9333ea',
    border: '#e9d5ff',
    borderSubtle: '#f3e8ff',
    primary: '#9333ea',
    primaryHover: '#7c3aed',
    primaryLight: '#a855f7',
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    accent: '#ec4899',
    accentLight: '#f472b6'
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Lade Theme aus localStorage oder System-Präferenz
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && themes[savedTheme]) {
      return savedTheme
    }
    
    // System-Präferenz prüfen
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'blue', 'green', 'purple']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  // Apply theme to document
  useEffect(() => {
    const colors = themes[theme]
    const root = document.documentElement
    
    // Set CSS custom properties
    root.style.setProperty('--bg-background', colors.background)
    root.style.setProperty('--bg-surface', colors.surface)
    root.style.setProperty('--bg-card', colors.card)
    root.style.setProperty('--text-primary', colors.text)
    root.style.setProperty('--text-secondary', colors.textSecondary)
    root.style.setProperty('--border-color', colors.border)
    root.style.setProperty('--primary-color', colors.primary)
    root.style.setProperty('--primary-hover', colors.primaryHover)
    root.style.setProperty('--success-color', colors.success)
    root.style.setProperty('--warning-color', colors.warning)
    root.style.setProperty('--error-color', colors.error)
    root.style.setProperty('--accent-color', colors.accent)
    
    // Set theme class on body
    document.body.className = `theme-${theme}`
  }, [theme])

  const value: ThemeContextType = {
    theme,
    colors: themes[theme],
    setTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
