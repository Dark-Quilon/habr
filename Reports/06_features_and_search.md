# Отчёт 6: Дополнительные функции и поиск

## Статус: ЭТАПЫ 5-6 ЗАВЕРШЕНЫ ✅

---

## Этап 5: Дополнительные функции (Plan/13_доп_функции.md)

### Комментарии

**Views:**
- `comment_add(request, slug)` — `@login_required`, POST, сохраняет комментарий, инвалидирует кэш статьи, создаёт уведомление для автора статьи (если комментатор не автор)
- `comment_delete(request, pk)` — `@login_required`, POST, удаляет только свой комментарий, инвалидирует кэш

**URLs:**
- `POST /article/<slug>/comment/` → `comment_add`
- `POST /comment/<pk>/delete/` → `comment_delete`

**Шаблон `article_detail.html`:**
- Список комментариев с автором, датой, кнопкой удаления (только для своих)
- Форма добавления комментария для авторизованных
- Ссылка "Войдите" для неавторизованных

---

### Голосование

**View:**
- `vote(request, slug)` — `@login_required`, POST
- Автор не может голосовать за свою статью
- Toggle: повторный голос с тем же значением удаляет запись
- Противоположный голос обновляет значение
- Инвалидирует кэш статьи после голосования

**URL:** `POST /article/<slug>/vote/`

**Шаблон `article_detail.html`:**
- Кнопки 👍 и 👎 для авторизованных не-авторов

---

### Профили пользователей

**Views:**
- `profile(request, username)` — публичная страница профиля: аватар, биография, список статей, счётчик подписчиков, кнопка подписки/отписки
- `profile_edit(request)` — `@login_required`, редактирование аватара и биографии через `ProfileForm` с `request.FILES`

**URLs:**
- `GET /profile/<username>/` → `profile`
- `GET/POST /profile/edit/me/` → `profile_edit`

**Шаблоны:**
- `profile.html` — аватар, биография, подписчики, кнопка follow/unfollow, список статей
- `profile_edit.html` — форма с `enctype="multipart/form-data"` для загрузки аватара

---

### Подписки

**View:**
- `follow_toggle(request, username)` — `@login_required`, POST
- Самоподписка заблокирована
- Toggle: если подписка есть — удаляет, если нет — создаёт
- Редирект на страницу профиля

**URL:** `POST /follow/<username>/`

---

### Лента подписок

**View:**
- `feed(request)` — `@login_required`
- Статьи от авторов из `request.user.following.values_list('author', flat=True)`
- Сортировка по `-created_at`
- Пагинация 10 статей на страницу

**URL:** `GET /feed/`

**Шаблон `feed.html`:** список статей с пагинацией

---

### Уведомления

**View:**
- `notifications(request)` — `@login_required`
- Отображает все уведомления пользователя
- Помечает все непрочитанные как `is_read=True` при просмотре

**Создание уведомления:** в `comment_add` после `comment.save()`:
```python
if article.author != request.user:
    Notification.objects.create(
        recipient=article.author,
        actor=request.user,
        article=article,
    )
```

**URL:** `GET /notifications/`

**Шаблон `notifications.html`:** список уведомлений с актором, статьёй, датой

**Навигация в `base.html`:** 🔔 с счётчиком непрочитанных `({{ unread_notifications_count }})`

---

### Мои статьи

**View:**
- `my_articles(request)` — `@login_required`
- Все статьи текущего пользователя (включая черновики)
- Сортировка по `-created_at`

**URL:** `GET /my-articles/`

**Шаблон `my_articles.html`:** список с пометкой `(черновик)`, кнопками редактирования и удаления

---

### Обновление навигации (base.html)

Для авторизованных пользователей:
- Лента
- Мои статьи
- Профиль (ссылка на свой профиль)
- 🔔 Уведомления с счётчиком
- Выйти

---

## Этап 6: Поиск, сортировка, пагинация (Plan/14_поиск_сортировка_пагинация.md)

### Поиск

В `ArticleListView.get_queryset()`:
```python
if query:
    qs = qs.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(tags__name__icontains=query)
    ).distinct()
```
- Поиск без учёта регистра по заголовку, контенту и тегам
- `.distinct()` исключает дубли при совпадении по нескольким тегам
- При активном поиске кэш не используется

---

### Сортировка

| Параметр `sort` | Логика |
|----------------|--------|
| `new` (по умолчанию) | `order_by('-created_at')` |
| `popular` | `order_by('-views', '-created_at')` |
| `rating` | `annotate(rating_score=Sum(Case(When(votes__value=1, then=1), When(votes__value=-1, then=-1), default=0)))` → `order_by('-rating_score', '-created_at')` |

---

### Фильтрация по тегу

```python
if tag:
    qs = qs.filter(tags__slug=tag).distinct()
```
GET-параметр `tag` — slug тега. Ссылки на теги в карточках статей передают этот параметр.

---

### Пагинация с сохранением параметров

В шаблоне `article_list.html` ссылки пагинации сохраняют все параметры:
```html
<a href="?page={{ page_obj.previous_page_number }}&sort={{ sort }}&tag={{ tag }}&q={{ query }}">← Назад</a>
```

---

### Форма поиска в шаблоне

```html
<form method="get" action="/">
    <input type="text" name="q" value="{{ query }}" placeholder="Поиск...">
    <input type="hidden" name="sort" value="{{ sort }}">
    <button type="submit">Найти</button>
</form>
```

---

## Полный список URL

| URL | View | Описание |
|-----|------|---------|
| `/` | `ArticleListView` | Список статей, поиск, сортировка, пагинация |
| `/article/new/` | `ArticleCreateView` | Создание статьи |
| `/article/<slug>/` | `ArticleDetailView` | Детальная страница |
| `/article/<slug>/edit/` | `ArticleEditView` | Редактирование |
| `/article/<slug>/delete/` | `ArticleDeleteView` | Удаление |
| `/article/<slug>/comment/` | `comment_add` | Добавить комментарий |
| `/article/<slug>/vote/` | `vote` | Голосование |
| `/comment/<pk>/delete/` | `comment_delete` | Удалить комментарий |
| `/profile/<username>/` | `profile` | Профиль пользователя |
| `/profile/edit/me/` | `profile_edit` | Редактировать профиль |
| `/follow/<username>/` | `follow_toggle` | Подписаться/отписаться |
| `/feed/` | `feed` | Лента подписок |
| `/notifications/` | `notifications` | Уведомления |
| `/my-articles/` | `my_articles` | Мои статьи |
| `/register/` | `RegisterView` | Регистрация |
| `/accounts/login/` | Django built-in | Вход |
| `/accounts/logout/` | Django built-in | Выход |
| `/admin/` | Django Admin | Администрирование |
