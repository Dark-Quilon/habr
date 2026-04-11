import { h } from 'preact'
import { Link } from 'preact-router'
import { navigateToTag } from '../lib/navigation'

export default function Footer() {
  return (
    <footer className="habr-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Проекты</div>
            <ul className="list-unstyled">
              <li><Link href="/">Habr</Link></li>
              <li><Link href="/?search=Q%26A">Q&A</Link></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Разработка</div>
            <ul className="list-unstyled">
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('backend')} type="button">Бэкенд</button></li>
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('frontend')} type="button">Фронтенд</button></li>
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('mobile')} type="button">Мобильная</button></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Инфраструктура</div>
            <ul className="list-unstyled">
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('linux')} type="button">Администрирование</button></li>
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('security')} type="button">Безопасность</button></li>
              <li><button className="footer-tag-btn" onClick={() => navigateToTag('devops')} type="button">DevOps</button></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3">
            <div className="habr-footer-title">Соцсети</div>
            <div className="habr-footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#1877f2' }}>f</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#1da1f2' }}>𝕏</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="habr-footer-social-icon" style={{ color: '#ff0000' }}>▶</a>
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
