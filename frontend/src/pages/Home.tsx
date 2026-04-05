import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router'
import { getArticles, getTags, getStoredUser } from '../lib/api'
import ArticleList from '../components/ArticleList'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = parseInt(params.get('page')) || 1
    const s = params.get('search') || ''
    const t = params.get('tags__slug') || ''
    setPage(p)
    setSearch(s)
    setActiveTag(t)
  }, [])

  useEffect(() => {
    loadData()
  }, [page, search, activeTag])

  useEffect(() => {
    getTags().then(setTags).catch(() => {})
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (activeTag) params.tags__slug = activeTag
      const data = await getArticles(params)
      setArticles(data.results || [])
      setCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load articles:', err)
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Статьи</h1>

      <div className="mb-3">
        <SearchBar defaultValue={search} />
      </div>

      {tags.length > 0 && (
        <div className="mb-4 d-flex flex-wrap gap-2">
          <Link
            href="/"
            className={`badge rounded-pill text-decoration-none fs-6 ${!activeTag ? 'bg-primary' : 'bg-secondary'}`}
          >
            Все
          </Link>
          {tags.map(tag => (
            <Link
              key={tag.id}
              href={`/?tags__slug=${tag.slug}`}
              className={`badge rounded-pill text-decoration-none fs-6 ${activeTag === tag.slug ? 'bg-primary' : 'bg-secondary'}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-4 p-3 border rounded">
        <h2 className="h5 mb-2">Моя лента</h2>
        {getStoredUser() ? (
          <Link href="/feed" className="btn btn-primary btn-sm">Перейти в ленту</Link>
        ) : (
          <p className="mb-1 text-muted">
            Войдите, чтобы видеть свою ленту.{' '}
            <Link href="/login">Войти</Link>
          </p>
        )}
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <>
          <ArticleList articles={articles} />
          <Pagination count={count} page={page} searchParams={{ ...(search ? { search } : {}), ...(activeTag ? { tags__slug: activeTag } : {}) }} />
        </>
      )}
    </div>
  )
}
