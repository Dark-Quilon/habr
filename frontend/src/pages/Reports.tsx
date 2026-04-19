import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router'
import { getStoredUser } from '../lib/api'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getStoredUser()

  useEffect(() => {
    if (!user) return
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const { apiFetch } = await import('../lib/api')
      const data = await apiFetch<any>('/reports/')
      setReports(data.results || data || [])
    } catch (err) {
      console.error('Failed to load reports:', err)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="error-message">Войдите для просмотра репортов. <a href="/login">Войти</a></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Жалобы</h1>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : reports.length === 0 ? (
        <div className="text-center text-muted py-4">Нет жалоб</div>
      ) : (
        reports.map(r => (
          <div key={r.id} className={`card mb-3 ${r.resolved ? 'opacity-50' : ''}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  {r.article && (
                    <Link href={`/articles/${r.article.slug}`}>Статья: {r.article.title}</Link>
                  )}
                  {r.comment && (
                    <span>Комментарий: {r.comment.content?.slice(0, 50)}...</span>
                  )}
                </div>
                <span className={`badge ${r.resolved ? 'bg-success' : 'bg-warning'}`}>
                  {r.resolved ? 'Рассмотрено' : 'На рассмотрении'}
                </span>
              </div>
              <div className="mt-2">
                <strong>Причина:</strong> {r.reason} | <strong>От:</strong> {r.text || '—'}
              </div>
              <div className="text-muted small mt-1">
                от {r.reporter?.username} · {new Date(r.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}