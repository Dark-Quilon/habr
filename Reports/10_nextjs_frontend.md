# Отчёт: Next.js Frontend

## Статус: ЗАВЕРШЁН ✅

---

## Обзор

Next.js 14 фронтенд для блог-платформы, подключённый к Django REST API (`http://127.0.0.1:8000/api/v1/`). Гибридная архитектура: Server Components для SEO-страниц, Client Components для интерактивности. Token-based аутентификация через httpOnly-куки (SSR) и localStorage (CSR).

---

## Стек

| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Next.js | 14.2.x | Фреймворк, App Router |
| TypeScript | 5.x | Типизация |
| Bootstrap | 5.3.x | CSS-фреймворк |
| SCSS | 1.x | Стили |
| react-hot-toast | 2.x | Toast-уведомления |
| fetch (встроенный) | — | HTTP-запросы (без axios) |

---

## Структура проекта

```
frontend/src/
├── app/
│   ├── layout.tsx                    — корневой layout с Navbar
│   ├── page.tsx                      — главная (список статей, SSR)
│   ├── error.tsx                     — error boundary
│   ├── global-error.tsx              — глобальный error boundary
│   ├── login/page.tsx                — вход
│   ├── register/page.tsx             — регистрация
│   ├── feed/page.tsx                 — лента подписок (SSR)
│   ├── notifications/page.tsx        — уведомления
│   ├── profile/[username]/page.tsx   — профиль пользователя
│   └── articles/
│       ├── [slug]/page.tsx           — детальная статья (SSR)
│       ├── [slug]/edit/page.tsx      — редактирование статьи
│       └── new/page.tsx              — создание статьи
├── components/
│   ├── Navbar.tsx                    — навбар (Client)
│   ├── ArticleCard.tsx               — карточка статьи (Server)
│   ├── ArticleList.tsx               — список статей (Server)
│   ├── ArticleForm.tsx               — форма статьи (Client)
│   ├── CommentSection.tsx            — комментарии (Client)
│   ├── VoteButtons.tsx               — голосование (Client)
│   ├── FollowButton.tsx              — подписка (Client)
│   ├── SearchBar.tsx                 — поиск (Client)
│   ├── Pagination.tsx                — пагинация (Server)
│   ├── ProfileEditForm.tsx           — редактирование профиля (Client)
│   └── DeleteArticleButton.tsx       — удаление статьи (Client)
└── lib/
    ├── types.ts                      — TypeScript интерфейсы
    ├── api.ts                        — fetch-обёртки для всех эндпоинтов
    ├── auth.ts                       — управление токеном (localStorage)
    └── server-actions.ts             — Server Actions для httpOnly-куки
```

---

## Архитектура Server / Client

| Компонент | Тип | Причина |
|-----------|-----|---------|
| `page.tsx` (главная, статья, профиль, лента) | Server Component | SEO, первичная загрузка |
| `Navbar.tsx` | Client | Состояние авторизации |
| `CommentSection.tsx` | Client | Добавление/удаление комментариев |
| `VoteButtons.tsx` | Client | Toggle лайк/дизлайк |
| `FollowButton.tsx` | Client | Toggle подписка |
| `SearchBar.tsx` | Client | Debounce input |
| `login/page.tsx`, `register/page.tsx` | Client | Форма с состоянием |
| `notifications/page.tsx` | Client | Загрузка через clientFetch |
| `articles/new`, `edit` | Client | Форма создания/редактирования |

---

## Страницы

| URL | Тип | Описание |
|-----|-----|---------|
| `/` | SSR | Список статей с поиском, фильтром по тегам, пагинацией |
| `/articles/{slug}` | SSR + Client | Детальная статья, голосование, комментарии |
| `/articles/new` | Client | Создание статьи |
| `/articles/{slug}/edit` | Client | Редактирование статьи |
| `/feed` | SSR | Лента подписок (требует авторизации) |
| `/login` | Client | Форма входа |
| `/register` | Client | Форма регистрации |
| `/profile/{username}` | SSR | Профиль пользователя |
| `/profile/me` | Client | Редактирование своего профиля |
| `/notifications` | Client | Список уведомлений |

---

## Аутентификация

Токен хранится в двух местах:
- `localStorage['auth_token']` — для клиентских запросов
- `httpOnly cookie 'auth_token'` — для серверных запросов (SSR)

Поток:
1. `POST /api/v1/auth/login/` → получаем `{token, user}`
2. `setToken(token)` → localStorage
3. `localStorage.setItem('auth_user', JSON.stringify(user))`
4. `setServerToken(token)` → Server Action → httpOnly cookie
5. `router.push('/'); router.refresh()`

Navbar обновляется при смене `pathname` через `usePathname()`.

---

## API Client (`lib/api.ts`)

| Функция | Метод | Тип fetch |
|---------|-------|----------|
| `getArticles(params?)` | GET | serverFetch |
| `getArticle(slug)` | GET | serverFetch |
| `getArticleClient(slug)` | GET | clientFetch |
| `createArticle(data)` | POST | clientFetch |
| `updateArticle(slug, data)` | PATCH | clientFetch |
| `deleteArticle(slug)` | DELETE | clientFetch |
| `voteArticle(slug, value)` | POST | clientFetch |
| `getFeed(page?)` | GET | serverFetch |
| `getComments(slug)` | GET | serverFetch |
| `addComment(slug, content)` | POST | clientFetch |
| `deleteComment(slug, id)` | DELETE | clientFetch |
| `getTags()` | GET | serverFetch |
| `getProfile(username)` | GET | serverFetch |
| `getMyProfile()` | GET | serverFetch |
| `updateMyProfile(data)` | PATCH | clientFetch |
| `followUser(username)` | POST | clientFetch |
| `getNotifications()` | GET | serverFetch |
| `getNotificationsClient()` | GET | clientFetch |
| `markNotificationsRead()` | POST | clientFetch |
| `login(username, password)` | POST | clientFetch |
| `register(username, p1, p2)` | POST | clientFetch |
| `logout()` | POST | clientFetch |
| `getMe()` | GET | serverFetch |

---

## Исправленные баги

| Баг | Причина | Решение |
|-----|---------|---------|
| `NotFoundError` на главной | `getTags()` ожидал `Tag[]`, API возвращал `PaginatedResponse` | Добавлена проверка типа ответа |
| Комментарии — то же | `getComments()` ожидал `Comment[]` | Аналогичная проверка |
| Navbar не обновлялся после входа | `useEffect` без зависимостей | Добавлен `pathname` в deps |
| "Не удалось загрузить уведомления" | `getNotifications()` использовал `serverFetch` в Client Component | Добавлен `getNotificationsClient()` через `clientFetch` |
| `markNotificationsRead` блокировал загрузку | Ошибка в catch перехватывала всё | Вынесен в `.catch(() => {})` |

---

## Запуск

```bash
# Терминал 1 — Django
python manage.py runserver

# Терминал 2 — Next.js
cd frontend
npm run dev
```

Открыть: `http://localhost:3000`
