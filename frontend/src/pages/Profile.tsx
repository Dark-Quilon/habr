import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Link } from 'preact-router'
import { getProfile, followUser, getStoredUser } from '../lib/api'
import ArticleList from '../components/ArticleList'

export default function Profile({ username }) {
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const currentUser = getStoredUser()
  const isOwnProfile = currentUser && currentUser.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await getProfile(username)
      setProfile(data)
      setArticles(data.articles || [])
      setIsFollowing(data.is_following || false)
      setFollowersCount(data.followers_count || 0)
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    try {
      const data = await followUser(username)
      setIsFollowing(data.is_following)
      setFollowersCount(data.followers_count)
    } catch (err) {
      console.error('Follow error:', err)
      alert('Ошибка при подписке')
    }
  }

  if (loading) return <div className="container py-4"><div className="loading">Загрузка...</div></div>
  if (!profile) return <div className="container py-4"><div className="error-message">Профиль не найден</div></div>

  return (
    <div className="container py-4">
      <div className="profile-header">
        {profile.avatar || profile.avatar_url ? (
          <img src={profile.avatar_url || profile.avatar} alt={username} className="profile-avatar" />
        ) : (
          <div className="profile-avatar bg-secondary d-flex align-items-center justify-content-center text-white fs-2">
            {(profile.user.display_name || username)[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="mb-1">{profile.user.display_name || username}</h2>
          <p className="text-muted mb-2">@{username}</p>
          {profile.bio && <p className="text-muted mb-2">{profile.bio}</p>}
          <p className="text-muted mb-2">Подписчиков: {followersCount}</p>
          {currentUser && currentUser.username !== username && (
            <button className={`btn ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'} btn-sm`} onClick={handleFollow}>
              {isFollowing ? 'Отписаться' : 'Подписаться'}
            </button>
          )}
          {isOwnProfile && (
            <Link href="/profile/me" className="btn btn-outline-secondary btn-sm ms-2">Изменить</Link>
          )}
        </div>
      </div>

      <h3 className="h5 mb-3">Статьи</h3>
      <ArticleList articles={articles} />
    </div>
  )
}
