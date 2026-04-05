import { h } from 'preact'
import { Link } from 'preact-router'
import { getStoredUser } from '../lib/api'

export default function Write() {
  const user = getStoredUser()

  return (
    <div className="container py-4">
      <h1 className="mb-4">Как стать автором</h1>

      <div className="write-tabs">
        <div className="write-tab active">Самое важное</div>
        <div className="write-tab">Новые авторы</div>
        <div className="write-tab">Ожидают приглашения</div>
      </div>

      <div className="write-card">
        <h3 className="h5 write-accent">Публикуйте качественный контент</h3>
        <p>Делитесь опытом, пишите подробные статьи с примерами кода и иллюстрациями.</p>
      </div>

      <div className="write-card">
        <h3 className="h5 write-accent">Следуйте правилам сообщества</h3>
        <p>Уважайте других участников, не публикуйте рекламу без согласования.</p>
      </div>

      <div className="write-card">
        <h3 className="h5 write-accent">Начните с малого</h3>
        <p>Напишите свою первую статью — даже небольшой опыт может быть полезен другим.</p>
      </div>

      {user ? (
        <Link href="/articles/new" className="btn btn-primary">Написать статью</Link>
      ) : (
        <p className="text-muted">
          <Link href="/login">Войдите</Link> чтобы начать публиковать
        </p>
      )}
    </div>
  )
}
