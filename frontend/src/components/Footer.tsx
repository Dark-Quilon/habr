import { h } from 'preact'
import { Link } from 'preact-router'

export default function Footer() {
  return (
    <footer className="habr-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Проекты</div>
            <ul className="list-unstyled">
              <li><Link href="/">Habr</Link></li>
              <li><Link href="/">Q&A</Link></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Разработка</div>
            <ul className="list-unstyled">
              <li><Link href="/">Бэкенд</Link></li>
              <li><Link href="/">Фронтенд</Link></li>
              <li><Link href="/">Мобильная</Link></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Инфраструктура</div>
            <ul className="list-unstyled">
              <li><Link href="/">Администрирование</Link></li>
              <li><Link href="/">Безопасность</Link></li>
              <li><Link href="/">DevOps</Link></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Соцсети</div>
            <div className="habr-footer-social">
              <span className="habr-footer-social-icon" style={{ color: '#1877f2' }}>f</span>
              <span className="habr-footer-social-icon" style={{ color: '#1da1f2' }}>𝕏</span>
              <span className="habr-footer-social-icon" style={{ color: '#ff0000' }}>▶</span>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <div className="text-center" style={{ fontSize: '0.875rem' }}>
          © 2026 Habr Blog. Клон Habr.com
        </div>
      </div>
    </footer>
  )
}
