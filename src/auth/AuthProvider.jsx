import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { clearSession, createUser, getSessionUser, getUserByUsername, writeSession } from './authStorage.js'

const sanitizeUser = (user) => {
  if (!user) return null
  const { password: _password, ...safe } = user
  return safe
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sanitizeUser(getSessionUser()))

  const login = useCallback(async ({ username, password }) => {
    const found = getUserByUsername(username)
    const pass = String(password ?? '')

    if (!found || found.password !== pass) {
      throw new Error('Неверный логин или пароль')
    }

    writeSession(found.username)
    const safeUser = sanitizeUser(found)
    setUser(safeUser)
    return safeUser
  }, [])

  const register = useCallback(async ({ firstName, lastName, email, username, password, confirmPassword }) => {
    const normalizedFirstName = String(firstName ?? '').trim()
    const normalizedLastName = String(lastName ?? '').trim()
    const normalizedEmail = String(email ?? '').trim()
    const normalizedUsername = String(username ?? '').trim()
    const normalizedPassword = String(password ?? '')
    const normalizedConfirm = String(confirmPassword ?? '')

    if (!normalizedFirstName) throw new Error('Введите имя')
    if (!normalizedLastName) throw new Error('Введите фамилию')
    if (!normalizedEmail) throw new Error('Введите email')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) throw new Error('Введите корректный email')
    if (!normalizedUsername) throw new Error('Введите логин')
    if (normalizedPassword.length < 6) throw new Error('Пароль должен быть минимум 6 символов')
    if (normalizedPassword !== normalizedConfirm) throw new Error('Пароли не совпадают')

    const created = createUser({
      username: normalizedUsername,
      password: normalizedPassword,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
    })

    writeSession(created.username)
    const safeUser = sanitizeUser(created)
    setUser(safeUser)
    return safeUser
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

