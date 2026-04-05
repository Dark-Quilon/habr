# Отчёт 4: Django-проект

## Статус: ВЫПОЛНЕНО ✅

## Структура проекта

```
Habr/
├── manage.py
├── requirements.txt
├── mysite/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── blog/
    ├── __init__.py
    ├── apps.py
    ├── models.py
    ├── views.py
    ├── forms.py
    ├── urls.py
    ├── cache.py
    ├── signals.py
    ├── context_processors.py
    ├── templatetags/
    │   ├── __init__.py
    │   └── markdown_extras.py
    ├── templates/
    │   ├── blog/
    │   │   ├── base.html
    │   │   └── article_list.html
    │   └── registration/
    │       ├── login.html
    │       └── register.html
    └── static/
        └── blog/
            └── style.css
```

## requirements.txt

```
django>=4.2,<5.0
gunicorn>=21.2
django-redis>=5.4
python-slugify>=8.0
markdown>=3.5
Pillow>=10.0
whitenoise>=6.6
pytest-django>=4.7
hypothesis>=6.100
pytest-cov>=4.1
```

## settings.py — ключевые настройки

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `REDIS_URL` читаются из переменных окружения
- `ALLOWED_HOSTS` разбивается по запятой: `os.environ.get(...).split(',')`
- Redis кэш через `django_redis` с `DJANGO_REDIS_IGNORE_EXCEPTIONS = True`
- `STATIC_ROOT = BASE_DIR / 'staticfiles'`
- `MEDIA_ROOT = BASE_DIR / 'media'`
- WhiteNoise для раздачи статики через Gunicorn

## Модели (blog/models.py)

| Модель | Поля | Назначение |
|--------|------|-----------|
| Profile | user, avatar, bio | Профиль пользователя |
| Tag | name, slug | Теги статей |
| Article | title, slug, author, content, tags, status, views, created_at | Статья |
| Comment | article, author, content, created_at | Комментарий |
| Vote | article, user, value (+1/-1) | Голосование |
| Follow | follower, author | Подписки |
| Notification | recipient, actor, article, is_read | Уведомления |

Метод `Article.rating()` → upvotes − downvotes
Метод `Article.save()` → автогенерация уникального slug через python-slugify

## Сигналы

`post_save` на `User` → автоматически создаёт `Profile` при регистрации.

## Вспомогательные файлы

### blog/cache.py
Функции для работы с Redis:
- `get_cached_article(slug)` / `set_cached_article(slug, article)` — TTL 300 сек
- `get_cached_article_list(...)` / `set_cached_article_list(...)` — TTL 60 сек
- `invalidate_article(slug)` — инвалидация при мутации
- `invalidate_article_lists()` — инвалидация всех списков

### blog/templatetags/markdown_extras.py
Фильтр `|markdownify` — рендерит Markdown в HTML с расширениями `fenced_code` и `tables`.

### blog/context_processors.py
Добавляет `unread_notifications_count` в контекст всех шаблонов.

## Миграции

```powershell
docker compose exec web python manage.py makemigrations blog
docker compose exec web python manage.py migrate
```

Применяются автоматически при каждом `docker compose up` через команду в `docker-compose.yml`.
