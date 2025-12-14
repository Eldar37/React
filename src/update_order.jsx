import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteOrder, getOrder, updateOrder } from './api/fakeStore.js'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function UpdateOrder() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState({ notes: '', startDate: '', endDate: '' })

  useEffect(() => {
    let canceled = false

    const load = async () => {
      setLoading(true)
      setError('')
      setOk('')
      try {
        const orderData = await getOrder(orderId)
        if (canceled) return
        setOrder(orderData)
        setForm({
          notes: orderData.notes || '',
          startDate: orderData.startDate || '',
          endDate: orderData.endDate || '',
        })
      } catch (loadError) {
        if (canceled) return
        setError(loadError.message || 'Не удалось загрузить план')
        setOrder(null)
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    load()
    return () => {
      canceled = true
    }
  }, [orderId])

  const handleSave = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setOk('')
    try {
      const updated = await updateOrder(orderId, form)
      setOrder(updated)
      setOk('Сохранено')
      window.setTimeout(() => setOk(''), 1400)
    } catch (saveError) {
      setError(saveError.message || 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Удалить план поездки?')
    if (!confirmed) return

    setBusy(true)
    setError('')
    try {
      await deleteOrder(orderId)
      navigate('/basket', { replace: true })
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

  if (!order) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow muted">План поездки</p>
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
        <p className="eyebrow">План поездки</p>
        <h1>Редактирование</h1>
        <p className="lede">
          Маршрут: <strong>{order.route?.title || 'Без названия'}</strong>
        </p>
        <div className="hero-pills">
          {order.routeId && (
            <Link className="pill ghost" to={`/basket/${order.routeId}`}>
              открыть маршрут
            </Link>
          )}
          <Link className="pill ghost" to="/basket">
            к списку
          </Link>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}
      {ok && <div className="banner">{ok}</div>}

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Данные</p>
              <h2>Заметки и даты</h2>
            </div>
            <span className="pill subtle">создан {formatDate(order.createdAt)}</span>
          </div>

          <form className="form" onSubmit={handleSave}>
            <label className="field">
              <span>Заметки</span>
              <textarea rows="6" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>

            <div className="form-grid">
              <label className="field">
                <span>Дата начала</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Дата конца</span>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </label>
            </div>

            <div className="actions">
              <button className="button primary" type="submit" disabled={busy}>
                {busy ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button className="button danger ghost" type="button" onClick={handleDelete} disabled={busy}>
                Удалить план
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Маршрут</p>
              <h2>Кратко</h2>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <p className="stat-label">Длительность</p>
              <p className="stat-value">{order.route?.days ?? '—'} дней</p>
            </div>
            <div className="stat">
              <p className="stat-label">Темп</p>
              <p className="stat-value">{order.route?.pace ?? '—'}</p>
            </div>
            <div className="stat">
              <p className="stat-label">Теги</p>
              <p className="stat-value">{order.route?.tags?.join(' · ') || '—'}</p>
            </div>
          </div>

          {order.route?.highlight && <p className="description">{order.route.highlight}</p>}
        </section>
      </main>
    </>
  )
}

export default UpdateOrder
