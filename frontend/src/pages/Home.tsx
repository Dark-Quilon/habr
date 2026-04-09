import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { Link, route } from 'preact-router'
import { getArticles, getTags, getStoredUser } from '../lib/api'
import ArticleCard from '../components/ArticleCard'
import Pagination from '../components/Pagination'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')

  const paramsRef = useRef({ page: 1, search: '', activeTag: '' })

  // Функция для чтения параметров URL
  const readUrlParams = () => {
    const params = new URLSearchParams(window.location.search)
    const p = parseInt(params.get('page')) || 1
    const s = params.get('search') || ''
    const t = params.get('tags__slug') || ''
    setPage(p)
    setSearch(s)
    setActiveTag(t)
  }

  // Читаем параметры при монтировании
  useEffect(() => {
    readUrlParams()
  }, [])

  // Обработчик кастомных событий для навигации без перезагрузки
  useEffect(() => {
    const handleTagChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      console.log('tagChange event:', detail.tagSlug)
      setActiveTag(detail.tagSlug || '')
      setSearch('')
      setPage(1)
    }

    const handleSearchChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      console.log('searchChange event:', detail.search)
      setSearch(detail.search || '')
      setActiveTag('')
      setPage(1)
    }

    // Обработчик для кнопок назад/вперёд
    const handlePopState = () => {
      console.log('popstate event')
      readUrlParams()
    }

    window.addEventListener('tagChange', handleTagChange)
    window.addEventListener('searchChange', handleSearchChange)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('tagChange', handleTagChange)
      window.removeEventListener('searchChange', handleSearchChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    getTags().then(() => {}).catch(() => {})
  }, [])

  // Загружаем статьи при изменении параметров
  useEffect(() => {
    console.log('loadData triggered:', { page, search, activeTag })
    paramsRef.current = { page, search, activeTag }

    const loadArticles = async () => {
      setLoading(true)
      try {
        const params: any = { page }
        if (search) params.search = search
        if (activeTag) params.tags__slug = activeTag
        console.log('API call params:', params)
        const data = await getArticles(params)
        console.log('API response:', data)
        setArticles(data.results || [])
        setCount(data.count || 0)
      } catch (err) {
        console.error('Failed to load articles:', err)
      }
      setLoading(false)
    }

    loadArticles()
  }, [page, search, activeTag])

  return (
    <div className="container py-4">
      <div className="row">
        {/* Основной контент */}
        <div className="col-lg-8">
          {/* Моя лента */}
          <div className="mb-4 p-3 border rounded bg-white">
            <h2 className="h5 mb-2">Моя лента</h2>
            {getStoredUser() ? (
              <Link href="/feed" className="btn btn-sm btn-outline-secondary">Настройки ленты</Link>
            ) : (
              <p className="mb-0 text-muted small">
                Войдите, чтобы видеть свою ленту.{' '}
                <Link href="/login">Войти</Link>
              </p>
            )}
          </div>

          {/* Список статей */}
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-5 bg-white rounded">
              <div className="mb-3" style={{ fontSize: '3rem' }}>🔍</div>
              <h3 className="h5 mb-2">Статьи не найдены</h3>
              <p className="text-muted">
                {search ? `По запросу "${search}" ничего не найдено.` : 'Пока нет опубликованных статей.'}
              </p>
              {search && (
                <Link href="/" className="btn btn-sm btn-outline-primary mt-2">Показать все статьи</Link>
              )}
            </div>
          ) : (
            <>
              {articles.map(article => (
                <ArticleCard key={article.slug || article.id} article={article} compact={true} />
              ))}
              <Pagination count={count} page={page} searchParams={{ ...(search ? { search } : {}), ...(activeTag ? { tags__slug: activeTag } : {}) }} />
            </>
          )}
        </div>

        {/* Боковая панель */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="bg-white rounded p-3 sticky-top" style={{ top: '80px' }}>
            <h6 className="text-uppercase text-muted small fw-bold mb-3">Читают сейчас</h6>
            {loading ? (
              <div className="text-muted small">Загрузка...</div>
            ) : (
              <div>
                {articles.slice(0, 5).map((article, idx) => (
                  <div key={article.slug || article.id} className="mb-3 pb-3 border-bottom">
                    <Link href={`/articles/${article.slug}`} className="text-decoration-none">
                      <div className="fw-bold small mb-1" style={{ lineHeight: '1.3' }}>{article.title}</div>
                    </Link>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <span>👁 {article.views}</span>
                      <span>💬 {article.comments_count ?? 0}</span>
                      <span className="text-success">+{article.rating ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
