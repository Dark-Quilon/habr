import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { createArticle, getStoredUser } from '../lib/api'

export default function ArticleNew() {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
      const article = await createArticle({ title, content, tag_names: tagList })
      route(`/articles/${article.slug}`)
    } catch (err) {
      setError(err.message || 'Ошибка создания статьи')
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <div className="form-container">
        <h2 className="mb-4">Новая статья</h2>
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
            <input type="text" className="form-control" value={tags} onInput={(e) => setTags(e.target.value)} placeholder="Python, Django, Backend" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}
