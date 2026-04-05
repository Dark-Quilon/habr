# Отчёт: Django REST API

## Статус: ЗАВЕРШЁН ✅

---

## Обзор

REST API на базе Django REST Framework (DRF) добавлен параллельно существующей MTV-архитектуре. Все эндпоинты доступны по префиксу `/api/v1/`. Существующий код в `blog/` не затронут.

---

## Новые зависимости

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| `djangorestframework` | >=3.15 | Основной фреймворк для REST API |
| `django-cors-headers` | >=4.3 | CORS для запросов с Next.js |
| `django-filter` | >=23.5 | Фильтрация queryset через URL-параметры |

---

## Структура приложения `api/`

```
api/
├── __init__.py
├── apps.py          — конфигурация приложения
├── urls.py          — маршруты API
├── serializers.py   — сериализаторы моделей
├── views.py         — ViewSet'ы и APIView
├── permissions.py   — кастомные права доступа
└── pagination.py    — стандартная пагинация
```

---

## Настройки (`mysite/settings.py`)

| Параметр | Значение |
|---------|---------|
| `CorsMiddleware` | Первым в `MIDDLEWARE` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000`, `http://127.0.0.1:3000` |
| `CORS_ALLOW_CREDENTIALS` | `True` |
| Аутентификация | `TokenAuthentication`, `SessionAuthentication` |
| Пагинация | `StandardPagination` (page_size=10) |
| Фильтры | `DjangoFilterBackend`, `SearchFilter`, `OrderingFilter` |

---

## Сериализаторы (`api/serializers.py`)

| Сериализатор | Поля | Назначение |
|-------------|------|-----------|
| `UserSerializer` | id, username | Вложенный, только чтение |
| `TagSerializer` | id, name, slug | Теги |
| `ArticleListSerializer` | id, slug, title, author, tags, status, views, rating, created_at | Список статей |
| `ArticleDetailSerializer` | + content, comments, updated_at | Детальная статья |
| `ArticleWriteSerializer` | title, content, status, tags (список строк) | Создание/редактирование |
| `CommentSerializer` | id, author, content, created_at | Комментарии |
| `ProfileSerializer` | user, avatar, bio, followers_count, is_following | Профиль |
| `NotificationSerializer` | id, actor, article, is_read, created_at | Уведомления |
| `RegisterSerializer` | username, password1, password2 | Регистрация |
| `LoginSerializer` | username, password | Вход |

---

## Права доступа (`api/permissions.py`)

| Класс | Логика |
|-------|--------|
| `IsAuthorOrReadOnly` | SAFE_METHODS — всем; остальные — только `obj.author == request.user` |
| `IsCommentAuthorOrReadOnly` | То же самое для комментариев |

---

## Маршруты API

### Аутентификация

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| POST | `/api/v1/auth/register/` | Все | Регистрация → возвращает `{token, user}` |
| POST | `/api/v1/auth/login/` | Все | Вход → возвращает `{token, user}` |
| POST | `/api/v1/auth/logout/` | Авторизованные | Удаление токена → 204 |
| GET | `/api/v1/auth/me/` | Авторизованные | Текущий пользователь |

### Статьи

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| GET | `/api/v1/articles/` | Все | Список опубликованных статей |
| POST | `/api/v1/articles/` | Авторизованные | Создать статью |
| GET | `/api/v1/articles/{slug}/` | Все | Детальная статья с комментариями |
| PUT/PATCH | `/api/v1/articles/{slug}/` | Автор | Редактировать статью |
| DELETE | `/api/v1/articles/{slug}/` | Автор | Удалить статью |
| POST | `/api/v1/articles/{slug}/vote/` | Авторизованные | Лайк/дизлайк (toggle) |
| GET | `/api/v1/articles/feed/` | Авторизованные | Лента подписок |

### Комментарии

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| GET | `/api/v1/articles/{slug}/comments/` | Все | Список комментариев |
| POST | `/api/v1/articles/{slug}/comments/` | Авторизованные | Добавить комментарий + уведомление |
| DELETE | `/api/v1/articles/{slug}/comments/{id}/` | Автор | Удалить комментарий |

### Теги

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| GET | `/api/v1/tags/` | Все | Список тегов |
| GET | `/api/v1/tags/{slug}/` | Все | Тег по slug |

### Профили

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| GET | `/api/v1/profiles/{username}/` | Все | Профиль пользователя |
| GET/PATCH | `/api/v1/profiles/me/` | Авторизованные | Свой профиль |
| POST | `/api/v1/profiles/{username}/follow/` | Авторизованные | Подписка/отписка (toggle) |

### Уведомления

| Метод | URL | Доступ | Описание |
|-------|-----|--------|---------|
| GET | `/api/v1/notifications/` | Авторизованные | Список уведомлений |
| POST | `/api/v1/notifications/mark-read/` | Авторизованные | Отметить все как прочитанные |

---

## Форматы запросов и ответов

### Аутентификация

```json
// POST /api/v1/auth/register/
// Request:
{ "username": "user", "password1": "pass123", "password2": "pass123" }
// Response 201:
{ "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b", "user": { "id": 1, "username": "user" } }

// POST /api/v1/auth/login/
// Request:
{ "username": "user", "password": "pass123" }
// Response 200:
{ "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b", "user": { "id": 1, "username": "user" } }
```

### Статья

```json
// POST /api/v1/articles/
// Headers: Authorization: Token <key>
// Request:
{ "title": "Заголовок", "content": "Текст", "status": "published", "tags": ["python", "django"] }
// Response 201:
{ "id": 1, "slug": "zagolovok", "title": "Заголовок", "author": {...}, "tags": [...], ... }
```

### Пагинация (все list-эндпоинты)

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/v1/articles/?page=2",
  "previous": null,
  "results": [...]
}
```

### Параметры фильтрации для статей

| Параметр | Пример | Описание |
|---------|--------|---------|
| `?search=` | `?search=python` | Поиск по title, content, tags |
| `?ordering=` | `?ordering=-created_at` | Сортировка |
| `?tags__slug=` | `?tags__slug=django` | Фильтр по тегу |
| `?author__username=` | `?author__username=alice` | Фильтр по автору |
| `?page=` | `?page=2` | Страница |

---

## Формат ошибок

| HTTP-код | Ситуация | Ответ |
|---------|---------|-------|
| 400 | Невалидные данные | `{"field": ["сообщение"]}` |
| 400 | Неверный логин/пароль | `{"detail": "Неверный логин или пароль"}` |
| 401 | Нет токена | `{"detail": "Authentication credentials were not provided."}` |
| 403 | Нет прав (не автор) | `{"detail": "You do not have permission..."}` |
| 403 | Голос за свою статью | `{"detail": "Нельзя голосовать за свою статью"}` |
| 404 | Объект не найден | `{"detail": "Not found."}` |

---

## Авторизация запросов

Все защищённые эндпоинты требуют заголовок:

```
Authorization: Token <ваш_токен>
```

Токен получается при регистрации или входе и хранится в таблице `authtoken_token`.

---

## Тестирование через браузер

DRF предоставляет встроенный веб-интерфейс. Открой в браузере:

```
http://127.0.0.1:8000/api/v1/
```

Там доступны все эндпоинты с формами для отправки запросов без дополнительных инструментов.

---

## Производительность

| Оптимизация | Где применена |
|------------|--------------|
| `select_related('author')` | ArticleViewSet, CommentViewSet |
| `prefetch_related('tags', 'comments__author')` | ArticleViewSet |
| `select_related('actor', 'article__author')` | NotificationViewSet |
| Пагинация page_size=10 | Все list-эндпоинты |

---

## Миграции

```bash
python manage.py migrate
# Применены миграции authtoken (таблица токенов)
```
