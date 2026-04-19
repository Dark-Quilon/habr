import { h } from 'preact'

export default function About() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">О проекте</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2>Что это?</h2>
          <p>Habr — это клон популярного российского IT-портала Habr.com. Здесь можно делиться знаниями, опытом и интересными мыслями с другими IT-специалистами.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2>Возможности</h2>
          <ul>
            <li><strong>Статьи</strong> — создавайте и публикуйте статьи на технические темы</li>
            <li><strong>Лента</strong> — персональная лента статей авторов, на которых вы подписаны</li>
            <li><strong>Рейтинг</strong> — ставьте лайки и дизлайки статьям</li>
            <li><strong>Комментарии</strong> — обсуждайте статьи в комментариях</li>
            <li><strong>Подписки</strong> — следите за авторами</li>
            <li><strong>Профили</strong> — персональные страницы авторов</li>
            <li><strong>Теги</strong> — тематические метки статей</li>
            <li><strong>Уведомления</strong> — получайте уведомления о реакциях</li>
            <li><strong>Жалобы</strong> — сообщайте о проблемном контенте</li>
          </ul>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2>Технологии</h2>
          <ul>
            <li><strong>Backend:</strong> Django, DRF, SQLite</li>
            <li><strong>Frontend:</strong> Preact, Vite, Bootstrap</li>
            <li><strong>Deployment:</strong> Render</li>
          </ul>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2>Как использовать</h2>
          <ol>
            <li>Зарегистрируйтесь или войдите</li>
            <li>Создайте статью кнопкой "Написать"</li>
            <li>Добавьте теги и контент</li>
            <li>Опубликуйте статью</li>
            <li>Делитесь ссылкой с другими</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2>Контакты</h2>
          <p>Это учебный проект. Автор: Dark-Quilon.</p>
        </div>
      </div>
    </div>
  )
}