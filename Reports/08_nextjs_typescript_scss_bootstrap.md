# Отчёт 08: Next.js + TypeScript + SCSS + Bootstrap

## Дата: 30 марта 2026

---

## Обзор

Настроен отдельный фронтенд на Next.js 14 (App Router) с TypeScript, SCSS и Bootstrap 5 в директории `frontend/` поверх существующего Django-бэкенда. Фронтенд работает как независимый сервис и общается с Django через REST API.

---

## 1. Инициализация Next.js + TypeScript

### Что сделано

Создана директория `frontend/` с полной конфигурацией проекта вручную (без `create-next-app`).

### Созданные файлы

**`frontend/package.json`**
- `next@14.2.29` — фреймворк
- `react@^18.3.1`, `react-dom@^18.3.1` — UI
- `typescript@^5.8.3` — типизация
- `@types/react@^18.3.23`, `@types/node@^20.17.57` — типы
- `eslint@^8.57.1`, `eslint-config-next@14.2.29` — линтер

**`frontend/tsconfig.json`**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] }
  }
}
```
- Строгий режим TypeScript (`strict: true`)
- Алиас `@/` → `./src/*` для абсолютных импортов
- Плагин `next` для поддержки App Router

**`frontend/next.config.js`**
```js
const nextConfig = { reactStrictMode: true }
module.exports = nextConfig
```

**`frontend/.eslintrc.json`**
```json
{ "extends": "next/core-web-vitals" }
```

**`frontend/.env.local.example`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Структура App Router

```
frontend/src/
├── app/
│   ├── layout.tsx    — корневой layout
│   ├── page.tsx      — домашняя страница
│   └── globals.css   — (удалён, заменён на SCSS)
└── public/
```

**`frontend/src/app/layout.tsx`** — корневой RootLayout:
- `<html lang="en">` + `<body>`
- Импорт глобальных стилей
- Принимает `children: React.ReactNode`

---

## 2. Подключение SCSS и Bootstrap 5

### Что сделано

Bootstrap 5 подключён через SCSS-импорты с возможностью кастомизации переменных до компиляции фреймворка. Это стандартный подход Bootstrap 5, позволяющий переопределять цвета, типографику и другие параметры.

### Добавленные зависимости

В `frontend/package.json`:
- `bootstrap@^5.3.3` — dependencies
- `sass@^1.89.0` — devDependencies (требуется Next.js для компиляции `.scss`)

### Структура файлов стилей

```
frontend/src/styles/
├── globals.scss      — точка входа (NEW)
├── _variables.scss   — переопределение Bootstrap переменных (NEW)
└── _custom.scss      — проектные стили (NEW)
```

Файл `frontend/src/app/globals.css` удалён и заменён на `globals.scss`.

### Порядок импортов (критичен)

**`frontend/src/styles/globals.scss`**:
```scss
// 1. Переопределяем переменные ДО Bootstrap
@import 'variables';

// 2. Импортируем Bootstrap
@import 'bootstrap/scss/bootstrap';

// 3. Проектные стили ПОСЛЕ Bootstrap
@import 'custom';

// 4. Базовые reset-стили
*, *::before, *::after { box-sizing: border-box; }
html, body { max-width: 100vw; overflow-x: hidden; }
```

Порядок критичен: Bootstrap использует механизм `!default` — переменная применяется только если она ещё не задана. Поэтому `_variables.scss` должен идти первым.

### Кастомизация Bootstrap

**`frontend/src/styles/_variables.scss`**:
```scss
$primary:          #0d6efd;
$secondary:        #6c757d;
$success:          #198754;
$danger:           #dc3545;
$warning:          #ffc107;
$info:             #0dcaf0;
$font-family-base: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
$font-size-base:   1rem;
$border-radius:    0.375rem;
```

Для изменения темы Bootstrap достаточно отредактировать этот файл.

### Проектные стили

**`frontend/src/styles/_custom.scss`**:
```scss
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

Файл загружается последним — его стили имеют приоритет над Bootstrap при одинаковой специфичности.

### Обновление layout.tsx

```typescript
// Было:
import './globals.css'

// Стало:
import '../styles/globals.scss'
```

---

## 3. Проверка работоспособности

Обновлён `frontend/src/app/page.tsx` с Bootstrap-компонентами для визуальной проверки:

```tsx
export default function Home() {
  return (
    <main className="container py-5">
      <h1 className="display-4 mb-4">Hello from Next.js</h1>
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-danger">Danger</button>
      </div>
      <div className="alert alert-success">Bootstrap работает!</div>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Card</h5>
              <p className="card-text">Bootstrap grid + card компонент.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

Результат: кнопки, алерт и карточка отображаются со стилями Bootstrap на `http://localhost:3000`.

---

## 4. Итоговая структура frontend/

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.js
├── .eslintrc.json
├── .env.local.example
├── node_modules/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx
    └── styles/
        ├── globals.scss
        ├── _variables.scss
        └── _custom.scss
```

---

## 5. Запуск

```powershell
cd frontend
npm install
npm run dev   # http://localhost:3000
```

---

## 6. Следующие шаги

По плану стека осталось:
- Preact (замена React для меньшего бандла)
- State Management (Zustand / Jotai)
- SEO (Next.js Metadata API)
