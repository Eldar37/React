import { useTheme } from './ThemeContext.js'

function SunIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

export default function ThemeToggleButton({ className }) {
  const { theme, toggleTheme } = useTheme()

  const label = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'
  const nextLabel = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'

  return (
    <button
      className={['button ghost theme-toggle', className].filter(Boolean).join(' ')}
      type="button"
      onClick={toggleTheme}
      aria-label={`Переключить тему (сейчас: ${label})`}
      title={`Переключить тему (будет: ${nextLabel})`}
    >
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
      <span className="theme-toggle-text">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
    </button>
  )
}

