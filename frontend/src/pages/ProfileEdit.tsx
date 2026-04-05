import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { getMyProfile, updateMyProfile, getStoredUser } from '../lib/api'

export default function ProfileEdit() {
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
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
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { bio }
      if (avatar) data.avatar = avatar
      await updateMyProfile(data)
      route(`/profile/${user.username}`)
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
            <label className="form-label">О себе</label>
            <textarea className="form-control" rows="4" value={bio} onInput={(e) => setBio(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Аватар</label>
            <input type="file" className="form-control" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
