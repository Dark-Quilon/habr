# Implementation Plan: React Jest Testing Infrastructure

## Overview

Поэтапная настройка тестовой инфраструктуры для Next.js 14 / React 18 / TypeScript: установка зависимостей, конфигурация Jest, вспомогательные утилиты, юнит-тесты для 11 компонентов и property-based тесты для чистых функций.

## Tasks

- [x] 1. Установить зависимости и настроить конфигурацию Jest
  - Добавить в `frontend/package.json` devDependencies: `jest`, `jest-environment-jsdom`, `ts-jest`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`
  - Добавить скрипты `"test": "jest"` и `"test:coverage": "jest --coverage"` в `frontend/package.json`
  - Создать `jest.config.ts` в корне проекта с `next/jest` трансформером, `testEnvironment: 'jsdom'`, `moduleNameMapper` для `@/` → `frontend/src/`, `testMatch: ['**/__tests__/**/*.test.{ts,tsx}']`, `collectCoverageFrom: ['frontend/src/components/**/*.{ts,tsx}']`
  - Создать `jest.setup.ts` с импортом `@testing-library/jest-dom` и глобальным моком `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4_

- [x] 2. Создать вспомогательные утилиты для тестов
  - [x] 2.1 Создать кастомный render-хелпер `frontend/__tests__/helpers/render.tsx`
    - Реализовать `renderWithProviders(ui, options?)` оборачивающий в `Toaster` и другие провайдеры
    - Ре-экспортировать все утилиты из `@testing-library/react`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Создать фабрики тестовых данных `frontend/__tests__/helpers/factories.ts`
    - Реализовать `makeUser`, `makeTag`, `makeArticle`, `makeArticleDetail`, `makeComment`, `makeProfile` с поддержкой `overrides`
    - Использовать счётчик `idCounter` для генерации уникальных `id`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 2.3 Написать property-тест: фабрики всегда применяют overrides (Property 1)
    - **Property 1: Factory overrides are always applied**
    - **Validates: Requirements 4.8**

  - [ ]* 2.4 Написать property-тест: уникальность ID фабрик (Property 2)
    - **Property 2: Factory IDs are always unique**
    - **Validates: Requirements 4.9**

  - [x] 2.5 Создать моки API и Auth `frontend/__tests__/helpers/mocks.ts`
    - Реализовать `mockAuthenticatedUser(user?)` и `mockUnauthenticatedUser()`
    - Реализовать `mockApiSuccess(fn, data)` и `mockApiError(fn, status, message)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Checkpoint — убедиться что конфигурация работает
  - Убедиться что `jest.config.ts` и `jest.setup.ts` корректны, хелперы компилируются без ошибок. Спросить пользователя если возникнут вопросы.

- [x] 4. Тесты простых компонентов (рендер + props)
  - [x] 4.1 Написать тесты для `ArticleCard` в `frontend/__tests__/components/ArticleCard.test.tsx`
    - Проверить отображение заголовка как ссылки на `/articles/{slug}`
    - Проверить отображение тегов, рейтинга и просмотров
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.2 Написать тесты для `ArticleList` в `frontend/__tests__/components/ArticleList.test.tsx`
    - Проверить пустое состояние при пустом массиве
    - Проверить корректное количество отрендеренных `ArticleCard`
    - _Requirements: 6.5, 6.6, 6.7_

  - [x] 4.3 Написать тесты для `Pagination` в `frontend/__tests__/components/Pagination.test.tsx`
    - Проверить отсутствие рендера при `count ≤ pageSize`
    - Проверить `disabled` состояние кнопок на первой и последней странице
    - Проверить сохранение `searchParams` в сгенерированных ссылках
    - _Requirements: 6.8, 6.9, 6.10, 6.11, 6.12_

  - [ ]* 4.4 Написать property-тест: `buildPageUrl` всегда кодирует номер страницы (Property 7)
    - **Property 7: `buildPageUrl` always encodes the requested page number**
    - **Validates: Requirements 10.5**

  - [ ]* 4.5 Написать property-тест: `buildPageUrl` сохраняет существующие параметры (Property 8)
    - **Property 8: `buildPageUrl` preserves existing search parameters**
    - **Validates: Requirements 6.12, 10.3**

- [x] 5. Тесты интерактивных компонентов (события + состояние)
  - [x] 5.1 Написать тесты для `VoteButtons` в `frontend/__tests__/components/VoteButtons.test.tsx`
    - Проверить вызов `voteArticle` с правильным slug и значением `1` / `-1`
    - Проверить обновление рейтинга до значения из API при успехе
    - Проверить откат рейтинга при ошибке 403
    - Проверить редирект на `/login` для неавторизованного пользователя
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 5.2 Написать property-тест: оптимистичное обновление рейтинга (Property 3)
    - **Property 3: Optimistic vote update reflects API response**
    - **Validates: Requirements 7.4**

  - [ ]* 5.3 Написать property-тест: откат рейтинга при 403 (Property 4)
    - **Property 4: Vote rollback on 403 error**
    - **Validates: Requirements 7.5**

  - [x] 5.4 Написать тесты для `FollowButton` в `frontend/__tests__/components/FollowButton.test.tsx`
    - Проверить `disabled` атрибут для неавторизованного пользователя
    - Проверить вызов follow API при клике авторизованного пользователя
    - _Requirements: 7.7, 7.8, 7.9_

  - [x] 5.5 Написать тесты для `DeleteArticleButton` в `frontend/__tests__/components/DeleteArticleButton.test.tsx`
    - Проверить вызов delete API при подтверждении диалога (`window.confirm = true`)
    - Проверить отсутствие вызова delete API при отмене диалога (`window.confirm = false`)
    - _Requirements: 7.10, 7.11, 7.12_

  - [x] 5.6 Написать тесты для `SearchBar` в `frontend/__tests__/components/SearchBar.test.tsx`
    - Проверить вызов `router.push` с корректным URL поиска при сабмите формы
    - _Requirements: 7.13, 7.14_

- [x] 6. Checkpoint — убедиться что тесты простых и интерактивных компонентов проходят
  - Убедиться что все тесты из задач 4 и 5 проходят. Спросить пользователя если возникнут вопросы.

- [x] 7. Тесты сложных компонентов (API + роутинг + auth)
  - [x] 7.1 Написать тесты для `Navbar` в `frontend/__tests__/components/Navbar.test.tsx`
    - Проверить отображение ссылок login/register для неавторизованного пользователя
    - Проверить отображение username и опции logout для авторизованного пользователя
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.2 Написать тесты для `ArticleForm` в `frontend/__tests__/components/ArticleForm.test.tsx`
    - Проверить вызов create/update API с корректными аргументами при сабмите валидной формы
    - Проверить применение классов `.is-invalid` при ошибке 400 с полями ошибок
    - _Requirements: 8.4, 8.5, 8.6_

  - [ ]* 7.3 Написать property-тест: `parseTags` никогда не возвращает пустые строки (Property 5)
    - **Property 5: `parseTags` never returns empty strings**
    - **Validates: Requirements 9.5**

  - [ ]* 7.4 Написать property-тест: round-trip `parseTags` / `formatTags` (Property 6)
    - **Property 6: `parseTags` / `formatTags` round-trip**
    - **Validates: Requirements 9.7**

  - [x] 7.5 Написать тесты для `CommentSection` в `frontend/__tests__/components/CommentSection.test.tsx`
    - Проверить отображение существующих комментариев
    - Проверить вызов create comment API при сабмите авторизованным пользователем
    - _Requirements: 8.7, 8.8, 8.9_

  - [x] 7.6 Написать тесты для `ProfileEditForm` в `frontend/__tests__/components/ProfileEditForm.test.tsx`
    - Проверить вызов update profile API при сабмите валидной формы
    - _Requirements: 8.10, 8.11_

- [x] 8. Финальный checkpoint — покрытие и изоляция
  - Убедиться что все тесты проходят, покрытие ≥ 80% для `frontend/src/components/`, все моки изолированы через `jest.clearAllMocks()` в `beforeEach`. Спросить пользователя если возникнут вопросы.

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Дизайн использует TypeScript — все файлы тестов `.ts` / `.tsx`
- Property-based тесты используют библиотеку `fast-check`
- `jest.clearAllMocks()` должен вызываться в `beforeEach` каждого тестового файла
- Все API-вызовы мокируются через `jest.mock('@/lib/api')` и `jest.mock('@/lib/auth')`
- `window.confirm` мокируется через `jest.spyOn(window, 'confirm')`
