const USERS_KEY = 'react-auth-users-v1'
const SESSION_KEY = 'react-auth-session-v1'

const storage = typeof window !== 'undefined' ? window.localStorage : null

const safeParseJson = (raw, fallback) => {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const normalizeUsername = (username) => String(username ?? '').trim()

const nowIso = () => new Date().toISOString()

const defaultUser = () => ({
  username: 'Eldar',
  password: '123123',
  firstName: 'Eldar',
  lastName: '',
  email: 'eldar@example.com',
  createdAt: nowIso(),
})

const sameUsername = (a, b) => normalizeUsername(a).toLowerCase() === normalizeUsername(b).toLowerCase()

const normalizeUser = (value) => {
  const username = normalizeUsername(value?.username)
  if (!username) return null

  return {
    username,
    password: String(value?.password ?? ''),
    firstName: String(value?.firstName ?? ''),
    lastName: String(value?.lastName ?? ''),
    email: String(value?.email ?? ''),
    createdAt: String(value?.createdAt ?? nowIso()),
  }
}

const ensureDefaultUser = (users) => {
  const normalized = users.map(normalizeUser).filter(Boolean)
  const hasDefault = normalized.some((user) => sameUsername(user.username, 'Eldar'))
  if (hasDefault) return normalized
  return [defaultUser(), ...normalized]
}

export const readUsers = () => {
  if (!storage) return ensureDefaultUser([])

  const raw = storage.getItem(USERS_KEY)
  if (!raw) {
    const seeded = ensureDefaultUser([])
    storage.setItem(USERS_KEY, JSON.stringify(seeded))
    return seeded
  }

  const parsed = safeParseJson(raw, null)
  const users = ensureDefaultUser(Array.isArray(parsed) ? parsed : [])

  if (!Array.isArray(parsed) || users.length !== parsed.length || !users.every((u, idx) => u.username === parsed[idx]?.username)) {
    storage.setItem(USERS_KEY, JSON.stringify(users))
  }

  return users
}

export const writeUsers = (users) => {
  if (!storage) return
  storage.setItem(USERS_KEY, JSON.stringify(Array.isArray(users) ? users : []))
}

export const getUserByUsername = (username) => {
  const name = normalizeUsername(username)
  if (!name) return null
  return readUsers().find((user) => sameUsername(user.username, name)) ?? null
}

export const createUser = ({ username, password, firstName, lastName, email }) => {
  const nextUsername = normalizeUsername(username)
  if (!nextUsername) throw new Error('Введите логин')

  const users = readUsers()
  const exists = users.some((user) => sameUsername(user.username, nextUsername))
  if (exists) throw new Error('Пользователь с таким логином уже существует')

  const user = normalizeUser({
    username: nextUsername,
    password: String(password ?? ''),
    firstName: String(firstName ?? ''),
    lastName: String(lastName ?? ''),
    email: String(email ?? ''),
    createdAt: nowIso(),
  })

  if (!user) throw new Error('Некорректные данные пользователя')

  const nextUsers = [user, ...users]
  writeUsers(nextUsers)
  return user
}

export const readSession = () => {
  if (!storage) return null
  const raw = storage.getItem(SESSION_KEY)
  if (!raw) return null
  const parsed = safeParseJson(raw, null)
  const username = normalizeUsername(parsed?.username)
  if (!username) return null
  return { username }
}

export const writeSession = (username) => {
  if (!storage) return
  const next = normalizeUsername(username)
  if (!next) return
  storage.setItem(SESSION_KEY, JSON.stringify({ username: next }))
}

export const clearSession = () => {
  if (!storage) return
  storage.removeItem(SESSION_KEY)
}

export const getSessionUser = () => {
  const session = readSession()
  if (!session?.username) return null
  return getUserByUsername(session.username)
}

