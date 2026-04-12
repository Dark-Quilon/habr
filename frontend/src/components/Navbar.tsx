import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link, route } from 'preact-router'
import { getStoredUser, removeToken, logout, getTags } from '../lib/api'
import { navigateToTag, navigateToSearch } from '../lib/navigation'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('customBgColor') || '')
  const [textColor, setTextColor] = useState(() => localStorage.getItem('customTextColor') || '')
  const [cardColor, setCardColor] = useState(() => localStorage.getItem('customCardColor') || '')
  const [tempBgColor, setTempBgColor] = useState('')
  const [tempTextColor, setTempTextColor] = useState('')
  const [tempCardColor, setTempCardColor] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [tags, setTags] = useState([])
  const [saved, setSaved] = useState(false)

  // Значения по умолчанию для тем
  const themeDefaults = {
    light: { bg: '#e8e8e8', text: '#333333', card: '#ffffff' },
    dark: { bg: '#0d1117', text: '#e6edf3', card: '#161b22' }
  }

  // Получаем текущие активные цвета
  const getActiveColors = () => {
    if (bgColor && textColor && cardColor) {
      return { bg: bgColor, text: textColor, card: cardColor }
    }
    return themeDefaults[theme]
  }

  // Применяем тему - только меняем тему, цвета не трогаем
  const applyTheme = (themeName) => {
    setTheme(themeName)
    const defaults = themeDefaults[themeName]
    // Устанавливаем временные цвета темы для предпросмотра
    setTempBgColor(defaults.bg)
    setTempTextColor(defaults.text)
    setTempCardColor(defaults.card)
  }

  // Инициализация при загрузке
  useEffect(() => {
    const customBg = localStorage.getItem('customBgColor')
    const customText = localStorage.getItem('customTextColor')
    const customCard = localStorage.getItem('customCardColor')
    
    if (customBg && customText && customCard) {
      setBgColor(customBg)
      setTextColor(customText)
      setCardColor(customCard)
      setTempBgColor(customBg)
      setTempTextColor(customText)
      setTempCardColor(customCard)
    } else {
      const defaults = themeDefaults[theme]
      setTempBgColor(defaults.bg)
      setTempTextColor(defaults.text)
      setTempCardColor(defaults.card)
    }
  }, [])

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
      .then((fetchedTags) => {
        // Маппинг русских названий на английские
        const translationMap: Record<string, string> = {
          'Фронтенд': 'Frontend',
          'Бэкенд': 'Backend',
          'Мобильная разработка': 'Mobile Development',
          'Геймдев': 'GameDev',
          'Тестирование': 'Testing',
          'Алгоритмы': 'Algorithms',
          'Карьера в IT': 'IT Career',
          'Искусственный интеллект': 'Artificial Intelligence',
          'Веб-разработка': 'Web Development',
          'Администрирование': 'System Administration',
          'Информационная безопасность': 'Information Security',
          'Системный и бизнес-анализ': 'System & Business Analysis',
          'Промышленная инженерия': 'Industrial Engineering',
        }

        const translatedTags = fetchedTags.map((tag: any) => ({
          ...tag,
          name: translationMap[tag.name] || tag.name,
        }))

        setTags(translatedTags)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Используем временные цвета (для предпросмотра) или сохраненные
    const activeBg = tempBgColor || bgColor || themeDefaults[theme].bg
    const activeText = tempTextColor || textColor || themeDefaults[theme].text
    const activeCard = tempCardColor || cardColor || themeDefaults[theme].card
    
    root.style.setProperty('--habr-bg', activeBg)
    root.style.setProperty('--habr-text', activeText)
    root.style.setProperty('--habr-card', activeCard)

    if (theme === 'dark') {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }

    localStorage.setItem('theme', theme)
  }, [theme, bgColor, textColor, cardColor, tempBgColor, tempTextColor, tempCardColor])

  const handleSaveSettings = () => {
    // Сохраняем временные цвета как активные
    setBgColor(tempBgColor)
    setTextColor(tempTextColor)
    setCardColor(tempCardColor)
    
    localStorage.setItem('customBgColor', tempBgColor)
    localStorage.setItem('customTextColor', tempTextColor)
    localStorage.setItem('customCardColor', tempCardColor)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetSettings = () => {
    localStorage.removeItem('customBgColor')
    localStorage.removeItem('customTextColor')
    localStorage.removeItem('customCardColor')
    setBgColor('')
    setTextColor('')
    setCardColor('')
    
    const defaults = themeDefaults[theme]
    setTempBgColor(defaults.bg)
    setTempTextColor(defaults.text)
    setTempCardColor(defaults.card)
  }

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
    const query = searchQuery.trim()
    if (query) {
      navigateToSearch(query)
      setSearchOpen(false)
    }
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

            <div className="dropdown position-relative">
              <button
                className="nav-icon-btn"
                type="button"
                aria-label="Настройки"
                title="Настройки"
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.421 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.421-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.116l.094-.318z"/>
                </svg>
              </button>
              {settingsOpen && (
                <div className="dropdown-menu dropdown-menu-end show settings-dropdown" style={{ right: 0, left: 'auto', minWidth: '280px' }}>
                  <div className="px-3 py-2">
                    <div className="mb-3">
                      <label className="form-label small text-muted mb-1">Тема</label>
                      <div className="d-flex gap-2">
                        <button className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => applyTheme('light')}>Светлая</button>
                        <button className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => applyTheme('dark')}>Тёмная</button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-muted mb-1">Цвет фона</label>
                      <div className="d-flex gap-2 align-items-center">
                        <input type="color" className="form-control form-control-color" value={tempBgColor || themeDefaults[theme].bg} onChange={(e) => setTempBgColor(e.target.value)} style={{ width: '40px', height: '32px' }} />
                        <input type="text" className="form-control form-control-sm" value={tempBgColor || themeDefaults[theme].bg} onChange={(e) => setTempBgColor(e.target.value)} style={{ width: '100px' }} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-muted mb-1">Цвет текста</label>
                      <div className="d-flex gap-2 align-items-center">
                        <input type="color" className="form-control form-control-color" value={tempTextColor || themeDefaults[theme].text} onChange={(e) => setTempTextColor(e.target.value)} style={{ width: '40px', height: '32px' }} />
                        <input type="text" className="form-control form-control-sm" value={tempTextColor || themeDefaults[theme].text} onChange={(e) => setTempTextColor(e.target.value)} style={{ width: '100px' }} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small text-muted mb-1">Цвет карточек</label>
                      <div className="d-flex gap-2 align-items-center">
                        <input type="color" className="form-control form-control-color" value={tempCardColor || themeDefaults[theme].card} onChange={(e) => setTempCardColor(e.target.value)} style={{ width: '40px', height: '32px' }} />
                        <input type="text" className="form-control form-control-sm" value={tempCardColor || themeDefaults[theme].card} onChange={(e) => setTempCardColor(e.target.value)} style={{ width: '100px' }} />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary flex-grow-1" onClick={handleSaveSettings}>
                        {saved ? '✓ Применено' : 'Применить'}
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={handleResetSettings}>Сбросить</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
              <Link href="/" className="habr-offcanvas-nav-item" onClick={() => { setBurgerOpen(false); window.history.pushState({}, '', '/'); window.dispatchEvent(new CustomEvent('tagChange', { detail: { tagSlug: '' } })); }}>
                <span className="habr-offcanvas-icon">🆕</span>
                <span>Что нового</span>
              </Link>
              <Link href="/" className="habr-offcanvas-nav-item" onClick={() => { setBurgerOpen(false); window.history.pushState({}, '', '/'); window.dispatchEvent(new CustomEvent('tagChange', { detail: { tagSlug: '' } })); }}>
                <span className="habr-offcanvas-icon">🌊</span>
                <span>Все потоки</span>
              </Link>

              <div className="habr-offcanvas-section-title">Development & Engineering</div>
              {[
                { icon: '⚙️', label: 'Backend', tagSlug: 'backend' },
                { icon: '🖥️', label: 'Frontend', tagSlug: 'frontend' },
                { icon: '📱', label: 'Mobile Development', tagSlug: 'mobile' },
                { icon: '🎮', label: 'GameDev', tagSlug: 'gamedev' },
                { icon: '🧪', label: 'Testing', tagSlug: 'testing' },
                { icon: '🤖', label: 'AI & ML', tagSlug: 'machine-learning' },
                { icon: '🏭', label: 'Industrial Engineering', tagSlug: 'engineering' },
              ].map(item => (
                <button
                  key={item.label}
                  className="habr-offcanvas-nav-item"
                  onClick={() => { setBurgerOpen(false); navigateToTag(item.tagSlug) }}
                  type="button"
                >
                  <span className="habr-offcanvas-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="habr-offcanvas-arrow">›</span>
                </button>
              ))}

              <div className="habr-offcanvas-section-title">Infrastructure & Data</div>
              {[
                { icon: '🛠️', label: 'System Administration', tagSlug: 'linux' },
                { icon: '🔒', label: 'Information Security', tagSlug: 'security' },
                { icon: '📊', label: 'System & Business Analysis', tagSlug: 'analysis' },
              ].map(item => (
                <button
                  key={item.label}
                  className="habr-offcanvas-nav-item"
                  onClick={() => { setBurgerOpen(false); navigateToTag(item.tagSlug) }}
                  type="button"
                >
                  <span className="habr-offcanvas-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="habr-offcanvas-arrow">›</span>
                </button>
              ))}

              <div className="habr-offcanvas-right">
                <div className="habr-offcanvas-block">
                  <div className="habr-offcanvas-block-title">
                    Technologies <Link href="/" className="habr-offcanvas-all" onClick={() => setBurgerOpen(false)}>All →</Link>
                  </div>
                  <div className="habr-offcanvas-tags-grid">
                    {[
                      { name: 'Python', slug: 'python' },
                      { name: 'C++', slug: 'cpp' },
                      { name: 'Java', slug: 'java' },
                      { name: 'Go', slug: 'go' },
                      { name: 'PostgreSQL', slug: 'postgresql' },
                      { name: 'Rust', slug: 'rust' },
                      { name: 'Linux', slug: 'linux' },
                      { name: 'Kotlin', slug: 'kotlin' },
                    ].map(t => (
                      <button
                        key={t.slug}
                        className="habr-offcanvas-tag"
                        onClick={() => { setBurgerOpen(false); navigateToTag(t.slug) }}
                        type="button"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="habr-offcanvas-block">
                  <div className="habr-offcanvas-block-title">
                    Topics <Link href="/" className="habr-offcanvas-all" onClick={() => setBurgerOpen(false)}>All →</Link>
                  </div>
                  <div className="habr-offcanvas-tags-grid">
                    {tags.length > 0
                      ? tags.slice(0, 8).map(tag => (
                          <button
                            key={tag.id}
                            className="habr-offcanvas-tag"
                            onClick={() => { setBurgerOpen(false); navigateToTag(tag.slug) }}
                            type="button"
                          >
                            {tag.name}
                          </button>
                        ))
                      : ['IT Career', 'Artificial Intelligence', 'Web Development', 'Algorithms'].map(t => (
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
