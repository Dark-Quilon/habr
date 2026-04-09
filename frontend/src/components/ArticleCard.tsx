import { h } from 'preact'
import { Link } from 'preact-router'
import { navigateToTag } from '../lib/navigation'

export default function ArticleCard({ article, compact = false }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60) // минуты
    
    if (diff < 1) return 'только что'
    if (diff < 60) return `${diff} мин назад`
    if (diff < 1440) return `${Math.floor(diff / 60)} ч назад`
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (compact) {
    return (
      <div className="article-card article-card-compact">
        <div className="article-card-meta mb-2">
          <Link href={`/profile/${article.author?.username}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: '600' }}>
            {article.author?.username}
          </Link>
          {' · '}{formatDate(article.created_at)}
        </div>
        
        <div className="article-card-title mb-2">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </div>

        <div className="d-flex align-items-center gap-3 text-muted small mb-2">
          <span>🕐 {formatDate(article.created_at)}</span>
          <span>👁 {article.views}</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-card-tags mb-2">
            {article.tags.slice(0, 5).map(tag => (
              <button key={tag.id || tag.slug} onClick={() => navigateToTag(tag.slug)} className="article-card-tag" type="button">
                {tag.name}
              </button>
            ))}
          </div>
        )}

        <div className="article-card-footer">
          <span>▲ {article.rating ?? 0}</span>
          <span>💬 {article.comments_count ?? 0}</span>
          <span>👁 {article.views}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="article-card">
      <div className="article-card-title">
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </div>
      <div className="article-card-meta">
        <Link href={`/profile/${article.author?.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {article.author?.username}
        </Link>
        {' · '}{formatDate(article.created_at)}
        {' · '}{article.views} просмотров
      </div>
      {article.tags && article.tags.length > 0 && (
        <div className="article-card-tags">
          {article.tags.map(tag => (
            <button key={tag.id || tag.slug} onClick={() => navigateToTag(tag.slug)} className="article-card-tag" type="button">
              {tag.name}
            </button>
          ))}
        </div>
      )}
      <div className="article-card-content" dangerouslySetInnerHTML={{ __html: article.preview || article.content?.substring(0, 300) + '...' }} />
      <div className="article-card-footer">
        <span>▲ {article.rating ?? 0}</span>
        <span>💬 {article.comments_count ?? 0}</span>
        <span>👁 {article.views}</span>
      </div>
    </div>
  )
}
