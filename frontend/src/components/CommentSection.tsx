import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { getComments, addComment, deleteComment, getStoredUser } from '../lib/api'

export default function CommentSection({ articleSlug }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const user = getStoredUser()

  useEffect(() => {
    loadComments()
  }, [articleSlug])

  const loadComments = async () => {
    try {
      const data = await getComments(articleSlug)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await addComment(articleSlug, content)
      setContent('')
      loadComments()
    } catch (err) {
      alert('Ошибка при добавлении комментария')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить комментарий?')) return
    try {
      await deleteComment(articleSlug, id)
      loadComments()
    } catch (err) {
      alert('Ошибка при удалении комментария')
    }
  }

  return (
    <div className="mt-4">
      <h3 className="h5 mb-3">Комментарии ({comments.length})</h3>

      {comments.map(comment => (
        <div key={comment.id} className="card mb-2">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted">
                <a href={`/profile/${comment.author?.username}`} style={{ color: 'inherit' }}>
                  {comment.author?.username}
                </a>
                {' · '}{new Date(comment.created_at).toLocaleString('ru-RU')}
              </small>
              {user && comment.author?.username === user.username && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(comment.id)}>
                  Удалить
                </button>
              )}
            </div>
            <p className="mb-0">{comment.content}</p>
          </div>
        </div>
      ))}

      {user ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-2">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Написать комментарий..."
              value={content}
              onInput={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      ) : (
        <p className="text-muted mt-3">
          <a href="/login">Войдите</a> чтобы оставить комментарий
        </p>
      )}
    </div>
  )
}
