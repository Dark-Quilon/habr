import { h } from 'preact'
import { useState } from 'preact/hooks'
import { voteArticle, getStoredUser } from '../lib/api'
import { route } from 'preact-router'

export default function VoteButtons({ article, onVote }) {
  const [rating, setRating] = useState(article.rating ?? 0)
  const [userVote, setUserVote] = useState(article.user_vote ?? 0)
  const [loading, setLoading] = useState(false)
  const user = getStoredUser()

  const handleVote = async (value) => {
    if (loading) return
    if (!user) {
      route('/login')
      return
    }
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
        title={user ? 'Голосовать за' : 'Войдите для голосования'}
      >
        ▲
      </button>
      <span className="fw-bold" style={{ minWidth: '2rem', textAlign: 'center' }}>{rating}</span>
      <button
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
        onClick={() => handleVote(-1)}
        disabled={loading}
        title={user ? 'Голосовать против' : 'Войдите для голосования'}
      >
        ▼
      </button>
    </div>
  )
}
