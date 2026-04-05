import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { login, setToken } from '../lib/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      setToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      route('/')
      window.location.reload()
    } catch (err) {
      setError('Неверный логин или пароль')
    }
    setLoading(false)
  }

  return (
    <div className="container py-5">
      <div className="form-container">
        <h2 className="mb-4 text-center">Вход</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="text-center mt-3">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  )
}
