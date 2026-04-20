import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { getMyProfile, updateMyProfile, getStoredUser } from '../lib/api'

export default function ProfileEdit() {
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const user = getStoredUser()

  if (!user) {
    route('/login')
    return null
  }

  useEffect(() => {
    getMyProfile()
      .then(data => {
        setBio(data.bio || '')
        setUsername(data.user.username || '')
        setDisplayName(data.user.display_name || '')
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data: any = { bio }
      if (username !== user.username) data.username = username
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (displayName !== (storedUser.display_name || '')) data.display_name = displayName
      if (avatar) data.avatar = avatar
      const updatedProfile = await updateMyProfile(data)
      if (username !== user.username || data.display_name) {
        localStorage.setItem('user', JSON.stringify({ 
          ...user, 
          username: data.username || user.username,
          display_name: updatedProfile?.user?.display_name || displayName
        }))
      }
      route('/profile/me')
    } catch (err: any) {
      console.error('Profile update error:', err)
      alert(err?.message || 'Ошибка обновления профиля')
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <div className="form-container">
        <h2 className="mb-4">Редактировать профиль</h2>
        {loading && <div className="alert alert-info">Сохранение...</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Имя</label>
            <input type="text" className="form-control" value={displayName} onInput={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Логин</label>
            <input type="text" className="form-control" value={username} onInput={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">О себе</label>
            <textarea className="form-control" rows="4" value={bio} onInput={(e) => setBio(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
