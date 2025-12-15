const THEME_KEY = 'react-theme-v1'

export const normalizeTheme = (value) => (value === 'dark' ? 'dark' : 'light')

export const readStoredTheme = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(THEME_KEY)
    if (raw === 'dark' || raw === 'light') return raw
    return null
  } catch {
    return null
  }
}

export const getPreferredTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return null
  }
}

export const getInitialTheme = () => normalizeTheme(readStoredTheme() ?? getPreferredTheme() ?? 'light')

export const writeStoredTheme = (theme) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_KEY, normalizeTheme(theme))
  } catch {
    // ignore
  }
}

export const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = normalizeTheme(theme)
}

