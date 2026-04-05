# Отчёт: React Testing с Jest для Next.js 14

## Обзор

Данный отчёт описывает настройку полноценной тестовой инфраструктуры для Next.js 14 / React 18 / TypeScript проекта. Покрыты все 11 компонентов в `frontend/src/components/` юнит-тестами с использованием Jest + React Testing Library.

**Итоговые результаты:**
- Test Suites: 11 passed
- Tests: 42 passed, 0 failed
- Statement Coverage: 82.45% (цель ≥ 80% ✅)
- Lines Coverage: 85.3%

---

## Стек и зависимости

Добавлены в `frontend/package.json` как `devDependencies`:

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| `jest` | ^30 | Тест-раннер |
| `jest-environment-jsdom` | ^30 | DOM-окружение для тестов |
| `ts-jest` | ^29 | TypeScript-трансформер для Jest |
| `@types/jest` | ^30 | TypeScript-типы для Jest |
| `@testing-library/react` | ^16 | Рендер и запросы к DOM |
| `@testing-library/jest-dom` | ^6 | Кастомные матчеры (`toBeInTheDocument`, `toHaveClass` и др.) |
| `@testing-library/user-event` | ^14 | Симуляция пользовательских действий |
| `fast-check` | ^4 | Property-based тестирование |

Команда установки:
```bash
cd frontend && npm install --save-dev \
  jest jest-environment-jsdom ts-jest @types/jest \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event fast-check
```

Скрипты в `frontend/package.json`:
```json
{
  "scripts": {
    "test": "jest --config ../jest.config.ts",
    "test:coverage": "jest --config ../jest.config.ts --coverage"
  }
}
```

---

## Конфигурация

### jest.config.ts (корень проекта)

```typescript
import type { Config } from 'jest'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const nextJest = require('./frontend/node_modules/next/jest.js')

const createJestConfig = nextJest({ dir: path.join(__dirname, 'frontend') })

const config: Config = {
  testEnvironment: path.join(__dirname, 'frontend/node_modules/jest-environment-jsdom'),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['frontend/src/components/**/*.{ts,tsx}'],
  modulePaths: [path.join(__dirname, 'frontend/node_modules')],
}

export default createJestConfig(config)
```

Ключевые решения:
- `next/jest` трансформер обрабатывает `next/image`, `next/link`, CSS-модули
- `testEnvironment` указан абсолютным путём — зависимости установлены в `frontend/node_modules`, а не в корне
- `modulePaths` добавлен по той же причине
- `@/` алиас резолвится в `frontend/src/`

### jest.setup.ts (корень проекта)

```typescript
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))
```

Глобальный мок `next/navigation` применяется ко всем тестам — все компоненты используют `useRouter`, `usePathname` или `useSearchParams`.

---

## Структура тестов

```
frontend/
├── __tests__/
│   ├── components/
│   │   ├── ArticleCard.test.tsx        (3 теста)
│   │   ├── ArticleList.test.tsx        (2 теста)
│   │   ├── Pagination.test.tsx         (8 тестов)
│   │   ├── VoteButtons.test.tsx        (5 тестов)
│   │   ├── FollowButton.test.tsx       (2 теста)
│   │   ├── DeleteArticleButton.test.tsx (2 теста)
│   │   ├── SearchBar.test.tsx          (2 теста)
│   │   ├── Navbar.test.tsx             (4 теста)
│   │   ├── ArticleForm.test.tsx        (5 тестов)
│   │   ├── CommentSection.test.tsx     (8 тестов)
│   │   └── ProfileEditForm.test.tsx    (1 тест)
│   └── helpers/
│       ├── render.tsx      — кастомный renderWithProviders
│       ├── factories.ts    — фабрики тестовых данных
│       └── mocks.ts        — хелперы для API/Auth моков
├── jest.config.ts
└── jest.setup.ts
```

---

## Вспомогательные утилиты

### render.tsx — кастомный render

Оборачивает компоненты в `<Toaster />` из `react-hot-toast`, который требуется для тостов в компонентах.

```typescript
function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options })
}
```

### factories.ts — фабрики тестовых данных

Создают типизированные объекты с дефолтными значениями и поддержкой `overrides`. Счётчик `idCounter` гарантирует уникальность `id` между всеми вызовами.

```typescript
export const makeArticle = (overrides?: Partial<ArticleList>): ArticleList => ({
  id: nextId(),
  slug: `article-${nextId()}`,
  title: 'Test Article',
  author: makeUser(),
  tags: [],
  status: 'published',
  views: 0,
  rating: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})
```

Доступные фабрики: `makeUser`, `makeTag`, `makeArticle`, `makeArticleDetail`, `makeComment`, `makeProfile`.

### mocks.ts — хелперы для моков

Централизованные функции для настройки поведения моков. Не вызывают `jest.mock()` сами — это делают тестовые файлы.

```typescript
export function mockAuthenticatedUser(user?: User): void  // getToken → 'test-token-123'
export function mockUnauthenticatedUser(): void           // getToken → null
export function mockApiSuccess<T>(fn, data): void         // fn.mockResolvedValue(data)
export function mockApiError(fn, status, message): void   // fn.mockRejectedValue({status, message})
```

---

## Категории компонентов и тесты

### Простые компоненты (рендер + props)

Тестируются без моков API/Auth — только проверка рендера по входным данным.

**ArticleCard** (3 теста)
- Заголовок рендерится как ссылка на `/articles/{slug}`
- Теги отображаются в DOM
- Рейтинг и просмотры отображаются (с эмодзи-префиксами `⭐` и `👁`)

**ArticleList** (2 теста)
- Пустое состояние при `articles=[]` — текст "Статьи не найдены."
- Корректное количество карточек при непустом массиве

**Pagination** (8 тестов)
- Не рендерится при `count ≤ pageSize`
- Кнопка "Назад" имеет класс `disabled` на первой странице
- Кнопка "Вперёд" имеет класс `disabled` на последней странице
- Кнопки не `disabled` на промежуточных страницах
- `searchParams` сохраняются во всех сгенерированных ссылках
- Ссылка "Назад" содержит корректный номер страницы

### Интерактивные компоненты (события + состояние)

Тестируются с моками `@/lib/api` и `@/lib/auth`, используется `@testing-library/user-event`.

**VoteButtons** (5 тестов)
- `voteArticle` вызывается с правильным slug и значением `1` при upvote
- `voteArticle` вызывается с правильным slug и значением `-1` при downvote
- Рейтинг обновляется до значения из API при успехе
- Рейтинг откатывается к начальному при ошибке 403 (оптимистичный откат)
- Редирект на `/login` для неавторизованного пользователя

```typescript
it('откатывает рейтинг при ошибке 403', async () => {
  const { ApiError } = jest.requireActual('@/lib/api')
  mockVoteArticle.mockRejectedValue(new ApiError(403, 'Forbidden'))
  render(<VoteButtons slug="my-article" initialRating={5} />)

  await userEvent.click(screen.getByRole('button', { name: 'Лайк' }))

  await waitFor(() =>
    expect(screen.getByText('5')).toBeInTheDocument(),
  )
})
```

**FollowButton** (2 теста)
- Кнопка `disabled` для неавторизованного пользователя
- `followUser` вызывается при клике авторизованного пользователя

**DeleteArticleButton** (2 теста)
- `deleteArticle` вызывается при подтверждении `window.confirm`
- `deleteArticle` не вызывается при отмене `window.confirm`

```typescript
jest.spyOn(window, 'confirm').mockReturnValue(true)
```

**SearchBar** (2 теста)
- `router.push` вызывается с `/?search=react` при вводе текста
- `router.push` вызывается с `/?` при очистке поля

Нюанс: компонент использует debounce 300ms, поэтому тесты используют `jest.useFakeTimers()` + `userEvent.setup({ advanceTimers })` + `jest.runAllTimers()`.

### Сложные компоненты (API + роутинг + auth)

**Navbar** (4 теста)
- Ссылки "Войти" и "Регистрация" для неавторизованного пользователя
- Кнопка "Выйти" отсутствует для неавторизованного пользователя
- Username и кнопка "Выйти" для авторизованного пользователя
- Ссылки login/register отсутствуют для авторизованного пользователя

Нюанс: `@/lib/api` мокируется с factory-функцией для сохранения `getNotificationsClient`.

**ArticleForm** (5 тестов)
- `createArticle` вызывается с корректными аргументами при создании
- `updateArticle` вызывается с корректными аргументами при редактировании
- Класс `is-invalid` применяется к полю `title` при ошибке 400
- Класс `is-invalid` применяется к полю `content` при ошибке 400
- Текст ошибки отображается под полем

Нюанс: `jest.mock('@/lib/api')` использует `jest.requireActual` для сохранения реального класса `ApiError` — это необходимо для корректной работы `instanceof ApiError` внутри компонента.

```typescript
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  createArticle: jest.fn(),
  updateArticle: jest.fn(),
}))
```

**CommentSection** (8 тестов)
- Список комментариев рендерится корректно
- Имена авторов отображаются
- Счётчик комментариев отображается
- Заглушка при пустом списке
- Форма показывается авторизованному пользователю
- Ссылка на логин показывается неавторизованному
- `addComment` вызывается с правильными аргументами
- `addComment` не вызывается при пустом тексте

**ProfileEditForm** (1 тест)
- `updateMyProfile` вызывается с корректными данными при сабмите

---

## Стратегия мокирования

### next/navigation (глобально)

Все хуки роутинга замоканы в `jest.setup.ts`. В конкретных тестах переопределяются через `jest.mocked()`:

```typescript
const mockPush = jest.fn()
jest.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
```

### @/lib/api и @/lib/auth (per-file)

Каждый тестовый файл объявляет моки на уровне модуля:

```typescript
jest.mock('@/lib/api')
jest.mock('@/lib/auth')
```

Когда нужно сохранить реальные классы (например `ApiError`):

```typescript
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  createArticle: jest.fn(),
}))
```

### window.confirm

```typescript
jest.spyOn(window, 'confirm').mockReturnValue(true)
```

### Изоляция между тестами

Каждый тестовый файл содержит:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

---

## Покрытие кода

| Метрика | Результат | Цель |
|---------|-----------|------|
| Statements | 82.45% | ≥ 80% ✅ |
| Branches | 79.09% | — |
| Functions | 75.43% | — |
| Lines | 85.3% | — |

Запуск с покрытием:
```bash
npx jest --config jest.config.ts --coverage
```

---

## Запуск тестов

```bash
# Все тесты
npx jest --config jest.config.ts

# Конкретный компонент
npx jest --config jest.config.ts --testPathPatterns="VoteButtons"

# С покрытием
npx jest --config jest.config.ts --coverage

# Из frontend/ (через package.json скрипты)
cd frontend && npm test
cd frontend && npm run test:coverage
```

---

## Итог

| Компонент | Тестов | Категория |
|-----------|--------|-----------|
| ArticleCard | 3 | Простой |
| ArticleList | 2 | Простой |
| Pagination | 8 | Простой |
| VoteButtons | 5 | Интерактивный |
| FollowButton | 2 | Интерактивный |
| DeleteArticleButton | 2 | Интерактивный |
| SearchBar | 2 | Интерактивный |
| Navbar | 4 | Сложный |
| ArticleForm | 5 | Сложный |
| CommentSection | 8 | Сложный |
| ProfileEditForm | 1 | Сложный |
| **Итого** | **42** | |
