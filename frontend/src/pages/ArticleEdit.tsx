import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { getArticle, updateArticle, getStoredUser } from '../lib/api'

export default function ArticleEdit({ slug }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = getStoredUser()
  if (!user) {
    route('/login')
    return null
  }

  useEffect(() => {
    loadArticle()
  }, [slug])

  const loadArticle = async () => {
    try {
      const data = await getArticle(slug)
      setTitle(data.title)
      setContent(data.content)
      if (data.tags) {
        setTags(data.tags.map(t => t.name).join(', '))
      }
    } catch (err) {
      setError('Статья не найдена')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
      const article = await updateArticle(slug, { title, content, tag_names: tagList })
      route(`/articles/${article.slug}`)
    } catch (err) {
      setError(err.message || 'Ошибка обновления')
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <div className="form-container">
        <h2 className="mb-4">Редактировать статью</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Заголовок</label>
            <input type="text" className="form-control" value={title} onInput={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Содержание</label>
            <textarea className="form-control" rows="10" value={content} onInput={(e) => setContent(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Теги (через запятую)</label>
            <input type="text" className="form-control" value={tags} onInput={(e) => setTags(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
