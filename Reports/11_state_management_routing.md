# Отчёт: State Management и Routing

## Обзор

Данный отчёт описывает концепции State Management и Routing, их взаимосвязь, реализацию в проекте, а также сравнение подходов в разных фреймворках.

---

## Что такое State Management

State Management (управление состоянием) — это способ хранения и управления данными приложения в браузере. Отвечает на вопрос: "какие данные сейчас актуальны?"

### Виды стейта

| Вид | Где хранится | Пример |
|-----|-------------|--------|
| Локальный | `useState` в компоненте | Открыта/закрыта форма |
| Глобальный | Zustand, Redux, Context | Авторизованный пользователь |
| Серверный | React Query, SWR | Данные с API |
| URL-стейт | URL params | Фильтры, поиск, страница |
| Персистентный | localStorage, cookie | Токен авторизации |

---

## Что такое Routing

Routing (маршрутизация) — определяет какую страницу/компонент показать по URL. Отвечает на вопрос: "какую страницу показать?"

Может работать:
- На сервере (SSR) — Next.js рендерит HTML на сервере
- В браузере (CSR) — React меняет компоненты без перезагрузки страницы

---

## Связь между SM и Routing

URL является частью стейта. Это ключевая идея современных фреймворков.

```
URL: /?search=python&page=2&tags__slug=django
         ↑              ↑         ↑
      стейт поиска  стейт страницы  стейт фильтра
```

Когда меняется URL — это одновременно:
- Навигация (роутинг) — показывается другой контент
- Изменение стейта — меняются данные для отображения

### Аналогия

- Routing — адрес куда ехать
- State Management — что везёшь в машине

---

## Реализация в проекте (Next.js)

В проекте используется многоуровневый подход без отдельной SM-библиотеки:

### Уровень 1: URL как стейт (Routing + SM)

```typescript
// SearchBar.tsx — URL обновляется при поиске
const params = new URLSearchParams(searchParams.toString())
params.set('search', next)
params.delete('page')
router.push(`${pathname}?${params.toString()}`)
```

```typescript
// page.tsx — Server Component читает стейт из URL
export default async function HomePage({ searchParams }) {
  const [articlesData, tags] = await Promise.all([
    getArticles({
      page: searchParams.page,
      search: searchParams.search,
      tags__slug: searchParams.tags__slug,
    }),
    getTags(),
  ])
}
```

Преимущество: фильтры сохраняются при обновлении страницы и можно поделиться ссылкой.

### Уровень 2: localStorage (глобальный персистентный стейт)

```typescript
// auth.ts — токен и пользователь
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('auth_user')
  return raw ? JSON.parse(raw) : null
}
```

Используется для: токен авторизации, данные текущего пользователя.

### Уровень 3: httpOnly Cookie (серверный стейт авторизации)

```typescript
// server-actions.ts
'use server'
export async function getServerToken(): Promise<string | null> {
  return cookies().get('auth_token')?.value ?? null
}
```

Используется для: SSR-запросы к Django API с авторизацией.

### Уровень 4: useState (локальный стейт компонентов)

```typescript
// VoteButtons.tsx
const [rating, setRating] = useState(initialRating)

// CommentSection.tsx
const [comments, setComments] = useState<Comment[]>(initialComments)

// Navbar.tsx
const [user, setUser] = useState<User | null>(null)
const [unreadCount, setUnreadCount] = useState(0)
```

### Связь Routing → SM в Navbar

```typescript
// Navbar.tsx — pathname триггерит обновление auth-стейта
const pathname = usePathname()

useEffect(() => {
  const stored = getStoredUser()
  setUser(stored)
}, [pathname]) // ← при каждой смене страницы перечитываем localStorage
```

После логина: `router.push('/'); router.refresh()` → pathname меняется → Navbar перечитывает localStorage → показывает иконку аккаунта.

---

## Почему Zustand не нужен в этом проекте

Zustand оправдан когда:
- Один стейт нужен в 5+ несвязанных компонентах
- Сложная логика обновлений
- Нужна история изменений

В проекте единственный глобальный стейт — авторизация. Он уже решён через localStorage + `usePathname`. Добавление Zustand создало бы четвёртый слой без необходимости.

Если бы проект вырос (корзина, мультишаговые формы, real-time данные) — Zustand был бы оправдан.

---

## Сравнение SM в разных фреймворках

| Фреймворк | SM из коробки | Популярные библиотеки | Особенности |
|-----------|--------------|----------------------|-------------|
| React / Next.js | Нет | Zustand, Redux Toolkit, Jotai, Recoil | Свобода выбора, нет стандарта |
| Vue / Nuxt | Pinia (встроен) | — | Официальный, простой API |
| Angular | Services + RxJS | NgRx | Реактивный подход, Observable |

### React / Next.js

Нет встроенного SM — нужно выбирать самому. Это плюс (гибкость) и минус (нет стандарта).

Популярные варианты:
- **Zustand** — минималистичный, простой API, ~1KB
- **Redux Toolkit** — мощный, для больших приложений, много boilerplate
- **Jotai** — атомарный подход, похож на Recoil
- **React Query / SWR** — для серверного стейта (кэш API-запросов)

### Vue / Nuxt

**Pinia** — официальный SM, встроен в Nuxt 3. Простой, типобезопасный, DevTools поддержка.

```javascript
// Pinia store
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, token: null }),
  actions: {
    async login(username, password) {
      const data = await $fetch('/api/v1/auth/login/', { method: 'POST', body: { username, password } })
      this.token = data.token
      this.user = data.user
    }
  }
})
```

### Angular

**Services + RxJS** — встроенный механизм. Сервисы — синглтоны, RxJS — реактивные потоки данных.

```typescript
// Angular Service
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null)
  
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login/', { username, password })
      .pipe(tap(data => this.user$.next(data.user)))
  }
}
```

**NgRx** — для больших Angular-приложений. Аналог Redux, основан на паттерне Flux.

---

## Сравнение Routing в разных фреймворках

| Фреймворк | Роутинг | SSR | Тип |
|-----------|---------|-----|-----|
| Next.js | App Router (файловый) | ✅ встроен | Server + Client |
| Nuxt | Файловый (pages/) | ✅ встроен | Server + Client |
| Angular | RouterModule | ✅ Angular Universal | Client (SSR опционально) |
| React (без фреймворка) | React Router | ❌ нет | Client only |

### Файловый роутинг (Next.js / Nuxt)

```
app/
├── page.tsx          → /
├── articles/
│   ├── [slug]/
│   │   └── page.tsx  → /articles/{slug}
│   └── new/
│       └── page.tsx  → /articles/new
└── profile/
    └── [username]/
        └── page.tsx  → /profile/{username}
```

Файл = маршрут. Не нужно настраивать роутер вручную.

---

## Итог: что используется в проекте

| Задача | Решение | Почему |
|--------|---------|--------|
| Фильтры, поиск, пагинация | URL params | Сохраняются при обновлении, SEO-friendly |
| Авторизация (клиент) | localStorage | Персистентность между сессиями |
| Авторизация (сервер) | httpOnly cookie | Безопасность, SSR-запросы |
| Локальный UI-стейт | useState | Достаточно для компонентов |
| Навигация | Next.js App Router | Файловый роутинг, SSR из коробки |
| Глобальная SM-библиотека | Не используется | Избыточна для текущего масштаба |
