# Отчёт 7: Тесты, шаблоны, CSS

## Статус: ЗАДОКУМЕНТИРОВАНО ✅

---

## 1. Тесты

### Конфигурация (pytest.ini)

```ini
[pytest]
DJANGO_SETTINGS_MODULE = mysite.settings
python_files = tests/test_*.py
python_classes = Test*
python_functions = test_*
```

### tests/conftest.py

Глобальный фикстур `use_simple_staticfiles` (autouse=True) — заменяет WhiteNoise storage на стандартный `StaticFilesStorage` во время тестов. Это позволяет запускать тесты без предварительного `collectstatic`.

---

### tests/test_models.py — юнит-тесты моделей

| Тест | Что проверяет |
|------|--------------|
| `test_article_slug_auto_generated` | slug генерируется автоматически и содержит транслитерацию |
| `test_article_slug_unique` | две статьи с одинаковым заголовком получают разные slug |
| `test_article_rating_empty` | рейтинг без голосов = 0 |
| `test_article_rating_with_votes` | рейтинг корректно считает upvote |
| `test_article_rating_cancel_vote` | удаление голоса возвращает рейтинг к 0 |
| `test_tag_slug_auto_generated` | тег получает slug после сохранения |
| `test_comment_creation` | комментарий создаётся и привязывается к статье |
| `test_follow_unique` | повторная подписка вызывает исключение (unique_together) |
| `test_notification_created` | уведомление создаётся с `is_read=False` |
| `test_profile_auto_created` | сигнал создаёт Profile при регистрации User |

---

### tests/test_views.py — интеграционные тесты views

| Тест | Что проверяет |
|------|--------------|
| `test_article_list_ok` | главная страница возвращает 200 и содержит статью |
| `test_article_list_search` | поиск по `?q=Test` находит статью |
| `test_article_list_search_no_results` | поиск без совпадений возвращает пустой список |
| `test_article_detail_ok` | страница статьи возвращает 200 |
| `test_article_detail_increments_views` | просмотр увеличивает счётчик views |
| `test_article_create_requires_login` | неавторизованный получает 302 → `/accounts/login/` |
| `test_article_create_ok` | авторизованный создаёт статью через POST |
| `test_vote_up` | голос за статью сохраняется в БД |
| `test_vote_toggle` | повторный голос с тем же значением удаляет запись |
| `test_author_cannot_vote_own_article` | автор не может голосовать за свою статью |
| `test_comment_add` | комментарий создаётся через POST |
| `test_follow_toggle` | подписка создаётся и удаляется при повторном POST |
| `test_register_new_user` | регистрация создаёт пользователя и делает редирект |

---

### tests/test_properties.py — property-based тесты (Hypothesis)

| Тест | Свойство | Параметры |
|------|---------|-----------|
| `test_article_slug_always_generated` | slug всегда непустой для любого заголовка | 30 примеров, deadline 2000ms |
| `test_duplicate_titles_get_unique_slugs` | статьи с одинаковыми заголовками получают уникальные slug | 20 примеров, 2-5 статей |
| `test_rating_equals_ups_minus_downs` | `rating() == upvotes - downvotes` всегда | 30 примеров, 0-10 голосов |
| `test_tag_slug_never_empty` | тег всегда получает непустой slug | 30 примеров |

Все property-тесты используют `@pytest.mark.django_db(transaction=True)` и `get_or_create` для изоляции.

### Запуск тестов

```bash
# Все тесты
pytest

# С покрытием
pytest --cov=blog --cov-report=html

# Только юнит-тесты моделей
pytest tests/test_models.py

# Только property-based
pytest tests/test_properties.py
```

---

## 2. Management команда: seed_articles

**Файл:** `blog/management/commands/seed_articles.py`

**Запуск:**
```bash
python manage.py seed_articles
# или в Docker:
docker compose exec web python manage.py seed_articles
```

**Что создаёт:**

| Объект | Количество | Детали |
|--------|-----------|--------|
| Пользователи | 2 | `alice` / `bob`, пароль `pass1234!` |
| Статьи опубликованные | 10 | Чередуются между alice и bob |
| Статьи черновики | 1 | "Черновик: идеи для статьи о Kubernetes" |
| Комментарии | 3 | К первым 3 опубликованным статьям |
| Голоса (upvote) | 5 | К первым 5 опубликованным статьям |

**Темы статей:** Python, Django, Docker, Redis, Git, PostgreSQL vs SQLite, DRF, Celery, Nginx+Gunicorn, pytest.

Команда идемпотентна — повторный запуск не создаёт дубликаты (`get_or_create`).

---

## 3. Шаблоны

### Структура

```
blog/templates/
├── blog/
│   ├── base.html
│   ├── article_list.html
│   ├── article_detail.html
│   ├── article_form.html
│   ├── article_confirm_delete.html
│   ├── profile.html
│   ├── profile_edit.html
│   ├── feed.html
│   ├── notifications.html
│   └── my_articles.html
└── registration/
    ├── login.html
    └── register.html
```

### base.html

- `lang="ru"`, viewport meta, подключение `style.css` через `{% load static %}`
- Навигация для авторизованных: Главная | Лента | Мои статьи | username (→ профиль) | 🔔 (счётчик) | Выйти
- Навигация для гостей: Главная | Войти | Регистрация
- `{% block content %}` для контента страниц
- `{% block title %}` для заголовка вкладки

### article_list.html

- Форма поиска с сохранением `sort` и `tag` через hidden inputs
- Ссылки сортировки: Новые / По рейтингу / Популярные (сохраняют `tag` и `q`)
- Карточка статьи: заголовок, автор (→ профиль), дата, просмотры, рейтинг, теги (→ фильтр)
- Пагинация с сохранением всех GET-параметров (`sort`, `tag`, `q`)

### article_detail.html

- `{% load markdown_extras %}` + `{{ article.content|markdownify }}`
- Кнопки 👍/👎 для авторизованных не-авторов
- Кнопки "Редактировать" / "Удалить" только для автора
- Список комментариев с датой и кнопкой удаления своих
- Форма добавления комментария для авторизованных, ссылка "Войдите" для гостей

### profile.html

- Аватар (если загружен), биография, счётчик подписчиков
- Кнопка "Подписаться" / "Отписаться" для авторизованных не-владельцев
- Ссылка "Редактировать профиль" для владельца
- Список опубликованных статей автора

### profile_edit.html

- Форма с `enctype="multipart/form-data"` для загрузки аватара

### my_articles.html

- Все статьи пользователя включая черновики
- Пометка `(черновик)` для неопубликованных
- Кнопки "Редактировать" и "Удалить" для каждой статьи

### notifications.html

- Список уведомлений: кто прокомментировал, какую статью, когда
- Все уведомления помечаются прочитанными при открытии страницы

### feed.html

- Статьи от подписанных авторов с пагинацией
- Сообщение "Подпишитесь на авторов..." если лента пуста

---

## 4. CSS (blog/static/blog/style.css)

Минимальный глобальный стиль:

```css
body { font-family: sans-serif; max-width: 900px; margin: 0 auto; padding: 1rem; }
nav { margin-bottom: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #ccc; }
nav a { margin-right: 0.5rem; }
h1, h2 { color: #333; }
```

- Центрирование контента, максимальная ширина 900px
- Горизонтальная навигация с разделителем
- Базовые цвета заголовков

---

## 5. Исправления (не отражённые в предыдущих отчётах)

### docker-compose.yml — монтирование базы данных

**Было:** именованный том `db_data:/app/db` — база удалялась при `docker compose down -v`

**Стало:** `./db.sqlite3:/app/db.sqlite3` — база хранится рядом с проектом на хосте

### Dockerfile

Убрана строка `mkdir -p /app/db` — больше не нужна после перехода на файловое монтирование.

### Важно перед первым запуском

Файл `db.sqlite3` должен существовать на хосте до `docker compose up`, иначе Docker создаст папку вместо файла:

```bash
# Windows
type nul > db.sqlite3

# Mac/Linux
touch db.sqlite3
```
