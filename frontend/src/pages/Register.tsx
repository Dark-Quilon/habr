import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { register, setToken } from '../lib/api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password1 !== password2) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      const data = await register(username, password1, password2)
      setToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      route('/')
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Ошибка регистрации')
    }
    setLoading(false)
  }

  return (
    <div className="container py-5">
      <div className="form-container">
        <h2 className="mb-4 text-center">Регистрация</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Имя пользователя</label>
            <input type="text" className="form-control" value={username} onInput={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Пароль</label>
            <input type="password" className="form-control" value={password1} onInput={(e) => setPassword1(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Подтвердите пароль</label>
            <input type="password" className="form-control" value={password2} onInput={(e) => setPassword2(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-center mt-3">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  )
}
