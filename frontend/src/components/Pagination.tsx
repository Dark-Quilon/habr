import { h } from 'preact'
import { Link } from 'preact-router'

export default function Pagination({ count, page, searchParams = {} }) {
  const perPage = 10
  const totalPages = Math.ceil(count / perPage)

  if (totalPages <= 1) return null

  const buildUrl = (p) => {
    const params = new URLSearchParams({ ...searchParams, page: String(p) })
    return `/?${params.toString()}`
  }

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {page > 1 && (
          <li className="page-item">
            <Link className="page-link" href={buildUrl(page - 1)}>← Назад</Link>
          </li>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
          .map((p, idx, arr) => (
            <li key={p} className="page-item">
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="page-link disabled">...</span>}
              <Link className={`page-link ${p === page ? 'active' : ''}`} href={buildUrl(p)}>{p}</Link>
            </li>
          ))}
        {page < totalPages && (
          <li className="page-item">
            <Link className="page-link" href={buildUrl(page + 1)}>Вперёд →</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
