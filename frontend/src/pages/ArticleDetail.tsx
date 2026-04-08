import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link, route } from 'preact-router'
import { getArticle, getStoredUser } from '../lib/api'
import VoteButtons from '../components/VoteButtons'
import CommentSection from '../components/CommentSection'

export default function ArticleDetail({ slug }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = getStoredUser()

  useEffect(() => {
    loadArticle()
  }, [slug])

  const loadArticle = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getArticle(slug)
      setArticle(data)
    } catch (err) {
      setError('Статья не найдена')
    }
    setLoading(false)
  }

  if (loading) return <div className="container py-4"><div className="loading">Загрузка...</div></div>
  if (error) return <div className="container py-4"><div className="error-message">{error}</div></div>
  if (!article) return null

  return (
    <div className="container py-4">
      <article className="article-card">
        <h1 className="mb-3">{article.title}</h1>
        <div className="article-card-meta mb-3">
          <Link href={`/profile/${article.author?.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {article.author?.username}
          </Link>
          {' · '}{new Date(article.created_at).toLocaleDateString('ru-RU')}
          {' · '}{article.views} просмотров
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-card-tags mb-3">
            {article.tags.map(tag => (
              <Link key={tag.id || tag.slug} href={`/?tags__slug=${tag.slug}`} className="article-card-tag">
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="d-flex align-items-center gap-3 mb-3">
          <VoteButtons article={article} />
          {user && user.username === article.author?.username && (
            <div className="ms-auto d-flex gap-2">
              <Link href={`/articles/${article.slug}/edit`} className="btn btn-sm btn-outline-primary">Редактировать</Link>
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={async () => {
                  if (confirm('Удалить статью? Это действие нельзя отменить.')) {
                    try {
                      const { deleteArticle } = await import('../lib/api')
                      await deleteArticle(article.slug)
                      route('/')
                    } catch (err) {
                      console.error('Delete error:', err)
                      alert('Ошибка при удалении статьи')
                    }
                  }
                }}
              >
                Удалить
              </button>
            </div>
          )}
        </div>

        <div className="article-card-content" dangerouslySetInnerHTML={{ __html: article.content_html || article.content }} />
      </article>

      <CommentSection articleSlug={slug} />
    </div>
  )
}
