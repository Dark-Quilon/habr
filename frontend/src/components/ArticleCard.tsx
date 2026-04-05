import { h } from 'preact'
import { Link } from 'preact-router'

export default function ArticleCard({ article }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
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
            <Link key={tag.id || tag.slug} href={`/?tags__slug=${tag.slug}`} className="article-card-tag">
              {tag.name}
            </Link>
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
