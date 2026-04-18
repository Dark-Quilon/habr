import { h } from 'preact'
import { Link } from 'preact-router'
import { getStoredUser } from '../lib/api'

export default function Footer() {
  const user = getStoredUser()

  return (
    <footer className="habr-footer">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3">
            <div className="habr-footer-title">Ваш аккаунт</div>
            <ul className="list-unstyled">
              {user ? (
                <>
                  <li><Link href={`/profile/${user.username}`}>Профиль</Link></li>
                  <li><Link href="/feed">Лента</Link></li>
                  <li><Link href="/pwa">ППА</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login">Войти</Link></li>
                  <li><Link href="/register">Регистрация</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="col-md-6 mb-3 text-md-end">
            <div className="habr-footer-title">Соцсети</div>
            <div className="habr-footer-social justify-content-md-end">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#1877f2' }}>f</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#1da1f2' }}>𝕏</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#ff0000' }}>▶</a>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <div className="text-center" style={{ fontSize: '0.875rem' }}>
          © 2026 Клон Habr.com
        </div>
      </div>
    </footer>
  )
}
