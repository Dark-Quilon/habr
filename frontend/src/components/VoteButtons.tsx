import { h } from 'preact'
import { useState } from 'preact/hooks'
import { voteArticle } from '../lib/api'

export default function VoteButtons({ article, onVote }) {
  const [rating, setRating] = useState(article.rating ?? 0)
  const [userVote, setUserVote] = useState(article.user_vote ?? 0)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await voteArticle(article.slug, value)
      setRating(data.rating)
      setUserVote(data.user_vote ?? 0)
      if (onVote) onVote(data)
    } catch (err) {
      console.error('Vote error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="vote-buttons d-flex align-items-center gap-2">
      <button
        className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`}
        onClick={() => handleVote(1)}
        disabled={loading}
      >
        ▲
      </button>
      <span className="fw-bold" style={{ minWidth: '2rem', textAlign: 'center' }}>{rating}</span>
      <button
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={loading}
      >
        ▼
      </button>
    </div>
  )
}
