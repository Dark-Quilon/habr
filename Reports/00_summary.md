# Полный отчёт: Клон Хабра

## Статус: ЭТАПЫ 1-4 ЗАВЕРШЕНЫ ✅

---

## 1. Инфраструктура Docker

### Файлы

| Файл | Статус | Что делает |
|------|--------|-----------|
| `Dockerfile` | ✅ | `python:3.12-slim`, копирует `requirements.txt` первым (кэш слоя), `collectstatic`, Gunicorn 2 workers |
| `docker-compose.yml` | ✅ | Сервисы `web` + `redis`, `./db.sqlite3` монтируется на хост, `migrate` при каждом старте |
| `.env` | ✅ | Локальные переменные: SECRET_KEY, DEBUG, ALLOWED_HOSTS, REDIS_URL |
| `.env.example` | ✅ | Шаблон без секретов — безопасно коммитить |
| `.gitignore` | ✅ | Исключает `.env`, `db.sqlite3`, `media/`, `staticfiles/`, `__pycache__/`, `.venv/` |
| `.dockerignore` | ✅ | Исключает `.venv`, `__pycache__`, `*.pyc`, `.git`, `media/`, `Plan/` из образа |

### Redis

| Параметр | Значение |
|---------|---------|
| Образ | `redis:7-alpine` |
| Лимит памяти | 256 МБ |
| Политика вытеснения | `allkeys-lru` |
| Сохранение на диск | отключено (`--save ""`) |
| Подключение из Django | `redis://redis:6379/1` |
| Обработка ошибок | `DJANGO_REDIS_IGNORE_EXCEPTIONS = True` |

---

## 2. Django-проект

### Конфигурация

| Файл | Статус | Описание |
|------|--------|---------|
| `mysite/settings.py` | ✅ | Все секреты из env vars, Redis кэш, WhiteNoise для статики, `STATIC_ROOT`, `MEDIA_ROOT` |
| `mysite/urls.py` | ✅ | auth URLs, blog URLs, media URLs |
| `mysite/wsgi.py` | ✅ | WSGI для Gunicorn |
| `manage.py` | ✅ | Точка входа Django |
| `requirements.txt` | ✅ | django, gunicorn, django-redis, python-slugify, markdown, Pillow, whitenoise, pytest-django, hypothesis |
| `pytest.ini` | ✅ | `DJANGO_SETTINGS_MODULE = mysite.settings` |

---

## 3. Приложение blog

### Модели (`blog/models.py`) ✅

| Модель | Поля | Особенности |
|--------|------|------------|
| `Profile` | user, avatar, bio | OneToOne с User, аватар в `avatars/` |
| `Tag` | name, slug | slug автогенерируется через python-slugify |
| `Article` | title, slug, author, content, tags, status, views, created_at, updated_at | slug уникален, автогенерация с суффиксом при коллизии; метод `rating()` |
| `Comment` | article, author, content, created_at | ordering по `created_at` (хронологически) |
| `Vote` | article, user, value (+1/-1) | `unique_together = ('article', 'user')` |
| `Follow` | follower, author | `unique_together = ('follower', 'author')` |
| `Notification` | recipient, actor, article, is_read, created_at | ordering по `-created_at` |

### Views (`blog/views.py`) ✅

| View | URL | Описание |
|------|-----|---------|
| `ArticleListView` | `/` | Список опубликованных статей, кэш 60 сек, сортировка |
| `ArticleDetailView` | `/article/<slug>/` | Детальная страница, кэш 300 сек, счётчик просмотров |
| `ArticleCreateView` | `/article/new/` | Создание статьи, `@login_required` |
| `ArticleEditView` | `/article/<slug>/edit/` | Редактирование, только автор |
| `ArticleDeleteView` | `/article/<slug>/delete/` | Удаление, только автор |
| `RegisterView` | `/register/` | Регистрация, редирект если уже авторизован |

### Формы (`blog/forms.py`) ✅

| Форма | Поля | Особенности |
|-------|------|------------|
| `ArticleForm` | title, content, status, tags_input | Метод `save_tags(article)` — логика тегов в одном месте |
| `CommentForm` | content | Валидация на непустоту |
| `ProfileForm` | avatar, bio | ImageField для аватара |

### Вспомогательные файлы ✅

| Файл | Описание |
|------|---------|
| `blog/cache.py` | `get/set_cached_article` (TTL 300с), `get/set_cached_article_list` (TTL 60с), `invalidate_article`, `invalidate_article_lists` |
| `blog/signals.py` | `post_save` на User → автосоздание Profile |
| `blog/context_processors.py` | `unread_notifications_count` в контексте всех шаблонов |
| `blog/apps.py` | Подключение сигналов через `ready()` |
| `blog/admin.py` | Регистрация всех 7 моделей в Django Admin |
| `blog/templatetags/markdown_extras.py` | Фильтр `\|markdownify` с расширениями `fenced_code` и `tables` |

### Шаблоны ✅

| Шаблон | Описание |
|--------|---------|
| `blog/base.html` | Навигация, счётчик уведомлений, ссылки login/logout/register |
| `blog/article_list.html` | Список статей, кнопка "Написать статью" для авторизованных |
| `blog/article_detail.html` | Markdown-рендеринг, комментарии, кнопки редактирования/удаления для автора |
| `blog/article_form.html` | Форма создания/редактирования |
| `blog/article_confirm_delete.html` | Подтверждение удаления |
| `registration/login.html` | Форма входа + ссылка на регистрацию |
| `registration/register.html` | Форма регистрации + ссылка на вход |

### Management команды ✅

| Команда | Описание |
|---------|---------|
| `seed_articles` | Создаёт пользователей alice/bob (пароль `pass1234!`), 10 опубликованных статей + 1 черновик, комментарии, голоса |

---

## 4. Redis кэш — подключён к views ✅

| Компонент | TTL | Инвалидация |
|-----------|-----|------------|
| `article:<slug>` | 300 сек | При редактировании, удалении, голосовании, комментарии |
| `article_list:<sort>:<tag>:<page>` | 60 сек | При создании, редактировании, удалении статьи |

---

## 5. Миграции ✅

Все миграции применены. Таблицы созданы для всех 7 моделей.

---

## Что работает прямо сейчас

| URL | Функция |
|-----|---------|
| `http://localhost:8000/` | Список статей |
| `http://localhost:8000/article/<slug>/` | Детальная страница с Markdown |
| `http://localhost:8000/article/new/` | Создание статьи (нужен вход) |
| `http://localhost:8000/article/<slug>/edit/` | Редактирование (только автор) |
| `http://localhost:8000/article/<slug>/delete/` | Удаление (только автор) |
| `http://localhost:8000/accounts/login/` | Вход |
| `http://localhost:8000/register/` | Регистрация |
| `http://localhost:8000/admin/` | Django Admin |

---

## Команды

```powershell
# Запустить
docker compose up --build

# Тестовые данные
docker compose exec web python manage.py seed_articles

# Суперпользователь
docker compose exec web python manage.py createsuperuser

# Миграции
docker compose exec web python manage.py makemigrations blog
docker compose exec web python manage.py migrate

# Сбросить кэш
docker compose exec redis redis-cli -n 1 FLUSHDB
```

---

## Статус: ВСЕ ЭТАПЫ ЗАВЕРШЕНЫ ✅

---

## Детальные отчёты

| Файл | Содержание |
|------|-----------|
| `Reports/01_docker_infrastructure.md` | .gitignore, .env, .dockerignore |
| `Reports/02_dockerfile.md` | Dockerfile с объяснением каждой строки |
| `Reports/03_docker_compose.md` | docker-compose.yml, тома, команды |
| `Reports/04_django_setup.md` | Структура проекта, модели |
| `Reports/05_redis.md` | Redis конфигурация и кэширование |
| `Reports/06_features_and_search.md` | Комментарии, голоса, профили, подписки, лента, уведомления, поиск, сортировка, пагинация |
| `Reports/07_tests_templates_css.md` | Тесты (pytest + Hypothesis), шаблоны, CSS, seed_articles, исправления docker-compose |


---

## Дополнение: Что отсутствует в проекте

### 1. Навигация (base.html) — актуальное состояние

После последних изменений навигация выглядит так:

| Пользователь | Ссылки |
|-------------|--------|
| Авторизованный | Главная \| Лента \| + Написать статью \| username (→ профиль) \| 🔔 \| Выйти |
| Гость | Главная \| Войти \| Регистрация |

"Мои статьи" перенесена на страницу профиля (видна только владельцу).
"+ Написать статью" убрана из `article_list.html` (под поисковиком), осталась только в навбаре и на странице `my_articles.html`.

---

### 2. Чего не хватает

#### Тесты

| Что отсутствует | Описание |
|----------------|---------|
| Тест `my_articles` | Нет теста для `GET /my-articles/` — проверка что возвращает 200 и показывает черновики |
| Тест `feed` | Нет теста для `GET /feed/` — проверка ленты подписок |
| Тест `notifications` | Нет теста что уведомления помечаются прочитанными при просмотре |
| Тест `profile_edit` | Нет теста редактирования профиля |
| Тест `article_edit` | Нет теста что чужую статью нельзя редактировать (должен быть 404) |
| Тест `article_delete` | Нет теста что чужую статью нельзя удалить |
| Тест `comment_delete` | Нет теста что чужой комментарий нельзя удалить |
| Тест поиска по тегу | Нет теста `?tag=python` |
| Тест сортировки | Нет тестов `?sort=popular` и `?sort=rating` |
| Тест пагинации | Нет теста что пагинация работает при > 10 статей |
| Property-тест для `follow` | Нет property-теста уникальности подписок |
| Property-тест для `comment` | Нет property-теста что комментарий всегда привязан к статье |

#### Безопасность

| Что отсутствует | Описание |
|----------------|---------|
| CSRF на `vote` | Форма голосования использует POST с CSRF — ✅ есть, но нет теста на это |
| XSS в Markdown | `markdownify` использует `mark_safe` без санитизации HTML — потенциальная XSS уязвимость. Нет `bleach` или `nh3` для очистки HTML |
| Rate limiting | Нет ограничения на количество запросов (комментарии, голоса, регистрация) |
| `LOGIN_URL` в `urls.py` | `profile_edit` использует `/profile/edit/me/` — URL может конфликтовать с `profile/<username>/` если username = `edit` |

#### Функциональность

| Что отсутствует | Описание |
|----------------|---------|
| Черновики недоступны по URL | `ArticleDetailView` фильтрует `status=published` — автор не может просмотреть свой черновик по прямой ссылке |
| Нет превью статьи | В списке статей нет краткого описания/превью контента |
| Нет счётчика комментариев в списке | `article_list.html` не показывает количество комментариев к статье |
| Нет RSS/Atom ленты | Нет машиночитаемой ленты для подписки |
| Нет поиска по автору | Поиск работает по заголовку, контенту и тегам, но не по имени автора |
| Нет пагинации в `my_articles` | `my_articles` возвращает все статьи без пагинации |
| Нет пагинации в `profile` | Страница профиля показывает все статьи автора без пагинации |
| Нет сортировки в `feed` | Лента только по дате, нет других вариантов |

#### Инфраструктура

| Что отсутствует | Описание |
|----------------|---------|
| Health check для Redis | В `docker-compose.yml` нет `healthcheck` для Redis — `web` стартует без гарантии что Redis готов |
| `depends_on: condition` | `depends_on: redis` без `condition: service_healthy` — не гарантирует готовность Redis |
| Логирование | Нет настройки `LOGGING` в `settings.py` — ошибки Django не пишутся в файл |
| `SECURE_*` настройки | Нет `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE` для продакшена |
| Бэкап БД | Нет скрипта/инструкции для резервного копирования `db.sqlite3` |

#### Документация

| Что отсутствует | Описание |
|----------------|---------|
| `README.md` | Нет файла с инструкцией по запуску проекта |
| Описание API | Нет документации по URL-маршрутам для новых разработчиков |
| Описание переменных окружения | `.env.example` есть, но нет подробного описания каждой переменной |

---

### 3. Мелкие несоответствия

| Файл | Проблема |
|------|---------|
| `article_detail.html` | `{{ article.rating }}` — вызывает метод без скобок, в Django это работает, но семантически неочевидно |
| `my_articles.html` | Ссылка "Детальная страница черновика" ведёт на 404 (черновики не отдаются `ArticleDetailView`) |
| `Reports/06_features_and_search.md` | Упоминает "Мои статьи" в навбаре — устарело после последних изменений |
| `Reports/07_tests_templates_css.md` | Упоминает "Мои статьи" в навбаре — устарело |
