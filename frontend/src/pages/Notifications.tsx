import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router'
import { getNotifications, markNotificationsRead, getStoredUser } from '../lib/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getStoredUser()

  useEffect(() => {
    if (!user) return
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data.results || data || [])
      await markNotificationsRead()
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="error-message">Войдите, чтобы видеть уведомления. <a href="/login">Войти</a></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Уведомления</h1>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-muted py-4">Нет уведомлений</div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
            <Link href={`/articles/${n.article?.slug}`}>
              <strong>{n.actor?.username}</strong> оставил(а) реакцию на статью «{n.article?.title}»
            </Link>
            <div className="text-muted small">{new Date(n.created_at).toLocaleString('ru-RU')}</div>
          </div>
        ))
      )}
    </div>
  )
}
