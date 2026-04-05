import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { getFeed, getStoredUser } from '../lib/api'
import ArticleList from '../components/ArticleList'

export default function Feed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getStoredUser()

  useEffect(() => {
    if (!user) return
    loadFeed()
  }, [])

  const loadFeed = async () => {
    setLoading(true)
    try {
      const data = await getFeed()
      setArticles(data.results || data || [])
    } catch (err) {
      console.error('Failed to load feed:', err)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="error-message">Войдите, чтобы видеть ленту. <a href="/login">Войти</a></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Моя лента</h1>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}
