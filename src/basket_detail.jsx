import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBasketRoute, deleteOrder, getBasketRoute, listOrders, updateBasketRoute } from './api/fakeStore.js'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function BasketDetail() {
  const { routeId } = useParams()
  const navigate = useNavigate()

  const [route, setRoute] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', days: 0, pace: '', highlight: '', tags: '' })

  const ordersForRoute = useMemo(() => orders.filter((order) => order.routeId === routeId), [orders, routeId])

  const showBanner = (message) => {
    setBanner(message)
    window.setTimeout(() => setBanner(''), 1400)
  }

  useEffect(() => {
    let canceled = false

    const load = async () => {
      setLoading(true)
      setError('')
      setBanner('')
      setEditing(false)

      try {
        const [routeData, ordersData] = await Promise.all([getBasketRoute(routeId), listOrders()])
        if (canceled) return
        setRoute(routeData)
        setOrders(ordersData)
        setForm({
          title: routeData.title,
          days: routeData.days,
          pace: routeData.pace,
          highlight: routeData.highlight,
          tags: routeData.tags.join(', '),
        })
      } catch (loadError) {
        if (canceled) return
        setError(loadError.message || 'Не удалось загрузить маршрут')
        setRoute(null)
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    load()
    return () => {
      canceled = true
    }
  }, [routeId])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!route) return
    if (!form.title.trim()) {
      setError('Название маршрута не может быть пустым')
      return
    }

    setBusy(true)
    setError('')
    try {
      const updated = await updateBasketRoute(route.id, {
        title: form.title,
        days: Number(form.days),
        pace: form.pace,
        highlight: form.highlight,
        tags: form.tags,
      })
      setRoute(updated)
      setEditing(false)
      showBanner('Сохранено')
    } catch (saveError) {
      setError(saveError.message || 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteRoute = async () => {
    if (!route) return
    const confirmed = window.confirm('Удалить маршрут из подборки?')
    if (!confirmed) return

    setBusy(true)
    setError('')
    try {
      await deleteBasketRoute(route.id)
      navigate('/basket', { replace: true })
    } catch (deleteError) {
      setError(deleteError.message || 'Не удалось удалить маршрут')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Удалить план поездки?')
    if (!confirmed) return

    setBusy(true)
    setError('')
    try {
      await deleteOrder(orderId)
      setOrders((prev) => prev.filter((order) => order.id !== orderId))
      showBanner('План удалён')
    } catch (deleteError) {
      setError(deleteError.message || 'Не удалось удалить план')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <p className="description">Загружаем...</p>
      </section>
    )
  }

  if (!route) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow muted">Маршрут</p>
            <h2>Не найден</h2>
          </div>
          <Link className="button primary" to="/basket">
            К списку
          </Link>
        </div>
        {error && <p className="error-text">{error}</p>}
      </section>
    )
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Сохранённый маршрут</p>
        <h1>{route.title}</h1>
        <p className="lede">{route.summary}</p>
        <div className="hero-pills">
          <span className="pill ghost">{route.days} дней</span>
          <span className="pill ghost">{route.pace}</span>
          <Link className="pill ghost" to="/basket">
            к списку
          </Link>
          <Link className="pill ghost" to={`/basket/${route.id}/create-order`}>
            создать план
          </Link>
        </div>
      </header>

      {banner && <div className="banner">{banner}</div>}
      {error && <div className="banner error">{error}</div>}

      <main className="grid">
        <section className="panel detail">
          <div className="detail-head">
            <p className="label">{route.region}</p>
            <h2>{route.title}</h2>
            <p className="highlight">{route.highlight}</p>
          </div>

          <div className="stats">
            <div className="stat">
              <p className="stat-label">Длительность</p>
              <p className="stat-value">{route.days} дней</p>
            </div>
            <div className="stat">
              <p className="stat-label">Темп</p>
              <p className="stat-value">{route.pace}</p>
            </div>
            <div className="stat">
              <p className="stat-label">Теги</p>
              <p className="stat-value">{route.tags.join(' · ')}</p>
            </div>
          </div>

          <p className="description">{route.description}</p>

          {route.plan.length > 0 && (
            <div className="plan">
              <p className="eyebrow muted">День за днём</p>
              <div className="plan-list">
                {route.plan.map((stop, index) => (
                  <div key={`${stop.name}-${index}`} className="plan-item">
                    <div className="step">
                      <span className="dot" />
                      <span className="line" />
                    </div>
                    <div>
                      <p className="label">День {index + 1}</p>
                      <p className="stop-name">{stop.name}</p>
                      <p className="stop-note">{stop.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Действия</p>
              <h2>Редактирование</h2>
            </div>
            <span className="pill subtle">обновлён {formatDate(route.updatedAt)}</span>
          </div>

          {!editing ? (
            <div className="actions">
              <button className="button primary" type="button" onClick={() => setEditing(true)} disabled={busy}>
                Редактировать маршрут
              </button>
              <button className="button danger ghost" type="button" onClick={handleDeleteRoute} disabled={busy}>
                Удалить маршрут
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={handleSave}>
              <label className="field">
                <span>Название</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Дней</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Темп</span>
                  <input value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })} />
                </label>
              </div>

              <label className="field">
                <span>Ключевое впечатление</span>
                <textarea
                  rows="2"
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Теги (через запятую)</span>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </label>

              <div className="actions">
                <button className="button primary" type="submit" disabled={busy}>
                  {busy ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setForm({
                      title: route.title,
                      days: route.days,
                      pace: route.pace,
                      highlight: route.highlight,
                      tags: route.tags.join(', '),
                    })
                  }}
                  disabled={busy}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          <div className="divider" />

          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Планы</p>
              <h2>По этому маршруту</h2>
            </div>
            <span className="pill subtle">{ordersForRoute.length} шт.</span>
          </div>

          {ordersForRoute.length === 0 ? (
            <p className="description">Планов пока нет. Создайте первый.</p>
          ) : (
            <div className="list-grid">
              {ordersForRoute.map((order) => (
                <div key={order.id} className="card">
                  <div className="card-top">
                    <div>
                      <p className="label">Создан</p>
                      <h3>{formatDate(order.createdAt)}</h3>
                    </div>
                    <span className="pill small">обновлён {formatDate(order.updatedAt)}</span>
                  </div>
                  <p className="summary">
                    {order.notes ? order.notes.slice(0, 140) + (order.notes.length > 140 ? '…' : '') : 'Без заметок'}
                  </p>
                  <div className="actions">
                    <Link className="button primary" to={`/orders/${order.id}/edit`}>
                      Редактировать
                    </Link>
                    <button className="button danger ghost" type="button" onClick={() => handleDeleteOrder(order.id)} disabled={busy}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default BasketDetail
