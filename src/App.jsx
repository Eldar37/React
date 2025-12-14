import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import BasketDetail from './basket_detail.jsx'
import BasketList from './basket_list.jsx'
import CreateOrder from './create_order.jsx'
import UpdateOrder from './update_order.jsx'
import { listBasketRoutes, saveRouteToBasket } from './api/fakeStore.js'

const trips = [
  {
    id: 'fjord',
    title: 'Фьорды без суеты',
    region: 'Норвегия',
    days: 6,
    pace: 'Спокойный темп',
    summary: 'От Бергена до Олесунна: туманные переправы, каяки и ночёвки в лоджах.',
    tags: ['морской воздух', 'рассветы', 'кафе у воды'],
    highlight: 'Закат на смотровой Trollstigen и горячий сидр в Alesund Bakeri.',
    description:
      'Маршрут для тех, кто любит море и горы, но без гонки по чеклисту. Переправы по фьордам, тихие бухты, прогулки по деревянным набережным и тёплые кафе в старых кварталах.',
    plan: [
      { name: 'Берген', note: 'Ганзейская набережная, старые склады, вечерний рыбный рынок.' },
      { name: 'Гейрангер', note: 'Смотровая Flydalsjuvet, короткий хайкинг к водопаду Storseterfossen.' },
      { name: 'Олесунн', note: 'Ар-нуво фасады, вид с Aksla, каяки на зеркальной воде.' },
    ],
  },
  {
    id: 'kyoto',
    title: 'Утренний Киото',
    region: 'Япония',
    days: 5,
    pace: 'Ранние подъёмы',
    summary: 'Тихие улочки Хигасиямы, чайные дома и велосипедные петли вдоль Камо.',
    tags: ['чай', 'архитектура', 'велосипед'],
    highlight: 'Прогулка по бамбуковому лесу Арасиямы до рассвета и поздний завтрак в Nishiki Market.',
    description:
      'Собранный маршрут без толпы: приходим в святыни на рассвете, пьём матча латте в киосках и катаемся по кварталам, где всё ещё пахнет кедром.',
    plan: [
      { name: 'Фусими Инаари', note: 'Стартуем в 5:30, тропа через тысячи торий почти пустая.' },
      { name: 'Арасияма', note: 'Бамбуковая роща, мост Тогецукё, чай у реки Ои.' },
      { name: 'Гион', note: 'Медленные улицы с гейшими кварталами, сувениры у Yasaka Shrine.' },
    ],
  },
  {
    id: 'desert',
    title: 'Атлас и пустыня',
    region: 'Марокко',
    days: 7,
    pace: 'Экспедиция',
    summary: 'От Марракеша к барханам Мерзуги: риады, касбы и ночи под звёздами.',
    tags: ['пустыня', 'реликвии', 'звёзды'],
    highlight: 'Глинобитные касбы Айт-Бен-Хадду на закате и камин в риаде.',
    description:
      'Контраст медины и каменных перевалов. Поднимаемся на серпантины Атласа, останавливаемся в оазисах, учимся заваривать атай, ловим прохладу в тенистых двориках.',
    plan: [
      { name: 'Марракеш', note: 'Сук, терассы с апельсиновым соком, сады Мажорель.' },
      { name: 'Айт-Бен-Хадду', note: 'Небольшие подъёмы, закат на террасе касбы.' },
      { name: 'Мерзуга', note: 'Верблюды к эргу Чебби, дюны, берберская музыка у костра.' },
    ],
  },
  {
    id: 'georgia',
    title: 'Горные завтраки',
    region: 'Грузия',
    days: 4,
    pace: 'Выходные в горах',
    summary: 'Кафе в Тбилиси, дорога в Казбеги и панорамы с глинтвейном.',
    tags: ['панорамы', 'сыр', 'лёгкие тропы'],
    highlight: 'Ранний подъём к храму Гергети, хачапури на террасе Rooms Kazbegi.',
    description:
      'Маршрут для короткого побега: немного городской жизни, чуть-чуть альпийских лугов. Тёплые хинкали, облака вокруг Казбека и влажный воздух ущелий.',
    plan: [
      { name: 'Тбилиси', note: 'Серные бани, кофе в Fabrika, мост Мира вечером.' },
      { name: 'Военно-Грузинская дорога', note: 'Остановка у Жинвальского водохранилища, смотровые у Гудаури.' },
      { name: 'Степанцминда', note: 'Тропа к Гергети, пикник с ачмой и вином.' },
    ],
  },
]

function CatalogPage() {
  const navigate = useNavigate()

  const [activeId, setActiveId] = useState(trips[0]?.id ?? '')
  const [savedRouteIds, setSavedRouteIds] = useState([])
  const [busyId, setBusyId] = useState('')
  const [banner, setBanner] = useState('')

  const activeTrip = useMemo(() => trips.find((item) => item.id === activeId), [activeId])
  const isSaved = activeTrip ? savedRouteIds.includes(activeTrip.id) : false

  const showBanner = (message) => {
    setBanner(message)
    window.setTimeout(() => setBanner(''), 1400)
  }

  useEffect(() => {
    let canceled = false

    const loadSaved = async () => {
      try {
        const saved = await listBasketRoutes()
        if (canceled) return
        setSavedRouteIds(saved.map((r) => r.id))
      } catch {
        if (!canceled) setSavedRouteIds([])
      }
    }

    loadSaved()
    return () => {
      canceled = true
    }
  }, [])

  const saveActive = async () => {
    if (!activeTrip) return
    if (savedRouteIds.includes(activeTrip.id)) {
      showBanner('Уже в подборке')
      return
    }

    setBusyId(activeTrip.id)
    try {
      await saveRouteToBasket(activeTrip)
      setSavedRouteIds((prev) => (prev.includes(activeTrip.id) ? prev : [...prev, activeTrip.id]))
      showBanner('Маршрут сохранён')
    } catch (saveError) {
      showBanner(saveError.message || 'Не удалось сохранить маршрут')
    } finally {
      setBusyId('')
    }
  }

  const createPlanForActive = async () => {
    if (!activeTrip) return

    if (!savedRouteIds.includes(activeTrip.id)) {
      setBusyId(activeTrip.id)
      try {
        await saveRouteToBasket(activeTrip)
        setSavedRouteIds((prev) => (prev.includes(activeTrip.id) ? prev : [...prev, activeTrip.id]))
      } catch (saveError) {
        showBanner(saveError.message || 'Не удалось сохранить маршрут')
        setBusyId('')
        return
      }
      setBusyId('')
    }

    navigate(`/basket/${activeTrip.id}/create-order`)
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Каталог</p>
        <h1>Slow Travel</h1>
        <p className="lede">
          Подборка маршрутов, где важно не количество галочек, а настроение. Нажмите на идею слева, чтобы увидеть детали,
          план и неожиданные акценты.
        </p>
        <div className="hero-pills">
          <span className="pill ghost">4–7 дней</span>
          <span className="pill ghost">медленный темп</span>
          <Link className="pill ghost" to="/basket">
            моя подборка
          </Link>
        </div>
      </header>

      {banner && <div className="banner">{banner}</div>}

      <main className="grid">
        <section className="panel list">
          <div className="panel-header">
            <div>
              <p className="eyebrow muted">Выбор</p>
              <h2>Идеи для побега</h2>
            </div>
            <span className="pill subtle">{trips.length} маршрута</span>
          </div>
          <div className="list-grid">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setActiveId(trip.id)}
                className={`card ${activeId === trip.id ? 'is-active' : ''}`}
                type="button"
              >
                <div className="card-top">
                  <div>
                    <p className="label">{trip.region}</p>
                    <h3>{trip.title}</h3>
                  </div>
                  <span className="pill small">{trip.days} дн.</span>
                </div>
                <p className="summary">{trip.summary}</p>
                <div className="tags">
                  {trip.tags.map((tag) => (
                    <span key={tag} className="pill tiny">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="pace">{trip.pace}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel detail">
          {activeTrip ? (
            <>
              <div className="detail-head">
                <p className="label">{activeTrip.region}</p>
                <h2>{activeTrip.title}</h2>
                <p className="highlight">{activeTrip.highlight}</p>
              </div>

              <div className="stats">
                <div className="stat">
                  <p className="stat-label">Длительность</p>
                  <p className="stat-value">{activeTrip.days} дней</p>
                </div>
                <div className="stat">
                  <p className="stat-label">Темп</p>
                  <p className="stat-value">{activeTrip.pace}</p>
                </div>
                <div className="stat">
                  <p className="stat-label">Теги</p>
                  <p className="stat-value">{activeTrip.tags.join(' · ')}</p>
                </div>
              </div>

              <p className="description">{activeTrip.description}</p>

              <div className="actions">
                <button className="button primary" type="button" onClick={saveActive} disabled={isSaved || busyId === activeTrip.id}>
                  {isSaved ? 'Уже в подборке' : busyId === activeTrip.id ? 'Сохраняем...' : 'Сохранить в подборку'}
                </button>
                <button className="button ghost" type="button" onClick={createPlanForActive} disabled={busyId === activeTrip.id}>
                  {busyId === activeTrip.id ? 'Готовим...' : 'Создать план'}
                </button>
                {isSaved && (
                  <Link className="button ghost" to={`/basket/${activeTrip.id}`}>
                    Открыть сохранённый
                  </Link>
                )}
              </div>

              <div className="plan">
                <p className="eyebrow muted">День за днём</p>
                <div className="plan-list">
                  {activeTrip.plan.map((stop, index) => (
                    <div key={stop.name} className="plan-item">
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
            </>
          ) : (
            <p className="description">Выберите маршрут слева, чтобы увидеть детали.</p>
          )}
        </section>
      </main>
    </>
  )
}

function NotFound() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow muted">Ошибка</p>
          <h2>Страница не найдена</h2>
        </div>
        <Link className="button primary" to="/">
          В каталог
        </Link>
      </div>
      <p className="description">Проверьте адрес или вернитесь в каталог маршрутов.</p>
    </section>
  )
}

function App() {
  return (
    <div className="page">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-dot" />
          <div>
            <span className="brand-name">Slow Travel</span>
            <span className="brand-sub">каталог · подборка · планы</span>
          </div>
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Каталог
          </NavLink>
          <NavLink to="/basket" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Моя подборка
          </NavLink>
        </nav>
        <a className="cta" href="mailto:hello@slowtravel.test">
          Связаться
        </a>
      </header>

      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/basket" element={<BasketList />} />
        <Route path="/basket/:routeId" element={<BasketDetail />} />
        <Route path="/basket/:routeId/create-order" element={<CreateOrder />} />
        <Route path="/orders/:orderId/edit" element={<UpdateOrder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="footer">
        <div>
          <p className="label">Slow Travel</p>
          <p className="footer-text">Короткие маршруты без спешки. Подстроим под ваш темп и даты.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:hello@slowtravel.test">hello@slowtravel.test</a>
          <span>+ чат в мессенджере</span>
        </div>
      </footer>
    </div>
  )
}

export default App
