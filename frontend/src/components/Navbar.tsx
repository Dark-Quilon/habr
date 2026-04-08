import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link, route } from 'preact-router'
import { getStoredUser, removeToken, logout, getTags } from '../lib/api'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tags, setTags] = useState([])

  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)

    if (stored) {
      import('../lib/api').then(({ getNotifications }) => {
        getNotifications()
          .then((data) => {
            const count = data.results.filter((n) => !n.is_read).length
            setUnreadCount(count)
          })
          .catch(() => {})
      })
    } else {
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    removeToken()
    setUser(null)
    route('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    route(`/?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark habr-navbar">
        <div className="container d-flex align-items-center gap-2">
          <button
            className="nav-icon-btn"
            type="button"
            aria-label="Меню тегов"
            onClick={() => setBurgerOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </button>

          <Link className="navbar-brand fw-bold me-2" href="/">Хабр</Link>
          <span className="navbar-divider d-none d-md-inline">|</span>
          <span className="navbar-all-streams d-none d-md-inline ms-2">Все потоки</span>
          
          <div className="me-auto d-none d-lg-flex align-items-center justify-content-center flex-grow-1">
            <span className="text-white-50 small">🤔 Чему научиться в этом году?</span>
          </div>
          
          <div className="me-auto d-lg-none" />

          <div className="d-flex align-items-center gap-1">
            {searchOpen && (
              <form className="d-flex align-items-center me-1" onSubmit={handleSearch}>
                <input
                  className="navbar-search-bar"
                  type="search"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onInput={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </form>
            )}
            <button
              className="nav-icon-btn"
              type="button"
              aria-label="Поиск"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
              </svg>
            </button>

            <Link className="nav-icon-btn" href="/write" aria-label="Написать публикацию" title="Написать публикацию">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
              </svg>
            </Link>

            <Link className="nav-icon-btn d-none d-md-flex" href="/" aria-label="Конкурсы" title="Конкурсы">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
            </Link>

            {user ? (
              <div className="dropdown">
                <button
                  className="nav-icon-btn position-relative"
                  type="button"
                  aria-label="Аккаунт"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10c-2.029 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {accountOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show" style={{ right: 0, left: 'auto' }}>
                    <li><Link className="dropdown-item" href={`/profile/${user.username}`} onClick={() => setAccountOpen(false)}>Профиль</Link></li>
                    <li><Link className="dropdown-item" href="/notifications" onClick={() => setAccountOpen(false)}>Уведомления</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setAccountOpen(false); handleLogout() }}>Выйти</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <Link className="habr-btn-login" href="/login">Войти</Link>
            )}
          </div>
        </div>
      </nav>

      {burgerOpen && (
        <>
          <div className="habr-offcanvas-overlay" onClick={() => setBurgerOpen(false)} />
          <div className="habr-offcanvas">
            <div className="habr-offcanvas-inner">
              <Link href="/" className="habr-offcanvas-nav-item" onClick={() => setBurgerOpen(false)}>
                <span className="habr-offcanvas-icon">🆕</span>
                <span>Что нового</span>
              </Link>
              <Link href="/" className="habr-offcanvas-nav-item" onClick={() => setBurgerOpen(false)}>
                <span className="habr-offcanvas-icon">🌊</span>
                <span>Все потоки</span>
              </Link>

              <div className="habr-offcanvas-section-title">Разработка и инженерия</div>
              {[
                { icon: '⚙️', label: 'Бэкенд', tagSlug: 'bekend' },
                { icon: '🖥️', label: 'Фронтенд', tagSlug: 'frontend' },
                { icon: '📱', label: 'Мобильная разработка', search: 'Mobile' },
                { icon: '🎮', label: 'Геймдев', search: 'GameDev' },
                { icon: '🧪', label: 'Тестирование', tagSlug: 'testirovanie' },
                { icon: '🤖', label: 'AI и ML', tagSlug: 'mashinnoe-obuchenie' },
                { icon: '🏭', label: 'Промышленная инженерия', search: 'Engineering' },
              ].map(item => {
                const href = item.tagSlug 
                  ? `/?tags__slug=${item.tagSlug}`
                  : `/?search=${item.search}`
                return (
                  <Link key={item.label} href={href} className="habr-offcanvas-nav-item" onClick={() => setBurgerOpen(false)}>
                    <span className="habr-offcanvas-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="habr-offcanvas-arrow">›</span>
                  </Link>
                )
              })}

              <div className="habr-offcanvas-section-title">Инфраструктура и данные</div>
              {[
                { icon: '🛠️', label: 'Администрирование', tagSlug: 'linux' },
                { icon: '🔒', label: 'Информационная безопасность', tagSlug: 'bezopasnost' },
                { icon: '📊', label: 'Системный и бизнес-анализ', search: 'Analysis' },
              ].map(item => {
                const href = item.tagSlug 
                  ? `/?tags__slug=${item.tagSlug}`
                  : `/?search=${item.search}`
                return (
                  <Link key={item.label} href={href} className="habr-offcanvas-nav-item" onClick={() => setBurgerOpen(false)}>
                    <span className="habr-offcanvas-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="habr-offcanvas-arrow">›</span>
                  </Link>
                )
              })}

              <div className="habr-offcanvas-right">
                <div className="habr-offcanvas-block">
                  <div className="habr-offcanvas-block-title">
                    Технологии <Link href="/" className="habr-offcanvas-all" onClick={() => setBurgerOpen(false)}>Все →</Link>
                  </div>
                  <div className="habr-offcanvas-tags-grid">
                    {['Python', 'C++', 'Java', 'Go', 'PostgreSQL', 'Rust', 'Linux', 'Kotlin'].map(t => (
                      <Link key={t} href={`/?search=${t}`} className="habr-offcanvas-tag" onClick={() => setBurgerOpen(false)}>{t}</Link>
                    ))}
                  </div>
                </div>

                <div className="habr-offcanvas-block">
                  <div className="habr-offcanvas-block-title">
                    Темы <Link href="/" className="habr-offcanvas-all" onClick={() => setBurgerOpen(false)}>Все →</Link>
                  </div>
                  <div className="habr-offcanvas-tags-grid">
                    {tags.length > 0
                      ? tags.slice(0, 8).map(tag => (
                          <Link key={tag.id} href={`/?tags__slug=${tag.slug}`} className="habr-offcanvas-tag" onClick={() => setBurgerOpen(false)}>{tag.name}</Link>
                        ))
                      : ['Карьера в IT', 'Искусственный интеллект', 'Веб-разработка', 'Алгоритмы'].map(t => (
                          <span key={t} className="habr-offcanvas-tag">{t}</span>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
