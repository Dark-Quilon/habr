import { h } from 'preact'
import { Link } from 'preact-router'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 text-muted">404</h1>
      <p className="lead">Страница не найдена</p>
      <Link href="/" className="btn btn-primary">На главную</Link>
    </div>
  )
}
