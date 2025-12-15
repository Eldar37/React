import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.js'
import ThemeToggleButton from '../theme/ThemeToggleButton.jsx'

const buildRedirectPath = (locationLike) => {
  if (!locationLike?.pathname) return '/'
  const search = typeof locationLike.search === 'string' ? locationLike.search : ''
  const hash = typeof locationLike.hash === 'string' ? locationLike.hash : ''
  return `${locationLike.pathname}${search}${hash}`
}

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const redirectTo = buildRedirectPath(location.state?.from ?? location)

  const [tab, setTab] = useState('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [loginForm, setLoginForm] = useState({ username: 'Eldar', password: '123123' })
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  if (user) return <Navigate to={redirectTo} replace />

  const switchTab = (next) => {
    setTab(next)
    setError('')
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(loginForm)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.message || 'Ошибка входа')
    } finally {
      setBusy(false)
    }
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(registerForm)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.message || 'Ошибка регистрации')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="panel auth-card">
        <div className="panel-header">
          <div>
            <p className="eyebrow muted">Вход на сайт</p>
            <h2>{tab === 'login' ? 'Авторизация' : 'Регистрация'}</h2>
          </div>
          <ThemeToggleButton />
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Авторизация и регистрация">
          <button
            className={tab === 'login' ? 'auth-tab is-active' : 'auth-tab'}
            type="button"
            onClick={() => switchTab('login')}
            role="tab"
            aria-selected={tab === 'login'}
          >
            Авторизация
          </button>
          <button
            className={tab === 'register' ? 'auth-tab is-active' : 'auth-tab'}
            type="button"
            onClick={() => switchTab('register')}
            role="tab"
            aria-selected={tab === 'register'}
          >
            Регистрация
          </button>
        </div>

        {error ? <div className="banner error">{error}</div> : null}

        {tab === 'login' ? (
          <form className="form" onSubmit={submitLogin}>
            <div className="field">
              <span>Логин</span>
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <span>Пароль</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>
            <button className="button primary" type="submit" disabled={busy}>
              {busy ? 'Входим...' : 'Войти'}
            </button>
            <p className="label">Демо доступ: Eldar / 123123</p>
          </form>
        ) : (
          <form className="form" onSubmit={submitRegister}>
            <div className="form-grid">
              <div className="field">
                <span>Имя</span>
                <input
                  value={registerForm.firstName}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="field">
                <span>Фамилия</span>
                <input
                  value={registerForm.lastName}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  autoComplete="family-name"
                  required
                />
              </div>
              <div className="field">
                <span>Email</span>
                <input
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                  autoComplete="email"
                  type="email"
                  required
                />
              </div>
              <div className="field">
                <span>Логин</span>
                <input
                  value={registerForm.username}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, username: event.target.value }))}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="field">
                <span>Пароль</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="field">
                <span>Повтор пароля</span>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button className="button primary" type="submit" disabled={busy}>
              {busy ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
            <p className="label">При регистрации используется 6 полей.</p>
          </form>
        )}
      </section>
    </div>
  )
}
