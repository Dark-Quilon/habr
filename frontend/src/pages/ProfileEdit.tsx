import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { getMyProfile, updateMyProfile, getStoredUser } from '../lib/api'

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=11',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=12',
]

export default function ProfileEdit() {
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState('')
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
        if (data.avatar) setSelectedAvatar(data.avatar)
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
      if (selectedAvatar) data.avatar_url = selectedAvatar
      const updatedProfile = await updateMyProfile(data)
      if (username !== user.username || data.display_name) {
        localStorage.setItem('user', JSON.stringify({ 
          ...user, 
          username: data.username || user.username,
          display_name: updatedProfile.user.display_name 
        }))
      }
      route(`/profile/${data.username || user.username}`)
    } catch (err) {
      alert('Ошибка обновления профиля')
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <div className="form-container">
        <h2 className="mb-4">Редактировать профиль</h2>
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
          <div className="mb-3">
            <label className="form-label">Аватар</label>
            <div className="d-flex flex-wrap gap-2">
              {PREDEFINED_AVATARS.map((url, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedAvatar(url)}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedAvatar === url ? '3px solid #0d6efd' : '3px solid transparent',
                    borderRadius: '50%',
                    padding: '2px',
                  }}
                >
                  <img src={url} width="50" height="50" alt={`Avatar ${i+1}`} />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
