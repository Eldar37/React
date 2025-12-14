import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteBasketRoute, deleteOrder, listBasketRoutes, listOrders } from './api/fakeStore.js'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function BasketList() {
  const [routes, setRoutes] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')

  const plansCountByRouteId = useMemo(() => {
    const map = new Map()
    for (const order of orders) {
      map.set(order.routeId, (map.get(order.routeId) ?? 0) + 1)
    }
    return map
  }, [orders])

  const showBanner = (message) => {
    setBanner(message)
    window.setTimeout(() => setBanner(''), 1400)
  }

  useEffect(() => {
    let canceled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [routesData, ordersData] = await Promise.all([listBasketRoutes(), listOrders()])
        if (canceled) return
        setRoutes(routesData)
        setOrders(ordersData)
      } catch (loadError) {
        if (canceled) return
        setError(loadError.message || 'Не удалось загрузить данные')
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    load()
    return () => {
      canceled = true
    }
  }, [])

  const handleDeleteRoute = async (routeId) => {
    const confirmed = window.confirm('Удалить маршрут из подборки?')
    if (!confirmed) return

    setError('')
    try {
      await deleteBasketRoute(routeId)
      setRoutes((prev) => prev.filter((r) => r.id !== routeId))
      showBanner('Маршрут удалён')
    } catch (deleteError) {
      setError(deleteError.message || 'Не удалось удалить маршрут')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Удалить план поездки?')
    if (!confirmed) return

    setError('')
    try {
      await deleteOrder(orderId)
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
      showBanner('План удалён')
    } catch (deleteError) {
      setError(deleteError.message || 'Не удалось удалить план')
    }
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Подборка</p>
        <h1>Мои маршруты и планы</h1>
        <p className="lede">Сохраняйте маршруты из каталога, а затем делайте личные планы с заметками и датами.</p>
        <div className="hero-pills">
          <span className="pill ghost">Маршруты: {routes.length}</span>
          <span className="pill ghost">Планы: {orders.length}</span>
        </div>
      </header>

      {banner && <div className="banner">{banner}</div>}
      {error && <div className="banner error">{error}</div>}

      {loading ? (
        <section className="panel">
          <p className="description">Загружаем...</p>
        </section>
      ) : (
        <main className="grid">
          <section className="panel list">
            <div className="panel-header">
              <div>
                <p className="eyebrow muted">Маршруты</p>
                <h2>Сохранённые</h2>
              </div>
              <span className="pill subtle">{routes.length} шт.</span>
            </div>

            {routes.length === 0 ? (
              <div className="empty">
                <p className="description">Пока нет сохранённых маршрутов.</p>
                <Link className="button primary" to="/">
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="list-grid">
                {routes.map((route) => {
                  const plansCount = plansCountByRouteId.get(route.id) ?? 0
                  return (
                    <div key={route.id} className="card">
                      <div className="card-top">
                        <div>
                          <p className="label">{route.region}</p>
                          <h3>{route.title}</h3>
                        </div>
                        <span className="pill small">{route.days} дн.</span>
                      </div>
                      <p className="summary">{route.highlight}</p>
                      <div className="tags">
                        {route.tags.map((tag) => (
                          <span key={tag} className="pill tiny">
                            {tag}
                          </span>
                        ))}
                        {plansCount > 0 && <span className="pill tiny subtle">планы: {plansCount}</span>}
                      </div>
                      <p className="pace">{route.pace}</p>
                      <div className="actions">
                        <Link className="button ghost" to={`/basket/${route.id}`}>
                          Подробнее
                        </Link>
                        <Link className="button primary" to={`/basket/${route.id}/create-order`}>
                          Создать план
                        </Link>
                        <button className="button danger ghost" type="button" onClick={() => handleDeleteRoute(route.id)}>
                          Удалить
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="panel detail">
            <div className="panel-header">
              <div>
                <p className="eyebrow muted">Планы</p>
                <h2>Поездки</h2>
              </div>
              <span className="pill subtle">{orders.length} шт.</span>
            </div>

            {orders.length === 0 ? (
              <p className="description">Планы поездок появятся здесь после создания.</p>
            ) : (
              <div className="list-grid">
                {orders.map((order) => (
                  <div key={order.id} className="card">
                    <div className="card-top">
                      <div>
                        <p className="label">Маршрут</p>
                        <h3>{order.route?.title || 'Без названия'}</h3>
                      </div>
                      <span className="pill small">{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="summary">
                      {order.notes ? order.notes.slice(0, 140) + (order.notes.length > 140 ? '…' : '') : 'Без заметок'}
                    </p>
                    <div className="tags">
                      {order.startDate && <span className="pill tiny">c {formatDate(order.startDate)}</span>}
                      {order.endDate && <span className="pill tiny">по {formatDate(order.endDate)}</span>}
                      {order.routeId && (
                        <Link className="pill tiny ghost" to={`/basket/${order.routeId}`}>
                          открыть маршрут
                        </Link>
                      )}
                    </div>
                    <div className="actions">
                      <Link className="button primary" to={`/orders/${order.id}/edit`}>
                        Редактировать
                      </Link>
                      <button className="button danger ghost" type="button" onClick={() => handleDeleteOrder(order.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </>
  )
}

export default BasketList
