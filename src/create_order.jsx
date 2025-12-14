import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createOrder, getBasketRoute } from './api/fakeStore.js'

function CreateOrder() {
  const { routeId } = useParams()
  const navigate = useNavigate()

  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ notes: '', startDate: '', endDate: '' })

  useEffect(() => {
    let canceled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const routeData = await getBasketRoute(routeId)
        if (canceled) return
        setRoute(routeData)
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const order = await createOrder({ routeId, ...form })
      navigate(`/orders/${order.id}/edit`, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Не удалось создать план')
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
            <p className="eyebrow muted">План поездки</p>
            <h2>Маршрут не найден</h2>
          </div>
          <Link className="button primary" to="/basket">
            К подборке
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
        <h1>Создать план</h1>
        <p className="lede">
          Маршрут: <strong>{route.title}</strong> · {route.days} дней · {route.pace}
        </p>
        <div className="hero-pills">
          <Link className="pill ghost" to={`/basket/${route.id}`}>
            открыть маршрут
          </Link>
          <Link className="pill ghost" to="/basket">
            к списку
          </Link>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Заметки</p>
              <h2>Как вам хочется</h2>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Заметки (необязательно)</span>
              <textarea
                rows="6"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Например: убрать один день, больше времени на прогулки, подходит для весны…"
              />
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
                {busy ? 'Создаём...' : 'Создать план'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Подсказка</p>
              <h2>Что сохраняется</h2>
            </div>
          </div>
          <p className="description">
            План — это ваш личный черновик: маршрут + заметки + (по желанию) даты. После сохранения вы сможете
            редактировать и удалить его.
          </p>
        </section>
      </main>
    </>
  )
}

export default CreateOrder
