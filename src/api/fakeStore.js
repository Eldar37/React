const STORAGE_KEY = 'slow-travel-mock-api-v1'

const seed = {
  basketRoutes: [],
  orders: [],
}

const storage = typeof window !== 'undefined' ? window.localStorage : null

const clone = (value) =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))

const randomId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const delay = (value, ms = 120) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms))

const readState = () => {
  if (!storage) return clone(seed)

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return clone(seed)
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      basketRoutes: Array.isArray(parsed.basketRoutes) ? parsed.basketRoutes : clone(seed.basketRoutes),
      orders: Array.isArray(parsed.orders) ? parsed.orders : clone(seed.orders),
    }
  } catch {
    storage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return clone(seed)
  }
}

const saveState = (state) => {
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const normalizeTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}

const normalizePlan = (plan) => {
  if (!Array.isArray(plan)) return []
  return plan
    .map((stop) => ({
      name: String(stop?.name ?? '').trim(),
      note: String(stop?.note ?? '').trim(),
    }))
    .filter((stop) => stop.name)
}

const pickRouteSnapshot = (route) => ({
  id: route.id,
  title: route.title,
  region: route.region,
  days: route.days,
  pace: route.pace,
  summary: route.summary,
  tags: route.tags,
  highlight: route.highlight,
})

export const listBasketRoutes = async () => delay(readState().basketRoutes)

export const getBasketRoute = async (id) => {
  const route = readState().basketRoutes.find((r) => r.id === id)
  if (!route) throw new Error('Маршрут не найден')
  return delay(route)
}

export const saveRouteToBasket = async (route) => {
  if (!route?.id) throw new Error('Не удалось сохранить маршрут: нет id')

  const state = readState()
  const existing = state.basketRoutes.find((r) => r.id === route.id)
  if (existing) return delay(existing)

  const now = new Date().toISOString()
  const saved = {
    id: String(route.id),
    title: String(route.title ?? '').trim() || 'Маршрут без названия',
    region: String(route.region ?? '').trim(),
    days: Number(route.days) || 0,
    pace: String(route.pace ?? '').trim(),
    summary: String(route.summary ?? '').trim(),
    tags: normalizeTags(route.tags),
    highlight: String(route.highlight ?? '').trim(),
    description: String(route.description ?? '').trim(),
    plan: normalizePlan(route.plan),
    createdAt: now,
    updatedAt: now,
  }

  state.basketRoutes.unshift(saved)
  saveState(state)
  return delay(saved)
}

export const updateBasketRoute = async (id, updates) => {
  const state = readState()
  const idx = state.basketRoutes.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Маршрут не найден')

  const current = state.basketRoutes[idx]
  const next = {
    ...current,
    ...updates,
    title: String(updates?.title ?? current.title).trim(),
    region: String(updates?.region ?? current.region).trim(),
    days: Number(updates?.days ?? current.days) || 0,
    pace: String(updates?.pace ?? current.pace).trim(),
    summary: String(updates?.summary ?? current.summary).trim(),
    tags: updates?.tags !== undefined ? normalizeTags(updates.tags) : current.tags,
    highlight: String(updates?.highlight ?? current.highlight).trim(),
    description: String(updates?.description ?? current.description).trim(),
    plan: updates?.plan !== undefined ? normalizePlan(updates.plan) : current.plan,
    updatedAt: new Date().toISOString(),
  }

  state.basketRoutes[idx] = next
  saveState(state)
  return delay(next)
}

export const deleteBasketRoute = async (id) => {
  const state = readState()
  state.basketRoutes = state.basketRoutes.filter((r) => r.id !== id)
  saveState(state)
  return delay(true)
}

export const listOrders = async () => delay(readState().orders)

export const getOrder = async (id) => {
  const order = readState().orders.find((o) => o.id === id)
  if (!order) throw new Error('План не найден')
  return delay(order)
}

export const createOrder = async ({ routeId, notes, startDate, endDate }) => {
  if (!routeId) throw new Error('Выберите маршрут')

  const state = readState()
  const route = state.basketRoutes.find((r) => r.id === routeId)
  if (!route) throw new Error('Маршрут не найден в подборке')

  const now = new Date().toISOString()
  const order = {
    id: randomId(),
    routeId,
    route: pickRouteSnapshot(route),
    notes: String(notes ?? '').trim(),
    startDate: startDate ? String(startDate) : '',
    endDate: endDate ? String(endDate) : '',
    createdAt: now,
    updatedAt: now,
  }

  state.orders.unshift(order)
  saveState(state)
  return delay(order)
}

export const updateOrder = async (id, updates) => {
  const state = readState()
  const idx = state.orders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('План не найден')

  const current = state.orders[idx]
  const next = {
    ...current,
    ...updates,
    notes: updates?.notes !== undefined ? String(updates.notes).trim() : current.notes,
    startDate: updates?.startDate !== undefined ? String(updates.startDate || '') : current.startDate,
    endDate: updates?.endDate !== undefined ? String(updates.endDate || '') : current.endDate,
    updatedAt: new Date().toISOString(),
  }

  state.orders[idx] = next
  saveState(state)
  return delay(next)
}

export const deleteOrder = async (id) => {
  const state = readState()
  state.orders = state.orders.filter((o) => o.id !== id)
  saveState(state)
  return delay(true)
}
