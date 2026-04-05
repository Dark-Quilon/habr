import { h } from 'preact'
import ArticleCard from './ArticleCard'

export default function ArticleList({ articles }) {
  if (!articles || articles.length === 0) {
    return <div className="text-center py-4 text-muted">Статьи не найдены</div>
  }

  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.slug || article.id} article={article} />
      ))}
    </div>
  )
}
