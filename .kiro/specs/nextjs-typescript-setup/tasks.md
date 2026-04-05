# Implementation Plan: Next.js + TypeScript Setup

## Overview

Пошаговая настройка Next.js 14 (App Router) + TypeScript в директории `frontend/` поверх существующего Django-бэкенда. Каждый шаг строится на предыдущем и заканчивается рабочим состоянием.

## Tasks

- [x] 1. Инициализация проекта и конфигурация TypeScript
  - Создать директорию `frontend/` и инициализировать Next.js 14 с TypeScript (`create-next-app` или вручную)
  - Настроить `tsconfig.json` со `strict: true` и алиасом `@/` → `./src` (или корень `frontend/`)
  - Настроить `next.config.js` с базовыми параметрами
  - Добавить `.env.local.example` с переменной `NEXT_PUBLIC_API_URL`
  - Настроить ESLint с `eslint-config-next`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.5_

- [ ] 2. Типы данных и конфигурационный модуль
  - [ ] 2.1 Создать файл `types/index.ts` с интерфейсами `Article`, `Author`, `PaginatedResponse<T>`
    - Определить все поля согласно дизайну
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 2.2 Написать property-тест для `PaginatedResponse<T>`
    - **Property 8: validateEnv returns complete AppConfig for any valid API URL**
    - **Validates: Requirements 2.3**

  - [ ] 2.3 Создать `lib/config.ts` с функцией `validateEnv()` и экспортом `config`
    - Валидировать `NEXT_PUBLIC_API_URL` при загрузке модуля
    - Бросать `Error` с понятным сообщением если переменная отсутствует
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.4 Написать unit-тесты для `lib/config.ts`
    - Тест: возвращает `AppConfig` при наличии переменной
    - Тест: бросает `Error` при отсутствии `NEXT_PUBLIC_API_URL`
    - _Requirements: 2.2, 2.3, 2.4_

- [ ] 3. API Layer — `buildUrl` и `apiFetch`
  - [ ] 3.1 Реализовать `buildUrl(base, endpoint, params?)` в `lib/api.ts`
    - Корректно соединять base + endpoint без двойных слешей
    - Добавлять query string из `params`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 3.2 Написать property-тест для `buildUrl`
    - **Property 3: buildUrl always produces a valid URL**
    - **Validates: Requirements 4.3**

  - [ ]* 3.3 Написать property-тест для `buildUrl` с параметрами
    - **Property 4: buildUrl with params includes all query parameters**
    - **Validates: Requirements 4.2**

  - [ ]* 3.4 Написать property-тест на отсутствие двойных слешей
    - **Property 5: buildUrl produces no double slashes**
    - **Validates: Requirements 4.4**

  - [ ] 3.5 Реализовать `ApiError` класс и `apiFetch<T>` в `lib/api.ts`
    - Устанавливать `Content-Type: application/json` по умолчанию
    - Добавлять `X-CSRFToken` из cookie для POST/PUT/DELETE
    - Бросать `ApiError` при не-2xx статусе, парсить JSON-тело ошибки
    - Пробрасывать сетевые ошибки без перехвата
    - Не мутировать входной объект `options`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.2, 8.3, 10.2_

  - [ ]* 3.6 Написать property-тест: 2xx возвращает значение
    - **Property 1: 2xx response returns parsed value**
    - **Validates: Requirements 3.2**

  - [ ]* 3.7 Написать property-тест: не-2xx бросает ApiError
    - **Property 2: Non-2xx response throws ApiError**
    - **Validates: Requirements 3.3, 8.2**

  - [ ]* 3.8 Написать property-тест: apiFetch не мутирует options
    - **Property 6: apiFetch does not mutate options**
    - **Validates: Requirements 3.8**

  - [ ]* 3.9 Написать property-тест: Content-Type всегда присутствует
    - **Property 7: apiFetch sets Content-Type header**
    - **Validates: Requirements 3.7**

  - [ ]* 3.10 Написать property-тест: CSRF-заголовок для мутирующих запросов
    - **Property 10: CSRF header present on mutating requests**
    - **Validates: Requirements 10.2**

- [ ] 4. Checkpoint — убедиться что все тесты проходят
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. App Router: layout, страницы и обработка ошибок
  - [ ] 5.1 Создать `app/layout.tsx` (RootLayout) с `<html lang>`, `<body>` и глобальными стилями
    - Принимать `children: React.ReactNode`
    - Импортировать `globals.css`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 5.2 Написать property-тест для RootLayout
    - **Property 9: RootLayout renders for any ReactNode children**
    - **Validates: Requirements 5.2, 5.3**

  - [ ] 5.3 Создать `app/page.tsx` как домашнюю страницу
    - _Requirements: 5.5_

  - [ ] 5.4 Создать `app/error.tsx` для обработки необработанных ошибок на уровне роута
    - _Requirements: 8.1, 8.4_

- [ ] 6. Базовые UI-компоненты
  - [ ] 6.1 Создать `components/ui/Button.tsx`
    - Принимать `variant`, `size`, `isLoading` пропсы
    - Расширять `React.ButtonHTMLAttributes<HTMLButtonElement>`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 6.2 Создать `components/ui/ErrorBoundary.tsx`
    - Принимать `children` и опциональный `fallback`
    - _Requirements: 7.5_

  - [ ]* 6.3 Написать unit-тесты для Button и ErrorBoundary
    - Тест: Button рендерится для каждого варианта `variant`
    - Тест: ErrorBoundary показывает `fallback` при ошибке дочернего компонента
    - _Requirements: 7.2, 7.5_

- [ ] 7. Docker-интеграция
  - Создать `frontend/Dockerfile` для production-сборки Next.js
  - Обновить `docker-compose.yml`: добавить сервис `frontend` с портом, зависимостью от Django и переменной `NEXT_PUBLIC_API_URL`
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 8. Final checkpoint — убедиться что все тесты проходят
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Property-тесты используют библиотеку `fast-check`
- Unit-тесты используют Jest + `jest-fetch-mock` для мокирования fetch
